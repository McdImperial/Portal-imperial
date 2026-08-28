import { env } from "cloudflare:workers";

type RuntimeEnv = { WHATSAPP_ACCESS_TOKEN?: string; WHATSAPP_PHONE_NUMBER_ID?: string; WHATSAPP_API_VERSION?: string; N8N_ALERTS_WEBHOOK_URL?: string; N8N_ALERTS_WEBHOOK_SECRET?: string };
const runtime = () => env as unknown as RuntimeEnv;

export function providerStatus() {
  const current = runtime();
  return { whatsappConfigured: Boolean(current.WHATSAPP_ACCESS_TOKEN && current.WHATSAPP_PHONE_NUMBER_ID), n8nConfigured: Boolean(current.N8N_ALERTS_WEBHOOK_URL), simulation: !(current.WHATSAPP_ACCESS_TOKEN && current.WHATSAPP_PHONE_NUMBER_ID) };
}

export async function sendWhatsApp(phone: string, message: string) {
  const current = runtime();
  if (!current.WHATSAPP_ACCESS_TOKEN || !current.WHATSAPP_PHONE_NUMBER_ID) return { provider: "simulation", id: `sim_${crypto.randomUUID()}` };
  const version = current.WHATSAPP_API_VERSION || "v23.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${current.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${current.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: phone.replace(/\D/g, ""), type: "text", text: { preview_url: false, body: message } }),
  });
  const body = await response.json() as { messages?: { id: string }[]; error?: { code?: number; message?: string } };
  if (!response.ok) throw new Error(body.error?.message || `WhatsApp respondeu com ${response.status}.`);
  return { provider: "whatsapp", id: body.messages?.[0]?.id || "accepted" };
}

export async function sendN8n(payload: unknown) {
  const current = runtime();
  if (!current.N8N_ALERTS_WEBHOOK_URL) return { provider: "simulation", id: `sim_n8n_${crypto.randomUUID()}` };
  const response = await fetch(current.N8N_ALERTS_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json", ...(current.N8N_ALERTS_WEBHOOK_SECRET ? { Authorization: `Bearer ${current.N8N_ALERTS_WEBHOOK_SECRET}` } : {}) }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`n8n respondeu com ${response.status}.`);
  return { provider: "n8n", id: response.headers.get("x-execution-id") || "accepted" };
}
