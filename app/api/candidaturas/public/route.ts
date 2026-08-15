import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { talentCandidates } from "../../../../db/schema";

type CandidatePayload = {
  publicId?: number; name?: string; email?: string; contact?: string; admissionDate?: string; jobTitle?: string;
  cvName?: string; coverLetterName?: string; status?: string; createdAt?: string; updatedAt?: string;
};

export async function POST(request: Request) {
  const expected = (env as unknown as { PUBLIC_REQUEST_TOKEN?: string }).PUBLIC_REQUEST_TOKEN;
  if (!expected || request.headers.get("x-public-request-token") !== expected) return Response.json({ error: "Pedido não autorizado." }, { status: 401 });
  const body = await request.json() as CandidatePayload;
  if (!Number.isInteger(body.publicId) || !body.name?.trim() || !body.email?.trim() || !body.contact?.trim() || !body.admissionDate || !body.jobTitle || !body.cvName || !body.coverLetterName) return Response.json({ error: "Dados de candidatura incompletos." }, { status: 400 });
  const db = getDb();
  const marker = `public:${body.publicId}`;
  const [existing] = await db.select({ id: talentCandidates.id }).from(talentCandidates).where(eq(talentCandidates.cvKey, `${marker}:cv`)).limit(1);
  if (existing) return Response.json({ created: false, id: existing.id });
  const now = new Date().toISOString();
  const [candidate] = await db.insert(talentCandidates).values({
    name: body.name.trim(), email: body.email.trim().toLowerCase(), contact: body.contact.trim(), admissionDate: body.admissionDate,
    jobTitle: body.jobTitle, status: body.status || "Recebida", cvKey: `${marker}:cv`, cvName: body.cvName,
    coverLetterKey: `${marker}:cover`, coverLetterName: body.coverLetterName, createdAt: body.createdAt || now, updatedAt: body.updatedAt || body.createdAt || now,
  }).returning();
  return Response.json({ created: true, id: candidate.id }, { status: 201 });
}
