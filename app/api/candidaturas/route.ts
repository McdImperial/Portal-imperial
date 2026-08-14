import { asc, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { talentCandidates } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const statuses = ["Recebida", "Em análise", "Entrevista", "Admitido", "Não selecionado"] as const;
const maxFileSize = 8 * 1024 * 1024;

function canManageTalent(user: { role: string; department: string }) {
  return user.role === "admin" || user.role === "editor" && user.department === "pessoas";
}

function bucket() {
  const storage = (env as unknown as { CANDIDATURES?: R2Bucket }).CANDIDATURES;
  if (!storage) throw new Error("O armazenamento de candidaturas ainda não está disponível.");
  return storage;
}

function validatePdf(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File) || !file.size) throw new Error(`Anexe o ficheiro PDF da ${label}.`);
  if (file.size > maxFileSize) throw new Error(`O ficheiro da ${label} não pode ultrapassar 8 MB.`);
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) throw new Error(`O ficheiro da ${label} tem de ser PDF.`);
  return file;
}

function cleanFileName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "documento.pdf";
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManageTalent(auth.user)) return Response.json({ error: "Não tem permissão para consultar candidaturas." }, { status: 403 });
  const candidates = await getDb().select().from(talentCandidates).orderBy(desc(talentCandidates.createdAt), asc(talentCandidates.name));
  return Response.json({ candidates });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const contact = String(form.get("contact") || "").trim();
    const admissionDate = String(form.get("admissionDate") || "").trim();
    if (name.length < 2 || name.length > 100) throw new Error("Indique o nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) throw new Error("Indique um email válido.");
    if (contact.length < 6 || contact.length > 30) throw new Error("Indique um contacto válido.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(admissionDate)) throw new Error("Indique a data de admissão.");
    const cv = validatePdf(form.get("cv"), "CV");
    const coverLetter = validatePdf(form.get("coverLetter"), "carta de apresentação");
    const stamp = Date.now();
    const placeholder = `pending/${stamp}`;
    const [candidate] = await getDb().insert(talentCandidates).values({
      name, email, contact, admissionDate,
      cvKey: placeholder,
      cvName: cv.name,
      coverLetterKey: placeholder,
      coverLetterName: coverLetter.name,
      updatedAt: new Date().toISOString(),
    }).returning();
    const prefix = `candidaturas/${candidate.id}-${stamp}`;
    const cvKey = `${prefix}/cv-${cleanFileName(cv.name)}`;
    const coverLetterKey = `${prefix}/carta-${cleanFileName(coverLetter.name)}`;
    await bucket().put(cvKey, await cv.arrayBuffer(), { httpMetadata: { contentType: "application/pdf", contentDisposition: `attachment; filename="${cleanFileName(cv.name)}"` } });
    await bucket().put(coverLetterKey, await coverLetter.arrayBuffer(), { httpMetadata: { contentType: "application/pdf", contentDisposition: `attachment; filename="${cleanFileName(coverLetter.name)}"` } });
    await getDb().update(talentCandidates).set({ cvKey, coverLetterKey, updatedAt: new Date().toISOString() }).where(eq(talentCandidates.id, candidate.id));
    return Response.json({ message: "Candidatura recebida com sucesso." }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível enviar a candidatura." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  if (!canManageTalent(auth.user)) return Response.json({ error: "Não tem permissão para atualizar candidaturas." }, { status: 403 });
  const payload = await request.json() as { id?: number; status?: string };
  if (!payload.id || !statuses.includes(payload.status as typeof statuses[number])) return Response.json({ error: "Estado de candidatura inválido." }, { status: 400 });
  const [candidate] = await getDb().update(talentCandidates).set({ status: payload.status!, updatedAt: new Date().toISOString() }).where(eq(talentCandidates.id, payload.id)).returning();
  if (!candidate) return Response.json({ error: "Candidatura não encontrada." }, { status: 404 });
  return Response.json({ candidate });
}
