import { env } from "cloudflare:workers";
import { requireUser } from "../../auth/_lib";

type GoogleEnv = { GOOGLE_SERVICE_ACCOUNT_EMAIL?: string; GOOGLE_PRIVATE_KEY?: string };
const encoder = new TextEncoder();
const base64Url = (value: ArrayBuffer | string) => { const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value); let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); };
const fromPem = (pem: string) => Uint8Array.from(atob(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----|\s/g, "")), (character) => character.charCodeAt(0));
async function token(credentials: GoogleEnv) {
  if (!credentials.GOOGLE_SERVICE_ACCOUNT_EMAIL || !credentials.GOOGLE_PRIVATE_KEY) throw new Error("A leitura automática ainda não está configurada no alojamento.");
  const now = Math.floor(Date.now() / 1000), header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ iss: credentials.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const key = await crypto.subtle.importKey("pkcs8", fromPem(credentials.GOOGLE_PRIVATE_KEY), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = base64Url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(`${header}.${payload}`)));
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${payload}.${signature}` }) });
  if (!response.ok) throw new Error("Não foi possível autenticar a leitura da fatura."); return (await response.json() as { access_token: string }).access_token;
}
const imageBase64 = (bytes: Uint8Array) => { let result = ""; for (let index = 0; index < bytes.length; index += 0x8000) result += String.fromCharCode(...bytes.subarray(index, index + 0x8000)); return btoa(result); };
const amount = (value: string) => Number(value.replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", "."));
function extract(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const totalLines = lines.filter((line) => /(?:total(?:\s+a\s+pagar)?|valor\s+total|a\s+pagar)/i.test(line));
  const candidates = (totalLines.length ? totalLines : lines).flatMap((line) => [...line.matchAll(/(?:€\s*)?(\d{1,6}(?:[.\s]\d{3})*[,.]\d{2})(?:\s*€)?/g)].map((match) => amount(match[1]))).filter(Number.isFinite);
  const entity = lines.find((line) => /[A-Za-zÀ-ÿ]{3}/.test(line) && !/(fatura|invoice|nif|contribuinte|original|duplicado|data)/i.test(line) && line.length < 90) || "";
  const items = lines.filter((line) => /[A-Za-zÀ-ÿ]{3}/.test(line) && /\d/.test(line) && !/(total|iva|nif|contribuinte|data|fatura|pagamento|multibanco|troco)/i.test(line)).slice(0, 15);
  return { entity, items, totalAmount: candidates.length ? candidates[candidates.length - 1] : 0 };
}
export async function POST(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  try {
    const form = await request.formData(), file = form.get("image"); if (!(file instanceof File) || !file.type.startsWith("image/")) throw new Error("Capture ou selecione uma imagem válida."); if (file.size > 10 * 1024 * 1024) throw new Error("A imagem não pode exceder 10 MB.");
    const accessToken = await token(env as unknown as GoogleEnv); const response = await fetch("https://vision.googleapis.com/v1/images:annotate", { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ requests: [{ image: { content: imageBase64(new Uint8Array(await file.arrayBuffer())) }, features: [{ type: "DOCUMENT_TEXT_DETECTION" }] }] }) });
    if (!response.ok) throw new Error("Não foi possível ler a imagem. Confirme que a API Cloud Vision está ativa."); const body = await response.json() as { responses?: { fullTextAnnotation?: { text?: string }; error?: { message?: string } }[] }; const first = body.responses?.[0]; if (first?.error) throw new Error(first.error.message || "Erro na leitura da imagem."); const text = first?.fullTextAnnotation?.text || ""; if (!text) throw new Error("Não foi possível reconhecer texto nesta fotografia.");
    return Response.json({ ...extract(text), imageName: file.name });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível analisar a fotografia." }, { status: 400 }); }
}
