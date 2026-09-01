import { requireUser } from "../auth/_lib";
import { getSalesDashboard } from "../../../lib/sales-dashboard";
import { env } from "cloudflare:workers";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]); if (auth.error) return auth.error;
  const url = new URL(request.url); const month = url.searchParams.get("month");
  try { const data = await getSalesDashboard({ restaurant: url.searchParams.get("restaurant") ?? undefined, year: Number(url.searchParams.get("year")) || undefined, month: month && month !== "all" ? Number(month) : null, period: url.searchParams.get("period") ?? undefined }, env as unknown as { GOOGLE_SERVICE_ACCOUNT_EMAIL?: string; GOOGLE_PRIVATE_KEY?: string }); return Response.json(data, { headers: { "Cache-Control": "private, max-age=60" } }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível carregar o dashboard." }, { status: 502 }); }
}
