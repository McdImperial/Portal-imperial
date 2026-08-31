import { extractText } from "unpdf";

export type BillingProduct = { code: string; matchCode: string; name: string; unitPrice: number; value: number };
export type BillingAnalysisResult = {
  analysisVersion: number;
  totalHavi: number;
  totalMyStore: number;
  totalDifference: number;
  priceDifferences: Array<{ code: string; product: string; myStore: number; havi: number; difference: number }>;
  missingProducts: Array<{ code: string; product: string; value: number }>;
  rubrics: Record<string, number>;
  calculatedAt: string;
};

const moneyPattern = /-?\d{1,3}(?:[ .]\d{3})*,\d{2,4}/g;
const parseMoney = (raw: string) => Number(raw.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const matchCode = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "") || "0";
const normalizedName = (value: string) => normalize(value).replace(/\b(BEST BURGUER|BB|SDD|MH|MC)\b/g, " ").replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function moneyValues(line: string) {
  return Array.from(line.matchAll(moneyPattern), (match) => parseMoney(match[0])).filter(Number.isFinite);
}

function parseMyStoreTotal(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const totalLines = lines.filter((line) => /\bVALOR\s+TOTAL\b/i.test(line));
  for (const line of totalLines.reverse()) {
    const values = moneyValues(line);
    if (values.length) return values.at(-1) || 0;
  }
  const values = moneyValues(text);
  return values.length ? Math.max(...values.filter((value) => value >= 0)) : 0;
}

function parseHaviTotal(text: string) {
  const groupSection = text.match(/TOTAL POR GRUPO PRODUTO[\s\S]*?(?=TOTAL POR IVA)/i)?.[0] || "";
  const totalLines = groupSection.split(/\r?\n/).filter((line) => /^TOTAL\s/i.test(line.trim()));
  for (const line of totalLines) {
    const values = moneyValues(line);
    if (values.length) return values.at(-1) || 0;
  }
  return parseMyStoreTotal(text);
}

function parseProducts(text: string): BillingProduct[] {
  const rawLines = text.split(/\r?\n/).map((line) => line.replace(/^Entrega(?=\d)/i, "").replace(/\s+/g, " ").trim()).filter(Boolean);
  const lines: string[] = [];
  for (let index = 0; index < rawLines.length; index += 1) {
    const current = rawLines[index];
    const hasProductCode = /^(?:\d{1,5}[/-]\d{3}|\d{4,14})\b/.test(current);
    if (hasProductCode && moneyValues(current).length < 2 && rawLines[index + 1] && !/^(?:\d{1,5}[/-]\d{3}|\d{4,14})\b/.test(rawLines[index + 1])) {
      lines.push(`${current} ${rawLines[index + 1]}`);
      index += 1;
    } else lines.push(current);
  }
  const products = new Map<string, BillingProduct>();
  for (const line of lines) {
    const codeMatch = line.match(/^(\d{1,5}[/-]\d{3}|\d{4,14})\b/);
    const values = moneyValues(line);
    if (!codeMatch || !values.length || /ATCUD|NIF|DOCUMENTO|FATURA|ENCOMENDA/i.test(line)) continue;
    const code = codeMatch[1];
    const canonicalCode = matchCode(code);
    const afterCode = line.slice((codeMatch.index || 0) + code.length).trim().replace(/^\d{8,14}\s+/, "");
    const firstNumber = afterCode.search(/\s-?\d/);
    const name = (firstNumber > 2 ? afterCode.slice(0, firstNumber) : afterCode).replace(/[|;]+$/g, "").trim() || `Artigo ${code}`;
    const value = values.at(-1) || 0;
    const unitPrice = values.length >= 2 ? values.at(-2) || value : value;
    const current = products.get(canonicalCode);
    products.set(canonicalCode, { code, matchCode: canonicalCode, name: current?.name || name, unitPrice: current?.unitPrice || unitPrice, value: (current?.value || 0) + value });
  }
  return Array.from(products.values());
}

function rubricFor(product: BillingProduct) {
  const value = normalize(`${product.code} ${product.name}`);
  if (/PAPEL|GUARDANAPO|CAIXA|COPO|TAMPA|SACO|EMBALAGEM/.test(value)) return "Papel";
  if (/HAPPY|BRINQUEDO|LIVRO|TOY/.test(value)) return "Happy Meal";
  if (/TOMATE|ALFACE|CEBOLA|FRUTA|LEGUME|FRESC/.test(value)) return "Produtos frescos";
  if (/LIMPEZA|DETERGENTE|QUIMIC|LUVA|OPERACION/.test(value)) return "F. Operacionais";
  if (/CANETA|PAPEL A4|TONER|ADMINISTRAT/.test(value)) return "Material administrativo";
  if (/PAO|CARNE|QUEIJO|MOLHO|BATATA|BEBIDA|LEITE|CAFE|OVO|FRANGO|PEIXE|ALIMENT/.test(value)) return "Comida";
  return "Outros";
}

export async function calculateBillingAnalysis(haviBytes: ArrayBuffer, myStoreFiles: ArrayBuffer[]): Promise<BillingAnalysisResult> {
  const [{ text: haviText }, ...myStoreDocuments] = await Promise.all([
    extractText(new Uint8Array(haviBytes), { mergePages: true }),
    ...myStoreFiles.map((bytes) => extractText(new Uint8Array(bytes), { mergePages: true })),
  ]);
  const myStoreTexts = myStoreDocuments.map(({ text }) => text);
  const myStoreText = myStoreTexts.join("\n");
  const haviProducts = parseProducts(haviText);
  const myStoreProducts = parseProducts(myStoreText);
  const myStoreByCode = new Map(myStoreProducts.map((product) => [product.matchCode, product]));
  const myStoreByName = new Map(myStoreProducts.map((product) => [normalizedName(product.name), product]));
  const correspondingProduct = (havi: BillingProduct) => myStoreByCode.get(havi.matchCode) || myStoreByName.get(normalizedName(havi.name));
  const priceDifferences = haviProducts.flatMap((havi) => {
    const myStore = correspondingProduct(havi);
    if (!myStore) return [];
    const difference = havi.unitPrice - myStore.unitPrice;
    return Math.abs(difference) >= 0.01 ? [{ code: havi.code, product: havi.name, myStore: myStore.unitPrice, havi: havi.unitPrice, difference }] : [];
  });
  const haviHappyMeal = haviProducts.filter((product) => /HAPPY|TOY/i.test(product.name)).reduce((sum, product) => sum + product.value, 0);
  const myStoreHappyMeal = myStoreProducts.filter((product) => /HAPPY|TOY/i.test(product.name)).reduce((sum, product) => sum + product.value, 0);
  if (haviHappyMeal && myStoreHappyMeal && Math.abs(haviHappyMeal - myStoreHappyMeal) >= 0.01) priceDifferences.push({ code: "HAPPY-MEAL", product: "Happy Meal", myStore: myStoreHappyMeal, havi: haviHappyMeal, difference: haviHappyMeal - myStoreHappyMeal });
  const missingProducts = haviProducts.filter((product) => !correspondingProduct(product) && !(/HAPPY|TOY/i.test(product.name) && myStoreHappyMeal)).map(({ code, name: product, value }) => ({ code, product, value }));
  const rubrics: Record<string, number> = { "Comida": 0, "Papel": 0, "F. Operacionais": 0, "Material administrativo": 0, "Happy Meal": 0, "Produtos frescos": 0, "Outros": 0 };
  for (const product of haviProducts) rubrics[rubricFor(product)] += product.value;
  const totalHavi = parseHaviTotal(haviText);
  const totalMyStore = myStoreTexts.reduce((sum, text) => sum + parseMyStoreTotal(text), 0);
  return { analysisVersion: 2, totalHavi, totalMyStore, totalDifference: totalHavi - totalMyStore, priceDifferences, missingProducts, rubrics, calculatedAt: new Date().toISOString() };
}
