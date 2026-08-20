type DriveEnv = { GOOGLE_SERVICE_ACCOUNT_EMAIL?: string; GOOGLE_PRIVATE_KEY?: string; GOOGLE_DRIVE_PARENT_FOLDER_ID?: string };

const encoder = new TextEncoder();
const base64Url = (value: ArrayBuffer | string) => {
  const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const fromPem = (pem: string) => Uint8Array.from(atob(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----|\s/g, "")), (character) => character.charCodeAt(0));

async function accessToken(env: DriveEnv) {
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/drive", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const key = await crypto.subtle.importKey("pkcs8", fromPem(env.GOOGLE_PRIVATE_KEY), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = base64Url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(`${header}.${payload}`)));
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${payload}.${signature}` }) });
  if (!response.ok) throw new Error("Não foi possível autenticar o arquivo Google Drive.");
  return (await response.json() as { access_token: string }).access_token;
}

async function folder(token: string, name: string, parent: string) {
  const query = encodeURIComponent(`name='${name.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const existing = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&spaces=drive`, { headers: { Authorization: `Bearer ${token}` } });
  const files = await existing.json() as { files?: { id: string }[] };
  if (files.files?.[0]) return files.files[0].id;
  const created = await fetch("https://www.googleapis.com/drive/v3/files", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }) });
  if (!created.ok) throw new Error("Não foi possível criar a pasta no Google Drive. Confirme a partilha da pasta principal.");
  return (await created.json() as { id: string }).id;
}

export async function archiveInGoogleDrive(env: DriveEnv, deliveryDate: string, supplier: string, documentType: string, fileName: string, contentType: string, body: ArrayBuffer) {
  const token = await accessToken(env); const parent = env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!token || !parent) return;
  const [year, month, day] = deliveryDate.split("-");
  const yearFolder = await folder(token, year, parent); const monthFolder = await folder(token, month, yearFolder); const dayFolder = await folder(token, day, monthFolder); const supplierFolder = await folder(token, supplier, dayFolder); const typeFolder = await folder(token, documentType === "havi" ? "Fatura fornecedor" : "My Store", supplierFolder);
  const boundary = `portal-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: fileName, parents: [typeFolder] });
  const payload = new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`, body, `\r\n--${boundary}--`]);
  const uploaded = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body: payload });
  if (!uploaded.ok) throw new Error("Não foi possível guardar o ficheiro no Google Drive.");
}
