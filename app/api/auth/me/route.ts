import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { getCurrentUser } from "../_lib";

export async function GET(request: Request) {
  const rows = await getDb().select({ id: users.id }).from(users).limit(1);
  return Response.json({ user: await getCurrentUser(request), setupRequired: rows.length === 0 });
}
