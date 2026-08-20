import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { billingDocuments } from "../../../db/schema";
import { requireUser } from "../auth/_lib";

const maxFileSize = 12 * 1024 * 1024;
const cleanName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "documento";
function storage() { const bucket = (env as unknown as { CANDIDATURES?: R2Bucket }).CANDIDATURES; if (!bucket) throw new Error("O armazenamento de documentos ainda não está disponível."); return bucket; }
function canUpload(user: { role: string }) { return user.role === "admin" || user.role === "editor"; }
function validateFile(raw: FormDataEntryValue, type: string) {
  if (!(raw instanceof File) || !raw.size) throw new Error("Selecione pelo menos um ficheiro.");
  if (raw.size > maxFileSize) throw new Error(`O ficheiro ${raw.name} não pode ultrapassar 12 MB.`);
  const name = raw.name.toLowerCase(); const pdf = raw.type === "application/pdf" || name.endsWith(".pdf");
  const spreadsheet = /\.(xlsx|xls|csv)$/.test(name) || ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(raw.type);
  if (type === "havi" && !pdf) throw new Error("A fatura HAVI deve ser carregada em PDF.");
  if (type === "mystore" && !(pdf || spreadsheet)) throw new Error("Os documentos My Store devem ser PDF, Excel ou CSV.");
  return raw;
}

export async function GET(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  const deliveryDate = new URL(request.url).searchParams.get("deliveryDate");
  if (!deliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) return Response.json({ error: "Data de entrega inválida." }, { status: 400 });
  return Response.json({ documents: await getDb().select().from(billingDocuments).where(eq(billingDocuments.deliveryDate, deliveryDate)).orderBy(desc(billingDocuments.createdAt)) });
}

export async function POST(request: Request) {
  const auth = await requireUser(request); if (auth.error) return auth.error;
  if (!canUpload(auth.user)) return Response.json({ error: "Não tem permissão para carregar documentos." }, { status: 403 });
  try {
    const form = await request.formData(); const deliveryDate = String(form.get("deliveryDate") || ""); const supplier = String(form.get("supplier") || "HAVI"); const documentType = String(form.get("documentType") || ""); const files = form.getAll("documents");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || !["HAVI", "Maia Paper", "Air Liquide"].includes(supplier) || !["havi", "mystore"].includes(documentType)) throw new Error("Dados de entrega inválidos.");
    if (!files.length || documentType === "havi" && files.length !== 1) throw new Error(documentType === "havi" ? "Carregue apenas uma fatura HAVI por entrega." : "Selecione pelo menos um ficheiro.");
    const created = [];
    for (const raw of files) { const file = validateFile(raw, documentType); const name = cleanName(file.name); const [year, month, day] = deliveryDate.split("-"); const supplierFolder = supplier.toLowerCase().replace(/\s+/g, "-"); const fileKey = `faturacao/${year}/${month}/${day}/${supplierFolder}/${documentType}/${Date.now()}-${crypto.randomUUID()}-${name}`; await storage().put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream", contentDisposition: `attachment; filename="${name}"` } }); const [document] = await getDb().insert(billingDocuments).values({ deliveryDate, documentType, fileKey, fileName: file.name, contentType: file.type || "application/octet-stream", fileSize: file.size, uploadedBy: auth.user.id, uploadedByName: auth.user.name, createdAt: new Date().toISOString() }).returning(); created.push(document); }
    return Response.json({ documents: created }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Não foi possível carregar os documentos." }, { status: 400 }); }
}
