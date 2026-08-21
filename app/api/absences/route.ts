import absencesData from "../../data/absences-data.json";
import { requireUser } from "../auth/_lib";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  return Response.json(absencesData, { headers: { "Cache-Control": "private, no-store" } });
}
