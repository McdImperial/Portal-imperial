import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { sharedFolders } from "../../../../db/schema";
import { requireUser } from "../../auth/_lib";

const defaultFolders = [
  { id: "inventario", name: "Relatórios de inventário", description: "Comida, papel, limpeza e material de escritório", url: "https://drive.google.com/drive/folders/1W_C3S1yUFZXGdmETHBesGHwJwk3xoeaZ?usp=sharing", fileCount: 8 },
  { id: "tell-the-arches", name: "Tell The Arches", description: "Relatórios mensais e acumulado YTD", url: "https://drive.google.com/drive/folders/1SAYTBKa7b9Zt7WdoCKFMB3VP4CWbFhTV?usp=sharing", fileCount: 8 },
  { id: "gdr-servico-cliente", name: "GDR Serviço Cliente", description: "Folha GDR e pasta Tell The Arches", url: "https://drive.google.com/drive/folders/1SF6Mk9dVDmUaQ5EyB_LLbkDFOVfdQdP8?usp=sharing", fileCount: 2 },
  { id: "gdr-qualidade-produtos", name: "GDR Qualidade & Produtos", description: "Folha GDR e relatórios de custo de inventário", url: "https://drive.google.com/drive/folders/1yD7oRRAMcCJlVAlw_6wWUCEkuMvCArlW?usp=sharing", fileCount: 2 },
];

async function ensureFolders() {
  const db = getDb();
  const existing = await db.select({ id: sharedFolders.id }).from(sharedFolders);
  const existingIds = new Set(existing.map((folder) => folder.id));
  const missingFolders = defaultFolders.filter((folder) => !existingIds.has(folder.id));
  if (missingFolders.length) await db.insert(sharedFolders).values(missingFolders);
  return db.select().from(sharedFolders).orderBy(asc(sharedFolders.name));
}

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;
    return Response.json({ folders: await ensureFolders() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar pastas" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser(request, ["admin"]);
    if (auth.error) return auth.error;
    const payload = (await request.json()) as { folders?: { id: string; fileCount: number }[] };
    if (!payload.folders?.length) return Response.json({ error: "Pastas obrigatórias" }, { status: 400 });
    const db = getDb();
    for (const folder of payload.folders) {
      const fileCount = Math.max(0, Math.round(Number(folder.fileCount) || 0));
      await db.update(sharedFolders).set({ fileCount, updatedAt: new Date().toISOString() }).where(eq(sharedFolders.id, folder.id));
    }
    return Response.json({ folders: await db.select().from(sharedFolders).orderBy(asc(sharedFolders.name)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar pastas" }, { status: 500 });
  }
}
