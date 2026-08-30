import { extractText } from "unpdf";

export type BillingProduct = { code: string; name: string; value: number };
export type BillingAnalysisResult = {
  totalHavi: number;
  totalMyStore: number;
  totalDifference: number;
  priceDifferences: Array<{ code: string; product: string; myStore: number; havi: number; difference: number }>;
  missingProducts: Array<{ code: string; product: string; value: number }>;
  rubrics: Record<string, number>;
  calculatedAt: string;
};

const moneyPattern = /-?\d{1,3}(?:[ .]\d{3})*,\d{2}/g;
const parseMoney = (raw: string) => Number(raw.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

function moneyValues(line: string) {
  return Array.from(line.matchAll(moneyPattern), (match) => parseMoney(match[0])).filter(Number.isFinite);
}

function parseTotal(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const totalLines = lines.filter((line) => /\bTOTAL(?:\s+A\s+PAGAR|\s+DOCUMENTO|\s+FATURA)?\b/i.test(line));
  for (const line of totalLines.reverse()) {
    const values = moneyValues(line);
    if (values.length) return values.at(-1) || 0;
  }
  const values = moneyValues(text);
  return values.length ? Math.max(...values.filter((value) => value >= 0)) : 0;
}

function parseProducts(text: string): BillingProduct[] {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const products = new Map<string, BillingProduct>();
  for (const line of lines) {
    const codeMatch = line.match(/\b(\d{5}-\d{3}|\d{4,8})\b/);
    const values = moneyValues(line);
    if (!codeMatch || !values.length || /ATCUD|NIF|DOCUMENTO|FATURA|ENCOMENDA/i.test(line)) continue;
    const code = codeMatch[1];
    const afterCode = line.slice((codeMatch.index || 0) + code.length).trim();
    const firstNumber = afterCode.search(/\s-?\d/);
    const name = (firstNumber > 2 ? afterCode.slice(0, firstNumber) : afterCode).replace(/[|;]+$/g, "").trim() || `Artigo ${code}`;
    const value = values.at(-1) || 0;
    const current = products.get(code);
    products.set(code, { code, name: current?.name || name, value: (current?.value || 0) + value });
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

export async function calculateBillingAnalysis(haviBytes: ArrayBuffer, myStoreBytes: ArrayBuffer): Promise<BillingAnalysisResult> {
  const [{ text: haviText }, { text: myStoreText }] = await Promise.all([
    extractText(new Uint8Array(haviBytes), { mergePages: true }),
    extractText(new Uint8Array(myStoreBytes), { mergePages: true }),
  ]);
  const haviProducts = parseProducts(haviText);
  const myStoreProducts = parseProducts(myStoreText);
  const myStoreByCode = new Map(myStoreProducts.map((product) => [product.code, product]));
  const priceDifferences = haviProducts.flatMap((havi) => {
    const myStore = myStoreByCode.get(havi.code);
    if (!myStore) return [];
    const difference = havi.value - myStore.value;
    return Math.abs(difference) >= 0.005 ? [{ code: havi.code, product: havi.name, myStore: myStore.value, havi: havi.value, difference }] : [];
  });
  const missingProducts = haviProducts.filter((product) => !myStoreByCode.has(product.code)).map(({ code, name: product, value }) => ({ code, product, value }));
  const rubrics: Record<string, number> = { "Comida": 0, "Papel": 0, "F. Operacionais": 0, "Material administrativo": 0, "Happy Meal": 0, "Produtos frescos": 0, "Outros": 0 };
  for (const product of haviProducts) rubrics[rubricFor(product)] += product.value;
  const totalHavi = parseTotal(haviText);
  const totalMyStore = parseTotal(myStoreText);
  return { totalHavi, totalMyStore, totalDifference: totalHavi - totalMyStore, priceDifferences, missingProducts, rubrics, calculatedAt: new Date().toISOString() };
}
