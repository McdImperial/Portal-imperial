import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../db/shifts";

export async function GET() {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const result = await env.DB.prepare(
      "SELECT id, name FROM areas WHERE enabled = 1 ORDER BY id"
    ).all();

    return NextResponse.json({ areas: result.results || [] });
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json({ error: "Erro ao buscar áreas", areas: [] }, { status: 500 });
  }
}
