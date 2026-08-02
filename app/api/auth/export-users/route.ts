import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";

const encoder = new TextEncoder();
const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

function encodePayload(value: unknown) {
  const bytes = encoder.encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET() {
  if (!env.SHARED_AUTH_SECRET) return Response.json({ error: "Sincronização não configurada." }, { status: 503 });
  const rows = await getDb().select({ name: users.name, login: users.login, passwordHash: users.passwordHash, role: users.role, status: users.status }).from(users);
  const payload = encodePayload({ generatedAt: new Date().toISOString(), users: rows });
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.SHARED_AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = toHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
  return Response.json({ payload, signature, count: rows.length });
}
