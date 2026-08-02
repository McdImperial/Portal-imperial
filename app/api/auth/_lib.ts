import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { sessions, users } from "../../../db/schema";

export type AppRole = "admin" | "editor" | "consulta";
const COOKIE = "imperial_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();
const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const fromHex = (value: string) => new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);

async function sha256(value: string) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 }, key, 256);
  return `${toHex(salt)}:${toHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, expected] = stored.split(":");
  if (!saltHex || !expected) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: 210_000 }, key, 256));
  const actual = toHex(bits);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i += 1) difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}

function readCookie(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || null;
}

export async function createSession(userId: number) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await getDb().insert(sessions).values({ id: await sha256(token), userId, expiresAt });
  return { token, expiresAt };
}

export function sessionCookie(token: string) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function deleteRequestSession(request: Request) {
  const token = readCookie(request);
  if (token) await getDb().delete(sessions).where(eq(sessions.id, await sha256(token)));
}

export async function getCurrentUser(request: Request) {
  const token = readCookie(request);
  if (!token) return null;
  const db = getDb();
  const [session] = await db.select().from(sessions).where(eq(sessions.id, await sha256(token))).limit(1);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    if (session) await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || user.status !== "ativo") return null;
  return { id: user.id, login: user.login, role: user.role as AppRole, status: user.status };
}

export async function requireUser(request: Request, roles?: AppRole[]) {
  const user = await getCurrentUser(request);
  if (!user) return { error: Response.json({ error: "Sessão inválida. Inicie sessão novamente." }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) return { error: Response.json({ error: "Não tem permissão para esta ação." }, { status: 403 }) };
  return { user };
}
