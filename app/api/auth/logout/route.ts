import { clearSessionCookie, deleteRequestSession } from "../_lib";

export async function POST(request: Request) {
  await deleteRequestSession(request);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
