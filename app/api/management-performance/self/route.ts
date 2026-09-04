import { getDb } from "../../../../db";
import { managementPerformanceEvaluations } from "../../../../db/schema";

const managers = ["Tiago Soutelo", "Ricardo Teixeira", "Susana Torres", "Sara Sousa", "Miguel Matela", "Soraia Martins", "André Martins", "Liliana Pacheco", "Diogo Cabral", "Sílvia Tavares", "Ana Sousa"];
const period = "2.º Quadrimestre 2026";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { managerName?:string; period?:string; scores?:Record<string,number>; quantitativeScore?:number; qualitativeRating?:string; strengths?:string; improvements?:string };
    if (!body.managerName || !managers.includes(body.managerName)) return Response.json({ error:"Selecione o seu nome." }, { status:400 });
    if (body.period !== period) return Response.json({ error:"Período de avaliação inválido." }, { status:400 });
    if (!body.scores || Object.keys(body.scores).length !== 16 || Object.values(body.scores).some((score)=>![1,2,3,4].includes(Number(score)))) return Response.json({ error:"Preencha todos os critérios." }, { status:400 });
    const [evaluation] = await getDb().insert(managementPerformanceEvaluations).values({ managerName:body.managerName, period, scores:JSON.stringify(body.scores), quantitativeScore:Number(body.quantitativeScore)||0, qualitativeRating:body.qualitativeRating||"", evaluationType:"Autoavaliação", strengths:body.strengths?.trim()||"", improvements:body.improvements?.trim()||"", createdBy:0, createdByName:body.managerName, updatedAt:new Date().toISOString() }).returning();
    return Response.json({ evaluation, message:"Autoavaliação enviada com sucesso." }, { status:201 });
  } catch { return Response.json({ error:"Não foi possível guardar a autoavaliação." }, { status:400 }); }
}
