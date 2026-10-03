import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { requireChatGPTUser } from "../../../../app/chatgpt-auth";
import { ensureShiftsSchema } from "../../../../db/shifts";

export async function GET() {
  try {
    await requireChatGPTUser("/admin");
    await ensureShiftsSchema();

    const result = await env.DB.prepare(
      "SELECT id, name FROM shift_types WHERE enabled = 1 ORDER BY id"
    ).all();

    return NextResponse.json({ shiftTypes: result.results || [] });
  } catch (error) {
    console.error("Error fetching shift types:", error);
    return NextResponse.json({ error: "Erro ao buscar tipos de turno", shiftTypes: [] }, { status: 500 });
  }
}
