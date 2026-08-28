"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import inventoryProductsData from "./data/inventory-products.json";
import objectivesDataJson from "./data/objectives-data.json";
import r2pDataJson from "./data/r2p-data.json";
import tellTheArchesDataJson from "./data/tell-the-arches.json";
import teamMilestonesDataJson from "./data/team-milestones.json";
import AlertsCenter from "./alerts-center";

type View = "resumo" | "tarefas" | "objetivos" | "areas" | "areasglobais" | "equipa" | "custos" | "faturacao" | "r2p" | "tellarches" | "talento" | "haccp" | "gerenteloja" | "alertas" | "desenvolvimento" | "configuracoes";
type Department = "global" | "qualidade" | "pessoas" | "cliente" | "manutencao";
type EvaluationDepartment = Exclude<Department, "global">;
type UserDepartment = Exclude<Department, "global"> | "";
type TaskStatus = "Por fazer" | "Em curso" | "Não realizada" | "Concluído";
type AppRole = "admin" | "editor" | "consulta";
type BillingDocument = { id: number; deliveryDate: string; documentType: "havi" | "mystore"; fileName: string; fileSize: number };
type BillingSupplier = "HAVI" | "Maia Paper" | "Air Liquide";
type BillingDelivery = { id: string; date: string; label: string; supplier: BillingSupplier };
type AppUser = { id: number; name: string; login: string; role: AppRole; department: UserDepartment; status: string };
type ManagedUser = AppUser & { createdAt: string; approvedAt: string | null };
type CleaningIntervention = {
  id: number;
  department: "qualidade" | "cliente" | "pessoas" | "manutencao";
  area: string;
  kind: "Limpeza" | "Manutenção";
  scheduledDate: string;
  estimatedHours: number;
  resources: string;
  status: "Agendada" | "Encerrada";
  createdBy: number;
  createdByName: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type InterventionDraft = { area: string; kind: "Limpeza" | "Manutenção"; scheduledDate: string; estimatedHours: string; resources: string };
type AreaRating = "" | "Bom" | "Aceitável" | "Necessita Melhorar" | "Não aceitável";
type AreaEvaluation = { id: number; month: string; department: EvaluationDepartment; area: string; cleaningRating: AreaRating; maintenanceRating: AreaRating; evaluatedByName: string; evaluatedAt: string };
type AreaEvaluationDraft = Record<string, { cleaningRating: AreaRating; maintenanceRating: AreaRating }>;

type Task = {
  id: number;
  title: string;
  area: string;
  due: string;
  assignee: string;
  assigneeName?: string;
  priority: "Alta" | "Média" | "Baixa";
  done: boolean;
  status?: TaskStatus;
  department: Exclude<Department, "global">;
};

const initialTasks: Task[] = [
  { id: 1, title: "Verificação e validação WebHACCP", area: "Qualidade", due: "Semanal", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 2, title: "LV Segurança Alimentar", area: "Segurança alimentar", due: "Mensal · até dia 10", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 3, title: "Verificação controlo Faturação", area: "Controlo", due: "Semanal", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 4, title: "Download BD My Store", area: "Dados", due: "Semanal", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 5, title: "Controlo Refeições", area: "Controlo", due: "Semanal", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 6, title: "Controlo Perdas", area: "Perdas", due: "Semanal", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Alta", done: false, department: "qualidade" },
  { id: 7, title: "Inventário e Controlo OPS", area: "OPS", due: "Semanal", assignee: "ST", assigneeName: "Sílvia Tavares", priority: "Alta", done: false, department: "qualidade" },
  { id: 8, title: "Preparação OPS - Semana", area: "OPS", due: "Semanal", assignee: "ST", assigneeName: "Sílvia Tavares", priority: "Média", done: false, department: "qualidade" },
  { id: 9, title: "Análise Desvios Inventário", area: "Inventário", due: "Semanal", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 10, title: "Encomenda Air Liquide", area: "Encomendas", due: "Mensal", assignee: "ST", assigneeName: "Sílvia Tavares", priority: "Baixa", done: false, department: "qualidade" },
  { id: 11, title: "Encomenda Maiapaper", area: "Encomendas", due: "Mensal", assignee: "ST", assigneeName: "Sílvia Tavares", priority: "Baixa", done: false, department: "qualidade" },
  { id: 12, title: "Gestão e Manutenção Layouts", area: "Layouts", due: "Mensal", assignee: "SU", assigneeName: "Susana Torres", priority: "Média", done: false, department: "qualidade" },
  { id: 13, title: "Organização e atualização de listas de inventário", area: "Inventário", due: "Mensal", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 14, title: "LV de Campanhas e Preparação", area: "Campanhas", due: "Mensal", assignee: "SU", assigneeName: "Susana Torres", priority: "Média", done: false, department: "qualidade" },
  { id: 15, title: "Controlo e gestão de Fardas", area: "Fardas", due: "Quinzenal", assignee: "ST", assigneeName: "Sílvia Tavares", priority: "Média", done: false, department: "qualidade" },
  { id: 16, title: "Confirmar plano de formação", area: "Desenvolvimento", due: "Hoje, 14:30", assignee: "CM", priority: "Média", done: false, department: "pessoas" },
  { id: 17, title: "Atualizar mapa de férias", area: "Planeamento", due: "Concluída ontem", assignee: "TS", priority: "Baixa", done: true, department: "pessoas" },
  { id: 18, title: "Responder a pedidos críticos", area: "Apoio ao cliente", due: "Hoje, 12:00", assignee: "JS", priority: "Alta", done: false, department: "cliente" },
  { id: 19, title: "Rever satisfação semanal", area: "Experiência", due: "Amanhã", assignee: "ML", priority: "Média", done: false, department: "cliente" },
  { id: 20, title: "Intervenção na câmara frigorífica", area: "Equipamentos", due: "Hoje, 16:00", assignee: "AR", priority: "Alta", done: false, department: "manutencao" },
  { id: 21, title: "Atualizar plano preventivo", area: "Prevenção", due: "Concluída ontem", assignee: "CM", priority: "Média", done: true, department: "manutencao" },
  { id: 22, title: "Rever acessos de novos colaboradores", area: "IT", due: "Hoje, 15:00", assignee: "TS", priority: "Alta", done: false, department: "manutencao" },
  { id: 23, title: "Teste mensal de emergência", area: "Segurança", due: "Concluída às 10:20", assignee: "JS", priority: "Média", done: true, department: "manutencao" },
];

const departments: { id: Department; label: string; short: string; icon: string }[] = [
  { id: "qualidade", label: "Qualidade & Produtos", short: "QP", icon: "🧪" },
  { id: "pessoas", label: "Pessoas", short: "PE", icon: "👥" },
  { id: "cliente", label: "Serviço Cliente", short: "SC", icon: "🎧" },
  { id: "manutencao", label: "Manutenção Seg. & IT", short: "MSI", icon: "🛠️" },
];
const qualityCleaningAreas = ["Positiva / Negativa", "Stock secos", "Aquário", "Balneários Funcionários", "Sala de pausa", "Sala de HM", "Balneários de Gerentes"] as const;
const serviceCleaningAreas = ["Balcão", "Bebidas", "Corredor interno P 0", "Escadas piso 0", "Corredor Escritório", "Escadas Escritório"] as const;
const peopleCleaningAreas = ["Sala piso 0", "Sala piso -1", "WC Clientes", "Cantinho RPs", "Corredor interno P -1"] as const;
const maintenanceCleaningAreas = ["Cozinha", "Copa", "Sala de peças", "Sala de lixo", "Zona Técnica", "Esplanada"] as const;
const cleaningAreasByDepartment = { qualidade: qualityCleaningAreas, cliente: serviceCleaningAreas, pessoas: peopleCleaningAreas, manutencao: maintenanceCleaningAreas } as const;
const emptyInterventionDraft = (area: string): InterventionDraft => ({ area, kind: "Limpeza", scheduledDate: "", estimatedHours: "2", resources: "" });
const areaRatings: AreaRating[] = ["", "Bom", "Aceitável", "Necessita Melhorar", "Não aceitável"];
const areaRatingIcons: Record<AreaRating, string> = { "": "⚪", "Bom": "🟢", "Aceitável": "🔵", "Necessita Melhorar": "🟠", "Não aceitável": "🔴" };
const evaluationKey = (department: EvaluationDepartment, area: string) => `${department}::${area}`;
const areaRatingScores: Record<Exclude<AreaRating, "">, number> = { "Bom": 100, "Aceitável": 75, "Necessita Melhorar": 50, "Não aceitável": 0 };

function areaRatingPercentage(ratings: AreaRating[]): number | null {
  const completed = ratings.filter((rating): rating is Exclude<AreaRating, ""> => Boolean(rating));
  if (!completed.length) return null;
  return Math.round(completed.reduce((sum, rating) => sum + areaRatingScores[rating], 0) / completed.length);
}

function globalAreaRating(ratings: AreaRating[]): AreaRating {
  const percentage = areaRatingPercentage(ratings);
  if (percentage === null) return "";
  if (percentage >= 90) return "Bom";
  if (percentage >= 75) return "Aceitável";
  if (percentage >= 50) return "Necessita Melhorar";
  return "Não aceitável";
}

const statusOptions: TaskStatus[] = ["Por fazer", "Em curso", "Não realizada", "Concluído"];
const ownerOptions = [
  { initials: "SU", name: "Susana Torres" },
  { initials: "DC", name: "Diogo Cabral" },
  { initials: "ST", name: "Sílvia Tavares" },
  { initials: "TS", name: "Tiago Soutelo" },
];

function statusClass(status: string) {
  return status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll(" ", "-");
}

function userInitials(name: string, email: string) {
  const initials = name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("");
  return (initials || email.slice(0, 2)).toUpperCase();
}

const departmentProfiles = {
  global: {
    objectives: [{ label: "Execução transversal", value: 76, target: "Meta: 90%", tone: "mint" }, { label: "Objetivos no verde", value: 84, target: "Meta: 90%", tone: "blue" }, { label: "Planos sem desvios", value: 71, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Qualidade & Produtos", status: "Atenção", detail: "15 tarefas por concluir", percent: 71, tone: "attention" }, { name: "Pessoas", status: "Em dia", detail: "Objetivos atualizados", percent: 92, tone: "good" }, { name: "Serviço Cliente", status: "Atenção", detail: "2 pedidos críticos", percent: 68, tone: "attention" }, { name: "Manutenção Seg. & IT", status: "Em curso", detail: "2 ações planeadas", percent: 78, tone: "progress" }],
  },
  qualidade: {
    objectives: [{ label: "Food", value: 0, display: "—", target: "Meta de julho por definir", tone: "mint" }, { label: "Paper", value: 0, display: "—", target: "Meta de julho por definir", tone: "blue" }, { label: "OPS", value: 0, display: "3 850", target: "Meta registada para julho", tone: "amber" }, { label: "Perdas", value: 0, display: "0,45", target: "Meta registada para julho", tone: "amber" }],
    zones: [{ name: "Positiva / Negativa", status: "OK", detail: "Estado de julho", percent: 100, tone: "good" }, { name: "Stock secos", status: "OK", detail: "Estado de julho", percent: 100, tone: "good" }, { name: "Aquário", status: "Necessita melhorar", detail: "Ação de melhoria necessária", percent: 60, tone: "attention" }, { name: "Sala de HM", status: "Não OK", detail: "Intervenção prioritária", percent: 25, tone: "attention" }, { name: "Sala de pausa", status: "OK", detail: "Estado de julho", percent: 100, tone: "good" }, { name: "Balneários Funcionários", status: "OK", detail: "Estado de julho", percent: 100, tone: "good" }, { name: "Balneários de Gerentes", status: "OK", detail: "Estado de julho", percent: 100, tone: "good" }],
  },
  pessoas: {
    objectives: [{ label: "Formações concluídas", value: 81, target: "Meta: 90%", tone: "mint" }, { label: "Absentismo controlado", value: 94, target: "Meta: 95%", tone: "blue" }, { label: "Avaliações realizadas", value: 72, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Recrutamento", status: "Em curso", detail: "2 processos ativos", percent: 76, tone: "progress" }, { name: "Formação", status: "Em dia", detail: "Plano mensal confirmado", percent: 92, tone: "good" }, { name: "Planeamento", status: "Em dia", detail: "Mapa atualizado", percent: 100, tone: "good" }, { name: "Clima & Desenvolvimento", status: "Atenção", detail: "1 ação pendente", percent: 67, tone: "attention" }],
  },
  cliente: {
    objectives: [{ label: "Pedidos no SLA", value: 86, target: "Meta: 95%", tone: "mint" }, { label: "Satisfação do cliente", value: 91, target: "Meta: 92%", tone: "blue" }, { label: "Resolução ao 1.º contacto", value: 74, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Pedidos e reclamações", status: "Atenção", detail: "2 casos críticos", percent: 68, tone: "attention" }, { name: "Experiência do cliente", status: "Em curso", detail: "Revisão semanal amanhã", percent: 82, tone: "progress" }, { name: "Comunicação", status: "Em dia", detail: "Modelos atualizados", percent: 100, tone: "good" }, { name: "Indicadores de serviço", status: "Em dia", detail: "Dados atualizados hoje", percent: 94, tone: "good" }],
  },
  manutencao: {
    objectives: [{ label: "Preventivas realizadas", value: 79, target: "Meta: 95%", tone: "mint" }, { label: "Sistemas disponíveis", value: 99, target: "Meta: 99,5%", tone: "blue" }, { label: "Ações de segurança", value: 76, target: "Meta: 90%", tone: "amber" }],
    zones: [{ name: "Equipamentos críticos", status: "Atenção", detail: "1 intervenção aberta", percent: 62, tone: "attention" }, { name: "Manutenção preventiva", status: "Em curso", detail: "Plano a 79%", percent: 79, tone: "progress" }, { name: "Segurança no trabalho", status: "Em dia", detail: "Teste concluído hoje", percent: 96, tone: "good" }, { name: "Acessos & Identidades", status: "Atenção", detail: "3 acessos por rever", percent: 65, tone: "attention" }, { name: "Infraestrutura IT", status: "Em dia", detail: "Sistemas estáveis", percent: 99, tone: "good" }, { name: "Instalações", status: "Em dia", detail: "Ronda concluída", percent: 100, tone: "good" }],
  },
} satisfies Record<Department, { objectives: { label: string; value: number; display?: string; target: string; tone: string }[]; zones: { name: string; status: string; detail: string; percent: number; tone: string }[] }>;

const viewLabels: Record<View, string> = {
  resumo: "Visão geral",
  tarefas: "Todas as tarefas",
  objetivos: "Objetivos mensais",
  areas: "Áreas de limpeza",
  areasglobais: "Áreas",
  equipa: "Equipa",
  custos: "Custo, Comida, Papel e OPS",
  faturacao: "Controlo de faturação",
  r2p: "Tempos de serviço · R2P",
  tellarches: "Tell The Arches",
  talento: "Gestão Talento",
  haccp: "Portal HACCP",
  gerenteloja: "Gerente Loja",
  alertas: "Central de Alertas",
  desenvolvimento: "Em desenvolvimento",
  configuracoes: "Configurações",
};

type RestaurantObjective = {
  theme: string;
  target?: string;
  result?: string;
  classification?: string;
  possiblePoints?: number;
  achievedPoints?: number;
  achievedPercent?: number;
};

type ObjectiveResult = "Superado" | "Atingido" | "Próximo" | "Não Atingido" | "Por atualizar";
type ObjectiveMonthSnapshot = { monthlyPercent: number; objectives: RestaurantObjective[] };

const objectiveVisuals: Record<string, { icon: string; label: string; tone: string }> = {
  "Delivery T Time": { icon: "⏱️", label: "Cronómetro de entrega", tone: "blue" },
  "Delivery C SAT": { icon: "😊", label: "Satisfação do cliente", tone: "mint" },
  "Delivery Exatidão": { icon: "🎯", label: "Exatidão do pedido", tone: "coral" },
  Turnover: { icon: "🔄", label: "Rotatividade da equipa", tone: "purple" },
  Staffing: { icon: "👥", label: "Equipa", tone: "blue" },
  Food: { icon: "🍔", label: "Comida", tone: "gold" },
  Paper: { icon: "📦", label: "Embalagens de papel", tone: "blue" },
  Perdas: { icon: "⚠️", label: "Perdas", tone: "coral" },
  AOLs: { icon: "🎓", label: "Aprendizagem e formação", tone: "purple" },
  OPS: { icon: "⚙️", label: "Operações", tone: "mint" },
  Qualitativo: { icon: "✨", label: "Qualidade", tone: "gold" },
  Extras: { icon: "➕", label: "Objetivos extra", tone: "mint" },
  MDO: { icon: "💶", label: "Mão de obra", tone: "gold" },
  "Delivery R Time": { icon: "🚚", label: "Tempo de entrega", tone: "blue" },
  "R2P Dia": { icon: "🕒", label: "Tempo R2P diário", tone: "coral" },
  "OCM Rest": { icon: "🏆", label: "Resultado OCM", tone: "purple" },
};

const objectiveDepartments: Record<string, { name: string; icon: string; tone: string }> = {
  Food: { name: "Qualidade & Produtos", icon: "🧪", tone: "quality" },
  Paper: { name: "Qualidade & Produtos", icon: "🧪", tone: "quality" },
  OPS: { name: "Qualidade & Produtos", icon: "🧪", tone: "quality" },
  Perdas: { name: "Qualidade & Produtos", icon: "🧪", tone: "quality" },
  MDO: { name: "Pessoas", icon: "👥", tone: "people" },
  Turnover: { name: "Pessoas", icon: "👥", tone: "people" },
  Staffing: { name: "Pessoas", icon: "👥", tone: "people" },
  "R2P Dia": { name: "Serviço Cliente", icon: "🎧", tone: "service" },
  "OCM Rest": { name: "Serviço Cliente", icon: "🎧", tone: "service" },
  AOLs: { name: "Serviço Cliente", icon: "🎧", tone: "service" },
  "Delivery R Time": { name: "Manutenção Seg. & IT", icon: "🛠️", tone: "maintenance" },
  "Delivery Exatidão": { name: "Manutenção Seg. & IT", icon: "🛠️", tone: "maintenance" },
  "Delivery C SAT": { name: "Manutenção Seg. & IT", icon: "🛠️", tone: "maintenance" },
  "Delivery T Time": { name: "Manutenção Seg. & IT", icon: "🛠️", tone: "maintenance" },
};

function getObjectiveResult(item: RestaurantObjective): ObjectiveResult {
  if (item.classification === "Superado" || item.classification === "Atingido" || item.classification === "Próximo" || item.classification === "Não Atingido") return item.classification;
  if (item.achievedPercent === undefined) return "Por atualizar";
  if (item.achievedPercent > 100) return "Superado";
  if (item.achievedPercent >= 100) return "Atingido";
  if (item.achievedPercent >= 50) return "Próximo";
  return "Não Atingido";
}

const objectiveResultOrder: ObjectiveResult[] = ["Superado", "Atingido", "Próximo", "Não Atingido", "Por atualizar"];
const objectiveMonthOptions = [
  { value: "2026-01", label: "Janeiro 2026" }, { value: "2026-02", label: "Fevereiro 2026" },
  { value: "2026-03", label: "Março 2026" }, { value: "2026-04", label: "Abril 2026" },
  { value: "2026-05", label: "Maio 2026" }, { value: "2026-06", label: "Junho 2026" },
  { value: "2026-07", label: "Julho 2026" }, { value: "2026-08", label: "Agosto 2026" },
  { value: "2026-09", label: "Setembro 2026" }, { value: "2026-10", label: "Outubro 2026" },
  { value: "2026-11", label: "Novembro 2026" }, { value: "2026-12", label: "Dezembro 2026" },
];
const objectivesByMonth = objectivesDataJson as Record<string, ObjectiveMonthSnapshot>;

type InventoryCategory = "food" | "paper" | "ops";
type InventoryStatus = "Todos" | "Ativo" | "Inativo";
type ProductSortKey = "code" | "description" | "status" | "source" | "openingStock" | "deliveries" | "posUsage" | "expectedStock" | "closingStock" | "deviation" | "deviationEur" | "currentYield";
type InventoryProduct = {
  id: string;
  category: InventoryCategory;
  source: string;
  code: string;
  status: "Ativo" | "Inativo";
  description: string;
  unit: string;
  group: string;
  openingStock: number;
  deliveries: number;
  posUsage: number;
  expectedStock: number;
  closingStock: number;
  deviation: number;
  deviationEur: number;
  currentYield: number;
};

type R2PDay = {
  date: string;
  weekday: string;
  month: number;
  hourly: (number | null)[];
  shifts: { name: string; manager: string; value: number | null }[];
  national: number | null;
  myStore: number | null;
  sos: number | null;
  homologous: number | null;
};

type R2PData = { sourceUrl: string; snapshotDate: string; hours: string[]; days: R2PDay[] };
type ManagerRanking = { manager: string; shifts: number; average: number };
type TellTheArchesMonth = {
  month: number; label: string; responses: number; satisfaction: number; satisfactionDelta: number; bottom2: number; bottom2Delta: number;
  returnIntent: number; returnDelta: number; recognition: number; incorrectOrders: number; incorrectDelta: number;
  weekdays: number[]; dayparts: number[]; satisfactionFactors: Record<string, number>; dissatisfactionFactors: Record<string, number>; reportUrl: string;
};
type TellTheArchesData = { folderUrl: string; snapshotDate: string; ytd: TellTheArchesMonth; months: TellTheArchesMonth[] };
type TeamMilestone = { name: string; role: string; day: number; years?: number };
type TeamPerson = { name: string; role: string; level?: string; label?: string; department?: string };
type TeamMilestonesData = { month: string; label: string; sourceUrl: string; birthdays: TeamMilestone[]; anniversaries: TeamMilestone[]; calendarByMonth: Record<string, { birthdays: TeamMilestone[]; anniversaries: TeamMilestone[] }>; organisation: { franchisee: TeamPerson[]; supervision: TeamPerson[]; leadershipLevels: TeamPerson[][]; managementLevels: TeamPerson[][]; managementSupport: TeamPerson[]; trainers: TeamPerson[]; publicRelations: TeamPerson[]; employees: number } };
type SharedFolder = { id: string; name: string; description: string; url: string; fileCount: number; updatedAt: string };
type TalentCandidateStatus = "Recebida" | "Em análise" | "Entrevista" | "Admitido" | "Não selecionado";
type TalentCandidateProfile = "Classificar" | "Curto prazo" | "Médio prazo" | "Longo prazo" | "Sem perfil";
type TalentCandidate = { id: number; name: string; email: string; contact: string; admissionDate: string; jobTitle: string; profile: TalentCandidateProfile; status: TalentCandidateStatus; cvName: string; coverLetterName: string; createdAt: string; updatedAt: string };

const inventoryProducts = inventoryProductsData as InventoryProduct[];
const inventoryCategoryLabels: Record<InventoryCategory, string> = { food: "Comida", paper: "Papel", ops: "OPS" };
const r2pData = r2pDataJson as R2PData;
const tellTheArchesData = tellTheArchesDataJson as TellTheArchesData;
const teamMilestonesData = teamMilestonesDataJson as TeamMilestonesData;
const qualityTasksSourceUrl = "https://docs.google.com/spreadsheets/d/1aH533lMTXySB8jVm4xRFVNpsoBVuPiqgMbpi_GzWVKY/edit?usp=sharing";
const objectivesSourceUrl = "https://docs.google.com/spreadsheets/d/1xrRSvUDCORagI5FmL0scOvWB7Df-5d3zULKJ0K5w-1s/edit?gid=1860306038#gid=1860306038";
const defaultSharedFolders: SharedFolder[] = [
  { id: "inventario", name: "Relatórios de inventário", description: "Comida, papel, limpeza e material de escritório", url: "https://drive.google.com/drive/folders/1W_C3S1yUFZXGdmETHBesGHwJwk3xoeaZ?usp=sharing", fileCount: 8, updatedAt: "2026-08-13T11:05:00.000Z" },
  { id: "tell-the-arches", name: "Tell The Arches", description: "Relatórios mensais e acumulado YTD", url: "https://drive.google.com/drive/folders/1SAYTBKa7b9Zt7WdoCKFMB3VP4CWbFhTV?usp=sharing", fileCount: 8, updatedAt: "2026-08-13T11:05:00.000Z" },
  { id: "gdr-servico-cliente", name: "GDR Serviço Cliente", description: "Folha GDR e pasta Tell The Arches", url: "https://drive.google.com/drive/folders/1SF6Mk9dVDmUaQ5EyB_LLbkDFOVfdQdP8?usp=sharing", fileCount: 2, updatedAt: "2026-08-13T11:05:00.000Z" },
  { id: "gdr-qualidade-produtos", name: "GDR Qualidade & Produtos", description: "Folha GDR e relatórios de custo de inventário", url: "https://drive.google.com/drive/folders/1yD7oRRAMcCJlVAlw_6wWUCEkuMvCArlW?usp=sharing", fileCount: 2, updatedAt: "2026-08-13T11:05:00.000Z" },
];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekdayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const daypartNames = ["Manhã", "Almoço", "Tarde", "Fim de tarde", "Jantar", "Madrugada"];

function formatEuro(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 2 }).format(value);
}

function formatYield(value: number) {
  if (!value) return "—";
  const percentage = value <= 3 ? value * 100 : value;
  return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 1 }).format(percentage)}%`;
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function rankManagers(days: R2PDay[]): ManagerRanking[] {
  const managers = new Map<string, number[]>();
  days.forEach((day) => day.shifts.forEach((shift) => {
    if (!shift.manager || !shift.value) return;
    managers.set(shift.manager, [...(managers.get(shift.manager) ?? []), shift.value]);
  }));
  return [...managers.entries()].map(([manager, values]) => ({ manager, shifts: values.length, average: average(values) })).sort((a, b) => a.average - b.average || b.shifts - a.shifts);
}

function formatR2PDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function r2pTargetForMonth(month: number) {
  return month === 7 || month === 8 ? 230 : 180;
}

function meetsR2PTarget(value: number, month: number) {
  return month === 7 || month === 8 ? value < 230 : value <= 180;
}

function r2pTargetLabel(month: number) {
  return month === 7 || month === 8 ? "< 230s" : "≤ 180s";
}

function RankingPodium({ ranking }: { ranking: ManagerRanking[] }) {
  return <div className="ranking-podium">{[1, 0, 2].map((position) => {
    const manager = ranking[position];
    if (!manager) return null;
    return <article className={`podium-person place-${position + 1}`} key={manager.manager}>
      <span className="podium-medal">{position === 0 ? "🥇" : position === 1 ? "🥈" : "🥉"}</span>
      <span className="podium-avatar">{manager.manager.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
      <strong>{manager.manager}</strong>
      <b>{manager.average}s</b>
      <small>{manager.shifts} turnos</small>
      <i>{position + 1}.º</i>
    </article>;
  })}</div>;
}

function TeamCalendar() {
  const [initialYear, initialMonth] = teamMilestonesData.month.split("-").map(Number);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialYear, initialMonth - 1, 1));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth() + 1;
  const monthLabel = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(visibleMonth);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const events = new Map<number, { type: "birthday" | "tenure"; name: string; role: string; years?: number }[]>();
  const monthEvents = year === initialYear ? teamMilestonesData.calendarByMonth[String(month)] ?? { birthdays: [], anniversaries: [] } : { birthdays: [], anniversaries: [] };
  if (year === initialYear) {
    monthEvents.birthdays.forEach((person) => events.set(person.day, [...(events.get(person.day) ?? []), { type: "birthday", name: person.name, role: person.role }]));
    monthEvents.anniversaries.forEach((person) => events.set(person.day, [...(events.get(person.day) ?? []), { type: "tenure", name: person.name, role: person.role, years: person.years }]));
  }
  const navigateMonth = (direction: number) => setVisibleMonth((current) => new Date(initialYear, Math.min(11, Math.max(0, current.getMonth() + direction)), 1));
  return <><div className="team-calendar-navigation"><button type="button" onClick={() => navigateMonth(-1)} disabled={month === 1} aria-label="Mês anterior">‹</button><strong>{monthLabel}</strong><button type="button" onClick={() => navigateMonth(1)} disabled={month === 12} aria-label="Mês seguinte">›</button><span className="team-calendar-month-counts">🎂 {monthEvents.birthdays.length}&nbsp;&nbsp;🏅 {monthEvents.anniversaries.length}</span></div><div className="team-calendar" aria-label={`Calendário de ${monthLabel}`}>
    <div className="team-calendar-weekdays">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="team-calendar-grid">
      {Array.from({ length: firstWeekday }).map((_, index) => <span className="team-calendar-empty" key={`empty-${index}`} aria-hidden="true" />)}
      {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
        const dayEvents = events.get(day) ?? [];
        const milestone = dayEvents.some((event) => event.type === "tenure" && event.years && event.years % 5 === 0);
        return <div className={`${dayEvents.length ? "team-calendar-day has-event" : "team-calendar-day"}${milestone ? " milestone-tenure" : ""}`} key={day} tabIndex={dayEvents.length ? 0 : undefined}>
          <time>{day}</time>
          {dayEvents.length > 0 && <><span className="team-calendar-icons" aria-label={`${dayEvents.length} evento${dayEvents.length > 1 ? "s" : ""}`}>{dayEvents.map((event) => <i key={`${event.type}-${event.name}`} className={event.type === "birthday" ? "birthday-icon" : event.years && event.years % 5 === 0 ? "milestone-icon" : "tenure-icon"}>{event.type === "birthday" ? "🎂" : event.years && event.years % 5 === 0 ? "🏆" : "🏅"}</i>)}</span><div className="team-calendar-tooltip" role="tooltip">{dayEvents.map((event) => <p key={`${event.type}-${event.name}`}><b>{event.type === "birthday" ? "🎂" : event.years && event.years % 5 === 0 ? "🏆" : "🏅"}</b><span><strong>{event.name}</strong><small>{event.type === "birthday" ? `Aniversário · ${event.role}` : `${event.years} anos · ${event.role}${event.years && event.years % 5 === 0 ? " · Marco de carreira" : ""}`}</small></span></p>)}</div></>}
        </div>;
      })}
    </div>
  </div><div className="team-calendar-footer"><span>🎂 Aniversários</span><span>🏅 Antiguidade</span><span>🏆 Marcos: 5, 10, 15, 20, 25 e 30 anos</span><small>Passe o cursor sobre uma data assinalada para ver o detalhe.</small></div></>;
}

function MonthlyBillingControl({ values, onChange }: { values: Record<string, string>; onChange: (key: string, value: string) => void }) {
  const number = (key: string) => Number((values[key] || "").replace(",", ".")) || 0;
  const euro = (value: number) => value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  const purchaseFood = 0, purchasePaper = 0, purchaseOps = 0;
  const food = number("openingFood") + purchaseFood - number("lossesFood") - number("mealsFood") - number("promoFood") - number("closingFood");
  const paper = number("openingPaper") + purchasePaper - number("lossesPaper") - number("promoPaper") - number("closingPaper");
  const ops = number("openingOps") + purchaseOps - number("closingOps");
  const field = (key: string, label: string) => <label className="monthly-input" key={key}><span>{label}</span><input inputMode="decimal" value={values[key]} onChange={(event) => onChange(key, event.target.value)} placeholder="Introduzir valor" /></label>;
  const percent = (amount: number) => number("sales") ? `${((amount / number("sales")) * 100).toFixed(2).replace(".", ",")}%` : "—";
  return <section className="monthly-control"><div className="monthly-control-heading"><div><span className="eyebrow">Resumo do mês</span><h3>Custos, inventário e consumo</h3><p>Introduza os campos em branco. Compras, consumos e percentagens são calculados automaticamente.</p></div></div><div className="monthly-control-grid"><section className="monthly-purchases">{field("sales", "Vendas mês")}<p><span>Compras Comida</span><b>{euro(purchaseFood)}</b></p><p><span>Compras Papel</span><b>{euro(purchasePaper)}</b></p><p><span>Compras Total OPS</span><b>{euro(purchaseOps)}</b></p><p><span>Consumo Comida</span><b>{euro(food)}</b></p><p><span>Consumo Papel</span><b>{euro(paper)}</b></p><p><span>Consumo OPS</span><b>{euro(ops)}</b></p></section><section className="monthly-inputs">{field("openingFood", "Inv. inicial comida")}{field("openingOps", "Inv. inicial OPS")}{field("lossesFood", "Perdas comida")}{field("mealsFood", "Refeições comida")}{field("promoFood", "Promo comida")}{field("closingFood", "Inv. final comida")}</section><section className="monthly-inputs">{field("openingPaper", "Inv. inicial papel")}{field("lossesPaper", "Perdas papel")}{field("mealsPaper", "Refeições papel")}{field("promoPaper", "Promo papel")}{field("closingPaper", "Inv. final papel")}{field("closingOps", "Inv. final OPS")}<p><span>% custo comida</span><b>{percent(food)}</b></p><p><span>% custo papel</span><b>{percent(paper)}</b></p><p><span>% custo OPS</span><b>{percent(ops)}</b></p></section></div></section>;
}

type DevelopmentSection = "cofre" | "deposito" | "faltas" | "disputas";
type VaultShift = "Manhã" | "Tarde" | "Madrugada";
type VaultRecord = { id: number; controlDate: string; shift: VaultShift; largeBags: Record<string, number>; smallBags: Record<string, number>; noteCounts: Record<string, number>; looseCoins: number; tillFunds: number; invoices: number; bankCoins1: number; bankCoins2: number; countedTotal: number; theoreticalTotal: number; vaultTotal: number; difference: number; deliveringManager: string; receivingManager: string; createdByName: string };
type DepositShift = "Abertura" | "Transição" | "Fecho" | "Delivery";
type DepositRow = { id: number; shift: DepositShift; register: string; employee: string; employeeNumber: string; time: string; rapport: string; withdrawal: string; card: string; cash: string; ticket: string; cheques: string; uber: string; glovo: string; bolt: string };

const vaultCoinDenominations = [0.05, 0.1, 0.2, 0.5, 1] as const;
const vaultNoteDenominations = [5, 10, 20, 50, 100, 200, 500] as const;
const vaultLargeBagValues: Record<string, number> = { "0.05": 50, "0.1": 80, "0.2": 160, "0.5": 300, "1": 375 };
const vaultSmallBagValues: Record<string, number> = { "0.05": 2.5, "0.1": 4, "0.2": 8, "0.5": 20, "1": 25 };
const vaultCoinImages: Record<string, string> = { "0.05": "/currency/coin-5c.jpg", "0.1": "/currency/coin-10c.png", "0.2": "/currency/coin-20c.jpg", "0.5": "/currency/coin-50c.jpg", "1": "/currency/coin-1e.jpg" };
const vaultNoteImages: Record<string, string> = Object.fromEntries(vaultNoteDenominations.map((value) => [String(value), `/currency/note-${value}.jpg`]));
const moneyValue = (value: string) => Number(String(value).replace(",", ".")) || 0;
const euro = (value: number) => value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

function VaultControlPrototype({ isAdmin }: { isAdmin: boolean }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [controlDate, setControlDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<VaultShift>("Manhã");
  const [largeBags, setLargeBags] = useState<Record<string, string>>({});
  const [smallBags, setSmallBags] = useState<Record<string, string>>({});
  const [noteCounts, setNoteCounts] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState({ looseCoins: "", tillFunds: "", invoices: "", bankCoins1: "", bankCoins2: "" });
  const [managers, setManagers] = useState({ delivering: "", receiving: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const managementTeam = teamMilestonesData.organisation.managementLevels.flat().map((person) => person.name);
  const loadRecords = async (selectedMonth: string) => {
    setLoading(true);
    try { const response = await fetch(`/api/vault-controls?month=${selectedMonth}`, { cache: "no-store" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setRecords(body.records || []); }
    catch { setRecords([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadRecords(month); }, [month]);
  const coinsTotal = vaultCoinDenominations.reduce((sum, denomination) => sum + (Number(largeBags[String(denomination)]) || 0) * vaultLargeBagValues[String(denomination)] + (Number(smallBags[String(denomination)]) || 0) * vaultSmallBagValues[String(denomination)], 0);
  const notesTotal = vaultNoteDenominations.reduce((sum, denomination) => sum + denomination * (Number(noteCounts[String(denomination)]) || 0), 0);
  const counted = coinsTotal + notesTotal + moneyValue(extras.looseCoins) + moneyValue(extras.tillFunds) + moneyValue(extras.invoices);
  const theoretical = shift === "Manhã" ? 1250 : 1000 + moneyValue(extras.tillFunds);
  const vaultTotal = theoretical + moneyValue(extras.bankCoins1) + moneyValue(extras.bankCoins2);
  const difference = counted - vaultTotal;
  const reset = () => { setLargeBags({}); setSmallBags({}); setNoteCounts({}); setExtras({ looseCoins: "", tillFunds: "", invoices: "", bankCoins1: "", bankCoins2: "" }); setManagers({ delivering: "", receiving: "" }); setMessage(""); };
  const openNew = () => { reset(); setEditingId(null); setControlDate(new Date().toISOString().slice(0, 10)); setShift("Manhã"); setModalOpen(true); };
  const openEdit = (record: VaultRecord) => { setEditingId(record.id); setControlDate(record.controlDate); setShift(record.shift); setLargeBags(Object.fromEntries(Object.entries(record.largeBags || {}).map(([key, value]) => [key, String(value || "")]))); setSmallBags(Object.fromEntries(Object.entries(record.smallBags || {}).map(([key, value]) => [key, String(value || "")]))); setNoteCounts(Object.fromEntries(Object.entries(record.noteCounts || {}).map(([key, value]) => [key, String(value || "")]))); setExtras({ looseCoins: String(record.looseCoins || ""), tillFunds: String(record.tillFunds || ""), invoices: String(record.invoices || ""), bankCoins1: String(record.bankCoins1 || ""), bankCoins2: String(record.bankCoins2 || "") }); setManagers({ delivering: record.deliveringManager, receiving: record.receivingManager }); setMessage(""); setModalOpen(true); };
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/vault-controls", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId || undefined, controlDate, shift, largeBags: Object.fromEntries(Object.entries(largeBags).map(([key, value]) => [key, Number(value) || 0])), smallBags: Object.fromEntries(Object.entries(smallBags).map(([key, value]) => [key, Number(value) || 0])), noteCounts: Object.fromEntries(Object.entries(noteCounts).map(([key, value]) => [key, Number(value) || 0])), looseCoins: moneyValue(extras.looseCoins), tillFunds: moneyValue(extras.tillFunds), invoices: moneyValue(extras.invoices), bankCoins1: moneyValue(extras.bankCoins1), bankCoins2: moneyValue(extras.bankCoins2), deliveringManager: managers.delivering, receivingManager: managers.receiving }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Não foi possível guardar.");
      setMonth(controlDate.slice(0, 7)); await loadRecords(controlDate.slice(0, 7)); reset(); setEditingId(null); setModalOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível guardar o controlo."); }
    finally { setSaving(false); }
  };
  const removeRecord = async (record: VaultRecord) => { if (!isAdmin || !window.confirm(`Eliminar o controlo de ${new Date(`${record.controlDate}T00:00:00`).toLocaleDateString("pt-PT")} — ${record.shift}?`)) return; try { const response = await fetch("/api/vault-controls", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Não foi possível eliminar."); await loadRecords(month); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível eliminar o registo."); } };
  const positive = records.filter((record) => record.difference > 0).reduce((sum, record) => sum + record.difference, 0);
  const negative = records.filter((record) => record.difference < 0).reduce((sum, record) => sum + record.difference, 0);
  const net = records.reduce((sum, record) => sum + record.difference, 0);
  const recordCoinsTotal = (record: VaultRecord) => vaultCoinDenominations.reduce((sum, denomination) => { const key = String(denomination); return sum + (Number(record.largeBags?.[key]) || 0) * vaultLargeBagValues[key] + (Number(record.smallBags?.[key]) || 0) * vaultSmallBagValues[key]; }, Number(record.looseCoins) || 0);
  const recordNotesTotal = (record: VaultRecord) => vaultNoteDenominations.reduce((sum, denomination) => sum + denomination * (Number(record.noteCounts?.[String(denomination)]) || 0), 0);
  const invoiceDifference = (record: VaultRecord, index: number) => index === records.length - 1 ? null : Math.round(((Number(record.invoices) || 0) - (Number(records[index + 1]?.invoices) || 0)) * 100) / 100;
  const shiftClass = (recordShift: VaultShift) => recordShift === "Manhã" ? "manha" : recordShift === "Tarde" ? "tarde" : "madrugada";
  return <section className="development-module" aria-labelledby="vault-control-title">
    <div className="development-module-heading"><div><span className="eyebrow">Resumo mensal</span><h2 id="vault-control-title">Controlo Cofre</h2><p>Diferenças registadas por data e turno, com identificação da passagem entre gerentes.</p></div><button type="button" className="vault-add-record" onClick={openNew}>＋ Adicionar registo</button></div>
    <div className="vault-month-toolbar"><label>Mês<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label><span>{records.length} registo{records.length === 1 ? "" : "s"}</span></div>
    <div className="vault-summary"><article><small>Controlos realizados</small><strong>{records.length}</strong></article><article className="balanced"><small>Diferenças positivas</small><strong>{euro(positive)}</strong></article><article className="difference"><small>Diferenças negativas</small><strong>{euro(negative)}</strong></article><article className={net === 0 ? "balanced" : "difference"}><small>Diferença líquida</small><strong>{euro(net)}</strong></article></div>
    <div className="vault-records-table-wrap"><table className="vault-records-table"><thead><tr><th>Data</th><th>Turno</th><th>Total moedas</th><th>Total notas</th><th>Total faturas</th><th>Total cofre</th><th>Total diferença</th><th>Gerente turno 1</th><th>Gerente turno 2</th>{isAdmin && <th>Ações</th>}</tr></thead><tbody>{records.map((record, index) => { const invoiceDelta = invoiceDifference(record, index); return <tr key={record.id}><td>{new Date(`${record.controlDate}T00:00:00`).toLocaleDateString("pt-PT")}</td><td><span className={`vault-shift-tag vault-shift-${shiftClass(record.shift)}`}>{record.shift}</span></td><td><strong>{euro(recordCoinsTotal(record))}</strong><small className="vault-table-detail">Inclui moedas soltas</small></td><td>{euro(recordNotesTotal(record))}</td><td><strong>{euro(Number(record.invoices) || 0)}</strong><small className={`vault-table-detail vault-invoice-difference ${invoiceDelta === null || invoiceDelta === 0 ? "zero" : invoiceDelta > 0 ? "positive" : "negative"}`}>{invoiceDelta === null ? "Primeira contagem" : `Diferença: ${invoiceDelta > 0 ? "+" : ""}${euro(invoiceDelta)}`}</small></td><td><strong>{euro(record.vaultTotal)}</strong></td><td><strong className={record.difference === 0 ? "zero" : record.difference > 0 ? "positive" : "negative"}>{euro(record.difference)}</strong></td><td>{record.deliveringManager}</td><td>{record.receivingManager}</td>{isAdmin && <td><div className="vault-row-actions"><button type="button" onClick={() => openEdit(record)}>Editar</button><button type="button" className="delete" onClick={() => removeRecord(record)}>Eliminar</button></div></td>}</tr>; })}</tbody></table>{!loading && !records.length && <div className="vault-empty">Ainda não existem controlos guardados para este mês.</div>}</div>
    {modalOpen && <div className="vault-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section className="vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-form-title">
      <header><div><span className="eyebrow">{editingId ? "Editar controlo" : "Novo controlo"}</span><h3 id="vault-form-title">{editingId ? "Alterar registo de cofre" : "Adicionar registo de cofre"}</h3><p>Preencha a contagem e confirme os gerentes responsáveis.</p></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Fechar">×</button></header>
      <div className="development-toolbar"><label>Data<input type="date" value={controlDate} onChange={(event) => setControlDate(event.target.value)} /></label><div className="development-shifts" aria-label="Turno">{(["Manhã", "Tarde", "Madrugada"] as VaultShift[]).map((item) => <button type="button" className={shift === item ? "active" : ""} onClick={() => setShift(item)} key={item}>{item}</button>)}</div></div>
      <div className="vault-count-grid"><article><h3>Moedas</h3><div className="vault-coin-table"><div className="vault-coin-header"><span>Moeda</span><span>Sacos grandes</span><span>Sacos pequenos</span><span>Subtotal</span></div>{vaultCoinDenominations.map((value) => { const key = String(value); const subtotal = (Number(largeBags[key]) || 0) * vaultLargeBagValues[key] + (Number(smallBags[key]) || 0) * vaultSmallBagValues[key]; return <label key={value}><span className="currency-coin"><img src={vaultCoinImages[key]} alt={`Moeda de ${euro(value)}`} /></span><input aria-label={`Sacos grandes de moedas de ${euro(value)}`} type="number" min="0" inputMode="numeric" value={largeBags[key] || ""} onChange={(event) => setLargeBags((current) => ({ ...current, [key]: event.target.value }))} placeholder="0" /><input aria-label={`Sacos pequenos de moedas de ${euro(value)}`} type="number" min="0" inputMode="numeric" value={smallBags[key] || ""} onChange={(event) => setSmallBags((current) => ({ ...current, [key]: event.target.value }))} placeholder="0" /><strong>{euro(subtotal)}</strong></label>; })}<div className="vault-count-total"><span>Total moedas</span><strong>{euro(coinsTotal)}</strong></div></div></article><article><h3>Notas</h3><div className="vault-note-table"><div className="vault-note-header"><span>Nota</span><span>Quantidade</span><span>Subtotal</span></div>{vaultNoteDenominations.map((value) => { const key = String(value); const subtotal = value * (Number(noteCounts[key]) || 0); return <label key={value}><span className="currency-note"><img src={vaultNoteImages[key]} alt={`Nota de ${euro(value)}`} /></span><input aria-label={`Quantidade de notas de ${euro(value)}`} type="number" min="0" inputMode="numeric" value={noteCounts[key] || ""} onChange={(event) => setNoteCounts((current) => ({ ...current, [key]: event.target.value }))} placeholder="0" /><strong>{euro(subtotal)}</strong></label>; })}<div className="vault-count-total"><span>Total notas</span><strong>{euro(notesTotal)}</strong></div></div></article></div>
      <div className="vault-extras"><label>Moedas soltas · valor<input inputMode="decimal" value={extras.looseCoins} onChange={(event) => setExtras({ ...extras, looseCoins: event.target.value })} placeholder="0,00" /></label><label>Fundos de caixa<input inputMode="decimal" value={extras.tillFunds} onChange={(event) => setExtras({ ...extras, tillFunds: event.target.value })} placeholder="0,00" /></label><label>Faturas<input inputMode="decimal" value={extras.invoices} onChange={(event) => setExtras({ ...extras, invoices: event.target.value })} placeholder="0,00" /></label><label>Moedas banco 1<input inputMode="decimal" value={extras.bankCoins1} onChange={(event) => setExtras({ ...extras, bankCoins1: event.target.value })} placeholder="0,00" /></label><label>Moedas banco 2<input inputMode="decimal" value={extras.bankCoins2} onChange={(event) => setExtras({ ...extras, bankCoins2: event.target.value })} placeholder="0,00" /></label><label>Total teórico · automático<input value={euro(theoretical)} readOnly /></label></div>
      <div className="vault-form-summary"><article><small>Total contado</small><strong>{euro(counted)}</strong></article><article><small>Total cofre</small><strong>{euro(vaultTotal)}</strong></article><article className={difference === 0 ? "balanced" : "difference"}><small>Diferença</small><strong>{euro(difference)}</strong></article></div>
      <div className="vault-handover"><label>Gerente que entrega<select value={managers.delivering} onChange={(event) => setManagers({ ...managers, delivering: event.target.value })}><option value="">Selecionar gerente</option>{managementTeam.map((name) => <option value={name} key={`delivering-${name}`}>{name}</option>)}</select></label><span>→</span><label>Gerente que recebe<select value={managers.receiving} onChange={(event) => setManagers({ ...managers, receiving: event.target.value })}><option value="">Selecionar gerente</option>{managementTeam.map((name) => <option value={name} key={`receiving-${name}`}>{name}</option>)}</select></label></div>
      {message && <p className="vault-form-message" role="alert">{message}</p>}
      <div className="development-actions"><button type="button" onClick={reset}>Limpar formulário</button><button type="button" className="primary" onClick={save} disabled={saving}>{saving ? "A guardar…" : editingId ? "Guardar alterações" : "Guardar registo"}</button></div>
    </section></div>}
  </section>;
}

const newDepositRow = (id: number, shift: DepositShift): DepositRow => ({ id, shift, register: "", employee: "", employeeNumber: "", time: "", rapport: "", withdrawal: "", card: "", cash: "", ticket: "", cheques: "", uber: "", glovo: "", bolt: "" });
const depositMoneyFields: (keyof DepositRow)[] = ["rapport", "withdrawal", "card", "cash", "ticket", "cheques", "uber", "glovo", "bolt"];

type AbsenceRecord = { year: number; month: number; monthLabel: string; employeeNumber: string; name: string; unjustifiedAbsences: number; lateArrivals: number; unjustifiedHours: number; justifiedAbsences: number; justifiedHours: number; medicalLeave: number; workHours: number; assessment: string; role: string; admissionDate: string };
type AbsenceData = { sourceFile: string; updatedAt: string; years: number[]; records: AbsenceRecord[] };

function DepositSheetPrototype() {
  const [rows, setRows] = useState<DepositRow[]>([newDepositRow(1, "Abertura"), newDepositRow(2, "Transição"), newDepositRow(3, "Fecho"), newDepositRow(4, "Delivery")]);
  const [responsibles, setResponsibles] = useState<Record<string, string>>({ Abertura: "", Transição: "", Fecho: "" });
  const difference = (row: DepositRow) => moneyValue(row.rapport) - depositMoneyFields.filter((key) => key !== "rapport").reduce((sum, key) => sum + moneyValue(String(row[key])), 0);
  const totalDifference = rows.reduce((sum, row) => sum + difference(row), 0);
  const update = (id: number, key: keyof DepositRow, value: string) => setRows((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
  return <section className="development-module" aria-labelledby="deposit-sheet-title">
    <div className="development-module-heading"><div><span className="eyebrow">Protótipo operacional</span><h2 id="deposit-sheet-title">Folha Depósito</h2><p>Registo diário por momento, caixa, colaborador e meio de pagamento.</p></div><span className="development-status">Em construção</span></div>
    <div className="development-toolbar"><label>Data<input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><div className="deposit-overview"><span><small>Registos</small><strong>{rows.length}</strong></span><span><small>Diferença total</small><strong>{euro(totalDifference)}</strong></span></div></div>
    <div className="deposit-table-wrap"><table className="deposit-table"><thead><tr><th>Turno</th><th>Caixa</th><th>Funcionário</th><th>N.º emp.</th><th>Hora</th><th>Rapport</th><th>Sangria</th><th>Multibanco</th><th>Dinheiro</th><th>Ticket</th><th>Cheques</th><th>UberEats</th><th>Glovo</th><th>Bolt</th><th>Diferença</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><select value={row.shift} onChange={(event) => update(row.id, "shift", event.target.value)}>{(["Abertura", "Transição", "Fecho", "Delivery"] as DepositShift[]).map((item) => <option key={item}>{item}</option>)}</select></td><td><input value={row.register} onChange={(event) => update(row.id, "register", event.target.value)} /></td><td><input value={row.employee} onChange={(event) => update(row.id, "employee", event.target.value)} /></td><td><input value={row.employeeNumber} onChange={(event) => update(row.id, "employeeNumber", event.target.value)} /></td><td><input type="time" value={row.time} onChange={(event) => update(row.id, "time", event.target.value)} /></td>{depositMoneyFields.map((key) => <td key={key}><input inputMode="decimal" value={String(row[key])} onChange={(event) => update(row.id, key, event.target.value)} placeholder="0,00" /></td>)}<td className={difference(row) === 0 ? "balanced" : "difference"}>{euro(difference(row))}</td></tr>)}</tbody></table></div>
    <button type="button" className="deposit-add" onClick={() => setRows((current) => [...current, newDepositRow(Date.now(), "Abertura")])}>＋ Adicionar registo</button>
    <div className="deposit-responsibles">{(["Abertura", "Transição", "Fecho"] as const).map((item) => <label key={item}>Responsável pelo depósito · {item}<input value={responsibles[item]} onChange={(event) => setResponsibles({ ...responsibles, [item]: event.target.value })} placeholder="Nome" /></label>)}</div>
    <label className="deposit-observations">Observações<textarea rows={3} placeholder="Registe ocorrências ou justificações relevantes." /></label>
    <div className="development-actions"><button type="button" onClick={() => setRows([newDepositRow(1, "Abertura"), newDepositRow(2, "Transição"), newDepositRow(3, "Fecho"), newDepositRow(4, "Delivery")])}>Limpar rascunho</button><button type="button" className="primary" disabled>Guardar folha · brevemente</button></div>
  </section>;
}

function AbsencesPrototype() {
  const [data, setData] = useState<AbsenceData | null>(null);
  const [mode, setMode] = useState<"annual" | "monthly" | "profile">("annual");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);
  const [employee, setEmployee] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todas as funções");
  useEffect(() => { fetch("/api/absences", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then((payload: AbsenceData) => { setData(payload); setYear(payload.years.at(-1) || 2026); }).catch(() => setData(null)); }, []);
  const annual = useMemo(() => {
    const map = new Map<string, AbsenceRecord>();
    (data?.records || []).filter((row) => row.year === year).forEach((row) => { const current = map.get(row.employeeNumber); if (!current) map.set(row.employeeNumber, { ...row }); else map.set(row.employeeNumber, { ...current, unjustifiedAbsences: current.unjustifiedAbsences + row.unjustifiedAbsences, lateArrivals: current.lateArrivals + row.lateArrivals, unjustifiedHours: current.unjustifiedHours + row.unjustifiedHours, justifiedAbsences: current.justifiedAbsences + row.justifiedAbsences, justifiedHours: current.justifiedHours + row.justifiedHours, medicalLeave: current.medicalLeave + row.medicalLeave, workHours: current.workHours + row.workHours }); });
    return [...map.values()].sort((a, b) => b.unjustifiedAbsences - a.unjustifiedAbsences || b.unjustifiedHours - a.unjustifiedHours || a.name.localeCompare(b.name));
  }, [data, year]);
  const monthly = useMemo(() => (data?.records || []).filter((row) => row.year === year && row.month === month).sort((a, b) => b.unjustifiedAbsences - a.unjustifiedAbsences || b.unjustifiedHours - a.unjustifiedHours || a.name.localeCompare(b.name)), [data, year, month]);
  const selectedRecords = useMemo(() => (data?.records || []).filter((row) => row.employeeNumber === employee).sort((a, b) => a.year - b.year || a.month - b.month), [data, employee]);
  const selectedPerson = annual.find((row) => row.employeeNumber === employee) || selectedRecords[0];
  const roles = useMemo(() => [...new Set(annual.map((row) => row.role || "Função não indicada"))].sort(), [annual]);
  const profilePeople = useMemo(() => annual.filter((row) => (roleFilter === "Todas as funções" || (row.role || "Função não indicada") === roleFilter) && row.name.toLocaleLowerCase("pt-PT").includes(employeeSearch.toLocaleLowerCase("pt-PT"))), [annual, employeeSearch, roleFilter]);
  const processedMonths = selectedRecords.filter((row) => row.year === year && row.workHours > 0).length;
  const averageHours = processedMonths && selectedPerson ? selectedPerson.workHours / processedMonths : 0;
  const seniority = selectedPerson?.admissionDate ? Math.max(0, (Date.now() - new Date(`${selectedPerson.admissionDate}T00:00:00`).getTime()) / 31557600000) : null;
  const renderTable = (rows: AbsenceRecord[]) => <div className="absence-table-wrap"><table className="absence-table"><thead><tr><th>Funcionário</th><th>N.º</th><th>Faltas injust.</th><th>Atrasos</th><th>Horas injust.</th><th>Faltas justific.</th><th>Horas justific.</th><th>Baixas/licenças</th><th>Horas trabalho</th><th>Avaliação</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.employeeNumber}-${row.year}-${row.month}`}><td><button type="button" onClick={() => { setEmployee(row.employeeNumber); setMode("profile"); }}>{row.name}</button></td><td>{row.employeeNumber}</td><td><strong>{row.unjustifiedAbsences.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</strong></td><td>{row.lateArrivals.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}</td><td>{row.unjustifiedHours.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</td><td>{row.justifiedAbsences.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</td><td>{row.justifiedHours.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</td><td>{row.medicalLeave.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</td><td>{row.workHours.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}</td><td><span className="absence-assessment">{row.assessment}</span></td></tr>)}</tbody></table></div>;
  return <section className="development-module absence-module" aria-labelledby="absences-title">
    <div className="development-module-heading"><div><span className="eyebrow">Atualização mensal</span><h2 id="absences-title">Faltas &amp; Atrasos</h2><p>Visão anual, detalhe mensal e cadastro individual. Ordenação automática pelo número de faltas injustificadas.</p></div><span className="development-status">Em construção</span></div>
    <nav className="absence-tabs" aria-label="Vistas de faltas e atrasos"><button className={mode === "annual" ? "active" : ""} onClick={() => setMode("annual")}>Acumulado anual</button><button className={mode === "monthly" ? "active" : ""} onClick={() => setMode("monthly")}>Por mês</button><button className={mode === "profile" ? "active" : ""} onClick={() => setMode("profile")}>Cadastro do funcionário</button></nav>
    {!data ? <div className="absence-empty">Não foi possível carregar a informação do ficheiro mensal.</div> : <>
      {mode !== "profile" && <div className="absence-filters"><label>Ano<select value={year} onChange={(event) => setYear(Number(event.target.value))}>{data.years.map((item) => <option key={item}>{item}</option>)}</select></label>{mode === "monthly" && <label>Mês<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((label, index) => <option value={index + 1} key={label}>{label}</option>)}</select></label>}<span>Atualizado em {new Date(data.updatedAt).toLocaleDateString("pt-PT")}</span></div>}
      {mode === "annual" && renderTable(annual)}
      {mode === "monthly" && renderTable(monthly)}
      {mode === "profile" && <div className="employee-record-layout">
        <aside className="employee-directory">
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>Todas as funções</option>{roles.map((role) => <option key={role}>{role}</option>)}</select>
          <input type="search" value={employeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder="Procurar por nome ou função…" />
          <strong>{profilePeople.length} pessoas</strong>
          <div>{profilePeople.map((row) => <button type="button" className={employee === row.employeeNumber ? "active" : ""} onClick={() => setEmployee(row.employeeNumber)} key={row.employeeNumber}><b>{row.name}</b><span>{row.role || "Função não indicada"}</span></button>)}</div>
        </aside>
        <div className="employee-record-detail">{selectedPerson ? <>
          <header className="employee-record-hero"><div><h3>{selectedPerson.name}</h3><p>{selectedPerson.role || "Função não indicada"}</p></div><dl><div><dt>Antiguidade</dt><dd>{seniority === null ? "—" : `${seniority.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} anos`}</dd></div><div><dt>Admissão</dt><dd>{selectedPerson.admissionDate ? new Date(`${selectedPerson.admissionDate}T00:00:00`).toLocaleDateString("pt-PT") : "Não indicada"}</dd></div><div><dt>N.º funcionário</dt><dd>{selectedPerson.employeeNumber}</dd></div></dl></header>
          <section className="attendance-card"><div className="attendance-heading"><div><h3>Assiduidade</h3><p>Horas de trabalho, faltas e atrasos registados.</p></div><select value={year} onChange={(event) => setYear(Number(event.target.value))}>{data.years.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="attendance-metrics"><article><small>Horas</small><strong>{selectedPerson.workHours.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}</strong></article><article><small>Média/mês</small><strong>{averageHours.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} h</strong></article><article><small>Faltas injustif.</small><strong>{selectedPerson.unjustifiedHours.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} h</strong></article><article><small>Faltas justif.</small><strong>{selectedPerson.justifiedHours.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} h</strong></article><article className="late"><small>Atrasos</small><strong>{selectedPerson.lateArrivals.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}</strong></article><article><small>Baixa/licenças</small><strong>{selectedPerson.medicalLeave.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} d</strong></article></div>
            <p className="processed-months">{processedMonths} meses com processamento.</p>
            <div className="attendance-timeline">{selectedRecords.filter((row) => row.year === year).map((row) => <article key={`${row.year}-${row.month}`}><span>{row.unjustifiedAbsences || "—"}</span><span>{row.justifiedAbsences || "—"}</span><b>{row.lateArrivals || "—"}</b><small>{row.monthLabel.slice(0, 3).toLocaleLowerCase("pt-PT")}</small></article>)}</div>
            <div className="attendance-legend"><span><i className="unjustified" />Faltas injustificadas</span><span><i className="justified" />Faltas justificadas</span><span><i className="late" />N.º de atrasos</span></div>
          </section>
          <section className="employee-history"><div><h3>Histórico mensal</h3><p>Do primeiro ao último registo disponível.</p></div>{renderTable(selectedRecords)}</section>
        </> : <div className="absence-empty">Selecione um funcionário na lista para consultar o cadastro.</div>}</div>
      </div>}
    </>}
  </section>;
}

type DeliveryDispute = { requestDate: string; operator: string; partnerId: string; scale: string; operatorPayment: boolean; creditNoteGenerated: boolean; creditNoteValue: number };
type DeliveryBalanceMonth = { period: string; integrated: number; weighed: number; notWeighed: number };
type DeliveryDisputesData = { source: string; updatedAt: string; balanceUpdatedAt?: string; balanceMonthly?: DeliveryBalanceMonth[]; records: DeliveryDispute[] };

function DeliveryDisputesPrototype() {
  const [data, setData] = useState<DeliveryDisputesData | null>(null);
  const [operator, setOperator] = useState("Todos");
  const [period, setPeriod] = useState("Todos");
  const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/delivery-disputes", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then(setData).catch(() => setData(null)); }, []);
  const dateKey = (value: string) => { const parts = value.match(/(\d{2,4})[/-](\d{2})[/-](\d{2,4})/); if (!parts) return ""; return parts[1].length === 4 ? `${parts[1]}-${parts[2]}` : `${parts[3]}-${parts[2]}`; };
  const dateStamp = (value: string) => { const parts = value.match(/(\d{2,4})[/-](\d{2})[/-](\d{2,4})\s*(.*)/); if (!parts) return 0; const iso = parts[1].length === 4 ? `${parts[1]}-${parts[2]}-${parts[3]}` : `${parts[3]}-${parts[2]}-${parts[1]}`; return new Date(`${iso}T${parts[4] || "00:00:00"}`).getTime() || 0; };
  const periods = useMemo(() => [...new Set((data?.records || []).map((row) => dateKey(row.requestDate)).filter(Boolean))].sort().reverse(), [data]);
  const operators = useMemo(() => [...new Set((data?.records || []).map((row) => row.operator))].sort(), [data]);
  const filtered = useMemo(() => (data?.records || []).filter((row) => (operator === "Todos" || row.operator === operator) && (period === "Todos" || dateKey(row.requestDate) === period) && (!query || row.partnerId.toLocaleLowerCase("pt-PT").includes(query.toLocaleLowerCase("pt-PT")))).sort((a, b) => dateStamp(b.requestDate) - dateStamp(a.requestDate)), [data, operator, period, query]);
  const paid = filtered.filter((row) => row.operatorPayment).length;
  const creditNotes = filtered.filter((row) => row.creditNoteGenerated).length;
  const creditValue = filtered.reduce((total, row) => total + row.creditNoteValue, 0);
  const euroValue = (value: number) => value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  const balanceMonthly = data?.balanceMonthly || [];
  const latestBalance = balanceMonthly[0];
  const percent = (value: number, total: number) => total ? `${(value / total * 100).toLocaleString("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : "0,0%";
  const monthLabel = (value: string) => new Date(`${value}-01T00:00:00`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
  return <section className="development-module delivery-disputes-module" aria-labelledby="delivery-disputes-title">
    <div className="development-module-heading"><div><span className="eyebrow">Controlo Delivery</span><h2 id="delivery-disputes-title">Disputas Delivery</h2><p>Informação consolidada das disputas Glovo e Uber Eats.</p></div><span className="development-status">Em construção</span></div>
    {!data ? <div className="delivery-disputes-empty"><span>!</span><strong>Não foi possível carregar as disputas</strong><p>Atualize a página ou confirme a sessão de administrador.</p></div> : <>
      {!!balanceMonthly.length && <section className="delivery-balance-summary" aria-labelledby="delivery-balance-title">
        <div className="delivery-balance-heading"><div><span className="eyebrow">BD Balança</span><h3 id="delivery-balance-title">Pedidos integrados por mês</h3><p>A coluna “Tratado?” determina se o pedido foi pesado ou não pesado.</p></div>{data.balanceUpdatedAt && <span>Atualizado em {new Date(data.balanceUpdatedAt).toLocaleDateString("pt-PT")}</span>}</div>
        {latestBalance && <div className="delivery-balance-cards"><article className="integrated"><small>Pedidos integrados</small><strong>{latestBalance.integrated.toLocaleString("pt-PT")}</strong><span>{monthLabel(latestBalance.period)}</span></article><article className="weighed"><small>Pesados</small><strong>{latestBalance.weighed.toLocaleString("pt-PT")}</strong><span>{percent(latestBalance.weighed, latestBalance.integrated)} dos pedidos</span></article><article className="not-weighed"><small>Não pesados</small><strong>{latestBalance.notWeighed.toLocaleString("pt-PT")}</strong><span>{percent(latestBalance.notWeighed, latestBalance.integrated)} dos pedidos</span></article></div>}
        <div className="delivery-balance-table-wrap"><table className="delivery-balance-table"><thead><tr><th>Mês</th><th>Pedidos integrados</th><th>Pesados</th><th>% Pesados</th><th>Não pesados</th><th>% Não pesados</th></tr></thead><tbody>{balanceMonthly.map((row) => <tr key={row.period}><td><strong>{monthLabel(row.period)}</strong></td><td>{row.integrated.toLocaleString("pt-PT")}</td><td className="positive">{row.weighed.toLocaleString("pt-PT")}</td><td><span className="balance-percent positive">{percent(row.weighed, row.integrated)}</span></td><td className="negative">{row.notWeighed.toLocaleString("pt-PT")}</td><td><span className="balance-percent negative">{percent(row.notWeighed, row.integrated)}</span></td></tr>)}</tbody></table></div>
      </section>}
      <div className="delivery-disputes-cards"><article><small>Registos</small><strong>{filtered.length}</strong><span>No filtro selecionado</span></article><article><small>Pagos pelo operador</small><strong>{paid}</strong><span>{filtered.length ? Math.round(paid / filtered.length * 100) : 0}% dos registos</span></article><article><small>Notas de crédito</small><strong>{creditNotes}</strong><span>{filtered.length ? Math.round(creditNotes / filtered.length * 100) : 0}% dos registos</span></article><article><small>Valor NC</small><strong>{euroValue(creditValue)}</strong><span>Total das notas geradas</span></article></div>
      <div className="delivery-disputes-toolbar"><label>Período<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Todos</option>{periods.map((item) => <option key={item} value={item}>{new Date(`${item}-01T00:00:00`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</option>)}</select></label><label>Operador<select value={operator} onChange={(event) => setOperator(event.target.value)}><option>Todos</option>{operators.map((item) => <option key={item}>{item}</option>)}</select></label><label className="delivery-disputes-search">ID parceiro<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar ID…" /></label><span>Atualizado em {new Date(data.updatedAt).toLocaleDateString("pt-PT")}</span></div>
      <div className="delivery-disputes-table-wrap"><table className="delivery-disputes-table"><thead><tr><th>Data pedido</th><th>Operador</th><th>ID Parceiro</th><th>Balança</th><th>Pag. Operador</th><th>NC Gerada</th><th>NC Valor</th></tr></thead><tbody>{filtered.map((row, index) => <tr key={`${row.operator}-${row.partnerId}-${index}`}><td>{row.requestDate}</td><td><span className={`delivery-operator-logo ${row.operator.toLocaleLowerCase("pt-PT")}`}><img src={row.operator === "Glovo" ? "/operators/glovo.jpg" : "/operators/ubereats.png"} alt={row.operator} /></span></td><td><strong>{row.partnerId}</strong></td><td>{row.scale || "—"}</td><td><span className={row.operatorPayment ? "delivery-flag yes" : "delivery-flag no"}>{row.operatorPayment ? "Sim" : "Não"}</span></td><td><span className={row.creditNoteGenerated ? "delivery-flag yes" : "delivery-flag no"}>{row.creditNoteGenerated ? "Sim" : "Não"}</span></td><td><strong>{euroValue(row.creditNoteValue)}</strong></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="delivery-disputes-empty"><span>◎</span><strong>Sem resultados</strong><p>Não existem disputas correspondentes aos filtros selecionados.</p></div>}
    </>}
  </section>;
}

export default function Home() {
  const objectivesExportRef = useRef<HTMLElement>(null);
  const [portalDate, setPortalDate] = useState("");
  const [view, setView] = useState<View>("resumo");
  const [developmentSection, setDevelopmentSection] = useState<DevelopmentSection>("cofre");
  const [department, setDepartment] = useState<Department>("global");
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"pendentes" | "concluidas" | "todas">("pendentes");
  const [notice, setNotice] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | TaskStatus>("Todos");
  const [ownerFilter, setOwnerFilter] = useState("Todos");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<InventoryCategory>("food");
  const [selectedInvoiceDelivery, setSelectedInvoiceDelivery] = useState<string | null>(null);
  const [billingDeliveries, setBillingDeliveries] = useState<BillingDelivery[]>([]);
  const [billingTab, setBillingTab] = useState<"summary" | "delivery">("summary");
  const [billingMonth, setBillingMonth] = useState("Agosto 2026");
  const [billingSupplier, setBillingSupplier] = useState<BillingSupplier>("HAVI");
  const [monthlyInputs, setMonthlyInputs] = useState({ sales: "", openingFood: "", openingPaper: "", openingOps: "", lossesFood: "", lossesPaper: "", mealsFood: "", mealsPaper: "", promoFood: "", promoPaper: "", closingFood: "", closingPaper: "", closingOps: "" });
  const [showNewBillingDelivery, setShowNewBillingDelivery] = useState(false);
  const [newBillingDate, setNewBillingDate] = useState("");
  const [billingDocuments, setBillingDocuments] = useState<BillingDocument[]>([]);
  const [billingCalculated, setBillingCalculated] = useState(false);
  const [billingUploadBusy, setBillingUploadBusy] = useState<"havi" | "mystore" | null>(null);
  const haviInputRef = useRef<HTMLInputElement>(null);
  const myStoreInputRef = useRef<HTMLInputElement>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>("Todos");
  const [productSort, setProductSort] = useState<{ key: ProductSortKey; direction: "asc" | "desc" }>({ key: "description", direction: "asc" });
  const [r2pMonth, setR2pMonth] = useState(8);
  const [tellTheArchesMonth, setTellTheArchesMonth] = useState(7);
  const [tellTheArchesPeriod, setTellTheArchesPeriod] = useState<"monthly" | "ytd">("monthly");
  const [objectiveMonth, setObjectiveMonth] = useState("2026-07");
  const [boardMode, setBoardMode] = useState<"tabela" | "kanban">("tabela");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dataReady, setDataReady] = useState(false);
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>(defaultSharedFolders);
  const [folderDrafts, setFolderDrafts] = useState<Record<string, number>>({});
  const [editingFolderCounts, setEditingFolderCounts] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authLogin, setAuthLogin] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [cleaningInterventions, setCleaningInterventions] = useState<CleaningIntervention[]>([]);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [interventionDraft, setInterventionDraft] = useState<InterventionDraft>(() => emptyInterventionDraft(qualityCleaningAreas[0]));
  const [interventionBusy, setInterventionBusy] = useState(false);
  const [evaluationMonth, setEvaluationMonth] = useState("2026-08");
  const [areaEvaluationDraft, setAreaEvaluationDraft] = useState<AreaEvaluationDraft>({});
  const [areaEvaluationHistory, setAreaEvaluationHistory] = useState<AreaEvaluation[]>([]);
  const [evaluationBusy, setEvaluationBusy] = useState(false);
  const [evaluationUpdatedAt, setEvaluationUpdatedAt] = useState<string | null>(null);
  const [collapsedEvaluationDepartments, setCollapsedEvaluationDepartments] = useState<Partial<Record<EvaluationDepartment, boolean>>>({});
  const [talentCandidates, setTalentCandidates] = useState<TalentCandidate[]>([]);
  const [talentLoading, setTalentLoading] = useState(false);

  useEffect(() => {
    const formattedDate = new Intl.DateTimeFormat("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Lisbon",
    }).format(new Date());
    setPortalDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
  }, []);

  useEffect(() => {
    if (view === "desenvolvimento" && currentUser && currentUser.role !== "admin") setView("resumo");
  }, [view, currentUser]);

  useEffect(() => {
    if (!notice.startsWith("Descarga validada")) return;
    setBillingCalculated(true);
    setNotice("Cálculo da descarga concluído. Os resultados serão preenchidos após a leitura dos ficheiros.");
  }, [notice]);

  useEffect(() => {
    if (!currentUser) return;
    if (!selectedInvoiceDelivery) { setBillingDocuments([]); return; }
    const deliveryDate = selectedInvoiceDelivery;
    fetch(`/api/faturacao?deliveryDate=${deliveryDate}`).then((response) => response.json()).then((data: { documents?: BillingDocument[] }) => setBillingDocuments(data.documents || [])).catch(() => setBillingDocuments([]));
  }, [currentUser, selectedInvoiceDelivery]);

  async function uploadBillingDocuments(type: "havi" | "mystore", files: FileList | null) {
    if (!files?.length) return;
    setBillingUploadBusy(type);
    try {
      const form = new FormData();
      if (!selectedInvoiceDelivery) throw new Error("Selecione uma descarga antes de carregar documentos.");
      form.append("deliveryDate", selectedInvoiceDelivery);
      form.append("supplier", billingDeliveries.find((delivery) => delivery.id === selectedInvoiceDelivery)?.supplier || "HAVI");
      form.append("documentType", type);
      Array.from(files).forEach((file) => form.append("documents", file));
      const response = await fetch("/api/faturacao", { method: "POST", body: form });
      const data = await response.json() as { documents?: BillingDocument[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os documentos.");
      setBillingDocuments((current) => [...(data.documents || []), ...current]); setBillingCalculated(false);
      setNotice(type === "havi" ? "Fatura HAVI carregada com sucesso." : "Documento(s) My Store carregado(s) com sucesso.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível carregar os documentos."); }
    finally { setBillingUploadBusy(null); if (type === "havi" && haviInputRef.current) haviInputRef.current.value = ""; if (type === "mystore" && myStoreInputRef.current) myStoreInputRef.current.value = ""; }
  }

  async function deleteBillingDelivery() {
    if (!selectedInvoiceDelivery || !window.confirm("Eliminar esta descarga e todos os documentos associados?")) return;
    const response = await fetch(`/api/faturacao?deliveryDate=${selectedInvoiceDelivery}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setNotice(data.error || "Não foi possível eliminar a descarga."); return; }
    setBillingDocuments([]); setBillingDeliveries((items) => items.filter((item) => item.date !== selectedInvoiceDelivery)); setSelectedInvoiceDelivery(null); setBillingTab("summary"); setNotice("Descarga eliminada.");
  }

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me/").then((response) => response.json()).then((data: { user: AppUser | null; setupRequired: boolean }) => {
      if (!active) return;
      setCurrentUser(data.user);
      setSetupRequired(data.setupRequired);
      if (data.setupRequired) {
        setAuthMode("register");
        setAuthName("Tiago Soutelo");
        setAuthLogin("tiago.soutelo@pt.mcd.com");
      }
    }).catch(() => setAuthMessage("Não foi possível verificar o acesso.")).finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("load failed");
        const data = await response.json() as { tasks: Task[] };
        if (data.tasks.length) {
          const qualitySourceTasks = initialTasks.filter((task) => task.department === "qualidade");
          const savedQualityIds = new Set(data.tasks.filter((task) => task.department === "qualidade").map((task) => task.id));
          const missingQualityTasks = qualitySourceTasks.filter((task) => !savedQualityIds.has(task.id));
          if (missingQualityTasks.length && currentUser.role !== "consulta") {
            const createdTasks = await Promise.all(missingQualityTasks.map(async ({ id: _id, ...task }) => {
              const createResponse = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) });
              const created = await createResponse.json() as { task?: Task };
              return created.task;
            }));
            data.tasks.push(...createdTasks.filter((task): task is Task => Boolean(task)));
          }
          const normalizedTasks = data.tasks.map((task) => {
            const normalized = { ...task, department: (task.department as string) === "segit" ? "manutencao" : task.department } as Task;
            const sourceTask = normalized.department === "qualidade" ? initialTasks.find((item) => item.id === normalized.id && item.department === "qualidade") : undefined;
            return sourceTask ? { ...normalized, title: sourceTask.title, area: sourceTask.area, due: sourceTask.due, assignee: sourceTask.assignee, assigneeName: sourceTask.assigneeName } : normalized;
          });
          if (active) setTasks(normalizedTasks);
        } else {
          const seedResponse = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tasks: initialTasks }) });
          const seeded = await seedResponse.json() as { tasks: Task[] };
          if (active && seeded.tasks) setTasks(seeded.tasks);
        }
      } catch {
        setNotice("A trabalhar em modo local. As alterações podem não ficar guardadas.");
      } finally {
        if (active) setDataReady(true);
      }
    }
    loadTasks();
    return () => { active = false; };
  }, [currentUser]);

  useEffect(() => {
    const interventionDepartment = department === "qualidade" || department === "cliente" || department === "pessoas" || department === "manutencao" ? department : null;
    if (!currentUser || view !== "areas" || !interventionDepartment) return;
    let active = true;
    setCleaningInterventions([]);
    setShowInterventionForm(false);
    setInterventionDraft(emptyInterventionDraft(cleaningAreasByDepartment[interventionDepartment][0]));
    fetch(`/api/cleaning-interventions/?department=${interventionDepartment}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data: { interventions: CleaningIntervention[] }) => {
      if (active) setCleaningInterventions(data.interventions);
    }).catch(() => setNotice("Não foi possível carregar o planeamento das intervenções."));
    fetch(`/api/area-evaluations/?department=${interventionDepartment}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data: { evaluations: AreaEvaluation[] }) => {
      if (active) setAreaEvaluationHistory(data.evaluations);
    }).catch(() => setAreaEvaluationHistory([]));
    return () => { active = false; };
  }, [currentUser, department, view]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    fetch("/api/settings/folders").then((response) => response.ok ? response.json() : Promise.reject()).then((data: { folders: SharedFolder[] }) => {
      if (active && data.folders.length) setSharedFolders(data.folders);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [currentUser]);

  useEffect(() => {
    if (view !== "configuracoes" || currentUser?.role !== "admin") return;
    fetch("/api/auth/users/").then((response) => response.ok ? response.json() : Promise.reject()).then((data: { users: ManagedUser[] }) => setManagedUsers(data.users)).catch(() => setNotice("Não foi possível carregar os utilizadores."));
  }, [view, currentUser]);

  useEffect(() => {
    if (view !== "talento" || department !== "pessoas" || !currentUser || !(currentUser.role === "admin" || currentUser.role === "editor" && currentUser.department === "pessoas")) return;
    let active = true;
    setTalentLoading(true);
    fetch("/api/candidaturas").then((response) => response.ok ? response.json() : Promise.reject()).then((data: { candidates: TalentCandidate[] }) => {
      if (active) setTalentCandidates(data.candidates);
    }).catch(() => setNotice("Não foi possível carregar as candidaturas.")).finally(() => { if (active) setTalentLoading(false); });
    return () => { active = false; };
  }, [view, department, currentUser]);

  useEffect(() => {
    if (!currentUser || view !== "areasglobais") return;
    let active = true;
    const blank = Object.fromEntries((Object.entries(cleaningAreasByDepartment) as [EvaluationDepartment, readonly string[]][]).flatMap(([departmentId, areas]) => areas.map((area) => [evaluationKey(departmentId, area), { cleaningRating: "" as AreaRating, maintenanceRating: "" as AreaRating }])));
    fetch(`/api/area-evaluations/?month=${evaluationMonth}`).then((response) => response.ok ? response.json() : Promise.reject()).then((data: { evaluations: AreaEvaluation[] }) => {
      if (!active) return;
      const next = { ...blank };
      data.evaluations.forEach((evaluation) => { next[evaluationKey(evaluation.department, evaluation.area)] = { cleaningRating: evaluation.cleaningRating, maintenanceRating: evaluation.maintenanceRating }; });
      setAreaEvaluationDraft(next);
      setEvaluationUpdatedAt(data.evaluations.map((item) => item.evaluatedAt).sort().at(-1) ?? null);
    }).catch(() => setNotice("Não foi possível carregar as avaliações mensais."));
    return () => { active = false; };
  }, [currentUser, view, evaluationMonth]);

  const displayTasks = useMemo(() => {
    const qualitySourceTasks = initialTasks.filter((task) => task.department === "qualidade");
    const qualitySourceIds = new Set(qualitySourceTasks.map((task) => task.id));
    const savedTasksById = new Map(tasks.map((task) => [task.id, task]));
    const refreshedQualityTasks = qualitySourceTasks.map((task) => {
      const saved = savedTasksById.get(task.id);
      return saved ? { ...task, status: saved.status, done: saved.done, priority: saved.priority } : task;
    });
    return [...tasks.filter((task) => task.department !== "qualidade" || !qualitySourceIds.has(task.id)), ...refreshedQualityTasks];
  }, [tasks]);
  const scopedTasks = displayTasks.filter((task) => department === "global" || task.department === department);
  const managerTaskSummary = useMemo(() => ownerOptions.map((owner) => {
    const managerTasks = scopedTasks.filter((task) => task.assigneeName === owner.name);
    return { ...owner, completed: managerTasks.filter((task) => task.status === "Concluído" || task.done).length, pending: managerTasks.filter((task) => (task.status ?? "Por fazer") !== "Concluído" && (task.status ?? "Por fazer") !== "Não realizada").length, notDone: managerTasks.filter((task) => task.status === "Não realizada").length };
  }).filter((manager) => manager.completed + manager.pending + manager.notDone > 0), [scopedTasks]);
  const pending = scopedTasks.filter((task) => !task.done).length;
  const completed = scopedTasks.length - pending;
  const completion = scopedTasks.length ? Math.round((completed / scopedTasks.length) * 100) : 0;
  const activeProfile = departmentProfiles[department];
  const activeDepartment = departments.find((item) => item.id === department);
  const departmentLabel = activeDepartment?.label ?? "Visão global";
  const interventionDepartment = department === "qualidade" || department === "cliente" || department === "pessoas" || department === "manutencao" ? department : null;
  const selectedCleaningAreas: readonly string[] = interventionDepartment ? cleaningAreasByDepartment[interventionDepartment] : [];
  const canManageCleaning = Boolean(interventionDepartment && (currentUser?.role === "admin" || currentUser?.role === "editor" && currentUser.department === interventionDepartment));
  const openInterventions = cleaningInterventions.filter((item) => item.status !== "Encerrada").length;
  const closedInterventions = cleaningInterventions.filter((item) => item.status === "Encerrada").length;
  const areaRatingStats = useMemo(() => {
    const currentEvaluations = (Object.entries(cleaningAreasByDepartment) as [EvaluationDepartment, readonly string[]][]).flatMap(([departmentId, areas]) => areas.map((area) => areaEvaluationDraft[evaluationKey(departmentId, area)] ?? { cleaningRating: "" as AreaRating, maintenanceRating: "" as AreaRating }));
    const values = currentEvaluations.flatMap((item) => [item.cleaningRating, item.maintenanceRating]).filter((rating): rating is Exclude<AreaRating, ""> => Boolean(rating));
    const total = (Object.values(cleaningAreasByDepartment) as readonly (readonly string[])[]).reduce((sum, areas) => sum + areas.length * 2, 0);
    const bom = values.filter((rating) => rating === "Bom").length;
    const aceitavel = values.filter((rating) => rating === "Aceitável").length;
    const melhorar = values.filter((rating) => rating === "Necessita Melhorar").length;
    const naoAceitavel = values.filter((rating) => rating === "Não aceitável").length;
    const share = (count: number) => values.length ? Math.round(count / values.length * 100) : 0;
    return {
      rated: values.length,
      total,
      completionPercent: total ? Math.round(values.length / total * 100) : 0,
      bom, bomPercent: share(bom),
      aceitavel, aceitavelPercent: share(aceitavel),
      melhorar, melhorarPercent: share(melhorar),
      naoAceitavel, naoAceitavelPercent: share(naoAceitavel),
    };
  }, [areaEvaluationDraft]);
  const departmentEvaluationSummaries = useMemo(() => (Object.entries(cleaningAreasByDepartment) as [EvaluationDepartment, readonly string[]][]).map(([departmentId, areas]) => {
    const evaluations = areas.map((area) => areaEvaluationDraft[evaluationKey(departmentId, area)] ?? { cleaningRating: "" as AreaRating, maintenanceRating: "" as AreaRating });
    const cleaningRatings = evaluations.map((item) => item.cleaningRating);
    const maintenanceRatings = evaluations.map((item) => item.maintenanceRating);
    return {
      departmentId,
      cleaningRating: globalAreaRating(cleaningRatings),
      cleaningPercent: areaRatingPercentage(cleaningRatings),
      maintenanceRating: globalAreaRating(maintenanceRatings),
      maintenancePercent: areaRatingPercentage(maintenanceRatings),
    };
  }), [areaEvaluationDraft]);
  const departmentEvaluationHistorySummaries = useMemo(() => {
    const byMonth = new Map<string, AreaEvaluation[]>();
    areaEvaluationHistory.forEach((item) => byMonth.set(item.month, [...(byMonth.get(item.month) ?? []), item]));
    return [...byMonth.entries()].map(([month, items]) => {
      const cleaningRatings = items.map((item) => item.cleaningRating);
      const maintenanceRatings = items.map((item) => item.maintenanceRating);
      return {
        month,
        cleaningPercent: areaRatingPercentage(cleaningRatings),
        cleaningRating: globalAreaRating(cleaningRatings),
        maintenancePercent: areaRatingPercentage(maintenanceRatings),
        maintenanceRating: globalAreaRating(maintenanceRatings),
        rated: items.filter((item) => item.cleaningRating || item.maintenanceRating).length,
        total: selectedCleaningAreas.length,
      };
    }).sort((a, b) => b.month.localeCompare(a.month));
  }, [areaEvaluationHistory, selectedCleaningAreas.length]);
  const selectedObjectiveMonth = objectiveMonthOptions.find((item) => item.value === objectiveMonth) ?? objectiveMonthOptions[6];
  const selectedObjectiveSnapshot = objectivesByMonth[objectiveMonth];
  const allSelectedObjectives = selectedObjectiveSnapshot?.objectives ?? [];
  const selectedObjectives = department === "global"
    ? allSelectedObjectives
    : allSelectedObjectives.filter((objective) => objectiveDepartments[objective.theme]?.name === activeDepartment?.label);
  const objectivePointGroups = useMemo(() => [...new Set(selectedObjectives.map((item) => item.possiblePoints))]
    .sort((a, b) => (b ?? -1) - (a ?? -1))
    .map((points) => ({
      points,
      objectives: selectedObjectives.filter((item) => item.possiblePoints === points).sort((a, b) => objectiveResultOrder.indexOf(getObjectiveResult(a)) - objectiveResultOrder.indexOf(getObjectiveResult(b))),
    })), [selectedObjectives]);
  const objectiveStats = useMemo(() => {
    const total = selectedObjectives.length;
    const possiblePoints = selectedObjectives.reduce((sum, item) => sum + (item.possiblePoints ?? 0), 0);
    const achievedPoints = selectedObjectives.reduce((sum, item) => sum + (item.achievedPoints ?? 0), 0);
    const count = (result: ObjectiveResult) => selectedObjectives.filter((item) => getObjectiveResult(item) === result).length;
    const percent = (value: number) => total ? Math.round((value / total) * 100) : 0;
    const superados = count("Superado");
    const atingidos = count("Atingido");
    const proximos = count("Próximo");
    const naoAtingidos = count("Não Atingido");
    return {
      total,
      possiblePoints,
      achievedPoints,
      monthlyPercent: department === "global" ? (selectedObjectiveSnapshot?.monthlyPercent ?? (possiblePoints ? Math.round((achievedPoints / possiblePoints) * 100) : 0)) : (possiblePoints ? Math.round((achievedPoints / possiblePoints) * 100) : 0),
      superados: { count: superados, percent: percent(superados) },
      atingidos: { count: atingidos, percent: percent(atingidos) },
      proximos: { count: proximos, percent: percent(proximos) },
      naoAtingidos: { count: naoAtingidos, percent: percent(naoAtingidos) },
    };
  }, [selectedObjectives, selectedObjectiveSnapshot, department]);
  const objectiveAnalysis = useMemo(() => {
    const positive = selectedObjectives.filter((item) => ["Superado", "Atingido"].includes(getObjectiveResult(item)));
    const near = selectedObjectives.filter((item) => getObjectiveResult(item) === "Próximo");
    const unmet = selectedObjectives.filter((item) => getObjectiveResult(item) === "Não Atingido");
    const onTrackPercent = objectiveStats.total ? Math.round((positive.length / objectiveStats.total) * 100) : 0;
    const status = objectiveStats.monthlyPercent >= 85 ? { label: "Desempenho forte", tone: "strong" } : objectiveStats.monthlyPercent >= 65 ? { label: "Em evolução", tone: "progress" } : { label: "Requer atenção", tone: "attention" };
    return {
      ...status,
      onTrackPercent,
      remainingPoints: Math.max(0, objectiveStats.possiblePoints - objectiveStats.achievedPoints),
      positiveNames: positive.sort((a, b) => (b.achievedPercent ?? 0) - (a.achievedPercent ?? 0)).map((item) => item.theme),
      nearNames: near.sort((a, b) => (b.possiblePoints ?? 0) - (a.possiblePoints ?? 0)).map((item) => item.theme),
      priorityNames: unmet.sort((a, b) => (b.possiblePoints ?? 0) - (a.possiblePoints ?? 0)).map((item) => item.theme),
    };
  }, [selectedObjectives, objectiveStats]);

  const visibleTasks = useMemo(() => {
    if (filter === "pendentes") return scopedTasks.filter((task) => !task.done);
    if (filter === "concluidas") return scopedTasks.filter((task) => task.done);
    return scopedTasks;
  }, [filter, scopedTasks]);

  const currentWeekTasks = useMemo(() => scopedTasks.filter((task) => {
    const status = task.status ?? (task.done ? "Concluído" : "Por fazer");
    return !task.done && status !== "Concluído" && /^(Semanal|Hoje|Amanhã)/.test(task.due);
  }), [scopedTasks]);

  const boardTasks = useMemo(() => scopedTasks.filter((task) => {
    const status = task.status ?? (task.done ? "Concluído" : "Por fazer");
    const matchesStatus = statusFilter === "Todos" || status === statusFilter;
    const matchesOwner = ownerFilter === "Todos" || task.assigneeName === ownerFilter;
    const matchesVisibility = !hideCompleted || status !== "Concluído";
    const query = taskSearch.trim().toLocaleLowerCase("pt");
    const matchesSearch = !query || [task.title, task.area, task.assigneeName ?? "", task.due].some((value) => value.toLocaleLowerCase("pt").includes(query));
    return matchesStatus && matchesOwner && matchesVisibility && matchesSearch;
  }).sort((a, b) => sortAsc ? a.id - b.id : b.id - a.id), [scopedTasks, statusFilter, ownerFilter, hideCompleted, taskSearch, sortAsc]);

  const boardGroups = useMemo(() => {
    const groups = [
      { id: "semanais", label: "Tarefas semanais", color: "#2f93c9", tasks: boardTasks.filter((task) => task.due.startsWith("Semanal")) },
      { id: "mensais", label: "Tarefas mensais e quinzenais", color: "#579bfc", tasks: boardTasks.filter((task) => !task.due.startsWith("Semanal")) },
    ];
    return groups.filter((group) => group.tasks.length || !taskSearch);
  }, [boardTasks, taskSearch]);

  const visibleInventoryProducts = useMemo(() => {
    const query = inventorySearch.trim().toLocaleLowerCase("pt");
    const direction = productSort.direction === "asc" ? 1 : -1;
    return inventoryProducts.filter((product) => {
      const matchesCategory = product.category === selectedInventoryCategory;
      const matchesStatus = inventoryStatus === "Todos" || product.status === inventoryStatus;
      const matchesSearch = !query || [product.code, product.description, product.source, product.unit, product.group].some((value) => value.toLocaleLowerCase("pt").includes(query));
      return matchesCategory && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const left = a[productSort.key];
      const right = b[productSort.key];
      if (typeof left === "string" && typeof right === "string") return left.localeCompare(right, "pt", { numeric: true }) * direction;
      return (Number(left) - Number(right)) * direction;
    });
  }, [inventorySearch, inventoryStatus, productSort, selectedInventoryCategory]);

  const r2pDashboard = useMemo(() => {
    const days = r2pData.days.filter((day) => day.month === r2pMonth);
    const target = r2pTargetForMonth(r2pMonth);
    const values = days.flatMap((day) => day.hourly.filter((value): value is number => value !== null));
    const dailyAverages = days.map((day) => ({ day, value: average(day.hourly.filter((value): value is number => value !== null)) })).filter((item) => item.value > 0);
    const hourlyRecords = days.flatMap((day) => day.hourly.map((value, index) => value === null ? null : ({ day, hour: r2pData.hours[index], value }))).filter((item): item is { day: R2PDay; hour: string; value: number } => item !== null);
    const hourAverages = r2pData.hours.map((hour, index) => ({ hour, value: average(days.map((day) => day.hourly[index]).filter((value): value is number => value !== null)) }));
    const validHours = hourAverages.filter((item) => item.value > 0);
    const quarter = Math.ceil(r2pMonth / 3);
    const quarterDays = r2pData.days.filter((day) => Math.ceil(day.month / 3) === quarter);
    return {
      days,
      average: average(values),
      target,
      targetRate: values.length ? Math.round((values.filter((value) => meetsR2PTarget(value, r2pMonth)).length / values.length) * 100) : 0,
      bestHour: [...validHours].sort((a, b) => a.value - b.value)[0] ?? { hour: "—", value: 0 },
      bestDay: [...dailyAverages].sort((a, b) => a.value - b.value)[0],
      worstDay: [...dailyAverages].sort((a, b) => b.value - a.value)[0],
      bestRecord: [...hourlyRecords].sort((a, b) => a.value - b.value)[0],
      worstRecord: [...hourlyRecords].sort((a, b) => b.value - a.value)[0],
      hourAverages,
      monthlyRanking: rankManagers(days),
      quarterlyRanking: rankManagers(quarterDays),
      quarter,
    };
  }, [r2pMonth]);

  const tellTheArchesDashboard = tellTheArchesPeriod === "ytd" ? tellTheArchesData.ytd : tellTheArchesData.months.find((item) => item.month === tellTheArchesMonth) ?? tellTheArchesData.months.at(-1)!;
  const tellTheArchesComparison = tellTheArchesPeriod === "ytd" ? "período anterior" : "mês anterior";

  function changeProductSort(key: ProductSortKey) {
    setProductSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  async function exportObjectives() {
    if (!selectedObjectives.length || !objectivesExportRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const exportArea = objectivesExportRef.current;
      await document.fonts.ready;
      const canvas = await html2canvas(exportArea, {
        backgroundColor: "#f8faf9",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: exportArea.scrollWidth,
        windowHeight: exportArea.scrollHeight,
        ignoreElements: (element) => element.hasAttribute("data-export-exclude"),
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG indisponível");
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `objetivos-${objectiveMonth}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setNotice(`PNG de ${selectedObjectiveMonth.label} exportado.`);
      window.setTimeout(() => setNotice(""), 2400);
    } catch {
      setNotice("Não foi possível gerar o PNG. Tente novamente.");
    }
  }

  async function updateTask(id: number, changes: Partial<Task>) {
    if (!currentUser || currentUser.role === "consulta") return;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...changes, done: changes.status ? changes.status === "Concluído" : task.done } : task));
    try {
      await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) });
    } catch {
      setNotice("Alteração aplicada localmente; não foi possível guardar.");
    }
  }

  function toggleTask(id: number) {
    if (!currentUser || currentUser.role === "consulta") return;
    const task = tasks.find((item) => item.id === id);
    if (task) updateTask(id, { status: task.done ? "Por fazer" : "Concluído", done: !task.done });
  }

  function beginFolderUpdate() {
    if (currentUser?.role !== "admin") return;
    setFolderDrafts(Object.fromEntries(sharedFolders.map((folder) => [folder.id, folder.fileCount])));
    setEditingFolderCounts(true);
  }

  async function saveFolderCounts() {
    if (currentUser?.role !== "admin") return;
    const nextFolders = sharedFolders.map((folder) => ({ ...folder, fileCount: Math.max(0, Math.round(folderDrafts[folder.id] ?? folder.fileCount)), updatedAt: new Date().toISOString() }));
    setSharedFolders(nextFolders);
    setEditingFolderCounts(false);
    try {
      const response = await fetch("/api/settings/folders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folders: nextFolders.map(({ id, fileCount }) => ({ id, fileCount })) }) });
      if (!response.ok) throw new Error("save failed");
      const data = await response.json() as { folders: SharedFolder[] };
      setSharedFolders(data.folders);
      setNotice("Quantidade de ficheiros atualizada.");
    } catch {
      setNotice("Contagens atualizadas nesta sessão; não foi possível guardar.");
    }
  }

  async function createTask(group: "semanais" | "mensais" = "semanais") {
    if (!currentUser || currentUser.role === "consulta") return;
    const draft: Omit<Task, "id"> = {
      title: "Nova verificação de rotina",
      area: "Área geral",
      due: group === "semanais" ? "Semanal · 2.ª-feira" : "Mensal",
      assignee: "TS",
      priority: "Média",
      done: false,
      status: "Por fazer",
      department: department === "global" ? "qualidade" : department,
    };
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json() as { task: Task };
      if (data.task) setTasks((current) => [data.task, ...current]);
    } catch {
      const id = Math.max(0, ...tasks.map((task) => task.id)) + 1;
      setTasks((current) => [{ id, ...draft }, ...current]);
    }
    setFilter("pendentes");
    setView("tarefas");
    setNotice(`Nova tarefa adicionada a ${departmentLabel}.`);
    window.setTimeout(() => setNotice(""), 2400);
  }

  async function deleteTask(id: number) {
    if (!currentUser || currentUser.role === "consulta") return;
    setTasks((current) => current.filter((task) => task.id !== id));
    try { await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch { setNotice("Tarefa removida apenas nesta sessão."); }
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const response = await fetch(`/api/auth/${authMode === "register" ? "register" : "login"}/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: authName, login: authLogin, password: authPassword }) });
      const data = await response.json() as { user?: AppUser; pending?: boolean; message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir o acesso.");
      if (data.user) {
        setCurrentUser(data.user);
        setSetupRequired(false);
        setAuthPassword("");
        setNotice("Sessão iniciada com sucesso.");
      } else {
        setAuthMessage(data.message || "Pedido enviado para aprovação.");
        setAuthMode("login");
        setAuthName("");
        setAuthPassword("");
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout/", { method: "POST" });
    setCurrentUser(null);
    setView("resumo");
    setDataReady(false);
    setAuthMessage("");
    setAuthMode("login");
  }

  async function updateManagedUser(id: number, changes: { role?: AppRole; department?: UserDepartment; status?: "ativo" | "pendente" | "rejeitado" }) {
    const response = await fetch("/api/auth/users/", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) });
    const data = await response.json() as { user?: ManagedUser; error?: string };
    if (!response.ok || !data.user) { setNotice(data.error || "Não foi possível atualizar o utilizador."); return; }
    setManagedUsers((users) => users.map((user) => user.id === id ? data.user! : user));
    setNotice(changes.status === "ativo" ? "Acesso aprovado." : changes.department !== undefined ? "Departamento atualizado." : "Nível de acesso atualizado.");
  }

  async function deleteManagedUser(user: ManagedUser) {
    if (currentUser?.role !== "admin" || user.id === currentUser.id) return;
    if (!window.confirm(`Eliminar definitivamente o utilizador ${user.login}?`)) return;
    const response = await fetch("/api/auth/users/", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const data = await response.json() as { deleted?: boolean; error?: string };
    if (!response.ok || !data.deleted) { setNotice(data.error || "Não foi possível eliminar o utilizador."); return; }
    setManagedUsers((users) => users.filter((item) => item.id !== user.id));
    setNotice("Utilizador eliminado definitivamente.");
  }

  async function scheduleIntervention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageCleaning || interventionBusy) return;
    setInterventionBusy(true);
    try {
      if (!interventionDepartment) throw new Error("Selecione um departamento válido.");
      const response = await fetch("/api/cleaning-interventions/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...interventionDraft, department: interventionDepartment, estimatedHours: Number(interventionDraft.estimatedHours) }) });
      const data = await response.json() as { intervention?: CleaningIntervention; error?: string };
      if (!response.ok || !data.intervention) throw new Error(data.error || "Não foi possível agendar a intervenção.");
      setCleaningInterventions((current) => [...current, data.intervention!].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.id - b.id));
      setInterventionDraft(emptyInterventionDraft(selectedCleaningAreas[0]));
      setShowInterventionForm(false);
      setNotice("Intervenção agendada.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível agendar a intervenção.");
    } finally {
      setInterventionBusy(false);
    }
  }

  async function setInterventionClosed(intervention: CleaningIntervention, closed: boolean) {
    if (!canManageCleaning) return;
    const status = closed ? "Encerrada" : "Agendada";
    const response = await fetch("/api/cleaning-interventions/", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: intervention.id, status }) });
    const data = await response.json() as { intervention?: CleaningIntervention; error?: string };
    if (!response.ok || !data.intervention) { setNotice(data.error || "Não foi possível atualizar a intervenção."); return; }
    setCleaningInterventions((current) => current.map((item) => item.id === intervention.id ? data.intervention! : item));
    setNotice(closed ? "Intervenção encerrada." : "Intervenção reaberta.");
  }

  async function saveAreaEvaluations() {
    if (currentUser?.role !== "admin" || evaluationBusy) return;
    setEvaluationBusy(true);
    const evaluations = (Object.entries(cleaningAreasByDepartment) as [EvaluationDepartment, readonly string[]][]).flatMap(([departmentId, areas]) => areas.map((area) => {
      const ratings = areaEvaluationDraft[evaluationKey(departmentId, area)] ?? { cleaningRating: "", maintenanceRating: "" };
      return { department: departmentId, area, ...ratings };
    }));
    try {
      const response = await fetch("/api/area-evaluations/", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month: evaluationMonth, evaluations }) });
      const data = await response.json() as { evaluations?: AreaEvaluation[]; evaluatedAt?: string; error?: string };
      if (!response.ok || !data.evaluations) throw new Error(data.error || "Não foi possível guardar a avaliação.");
      setEvaluationUpdatedAt(data.evaluatedAt ?? new Date().toISOString());
      setNotice("Avaliação mensal guardada.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível guardar a avaliação.");
    } finally {
      setEvaluationBusy(false);
    }
  }

  async function updateTalentCandidate(candidate: TalentCandidate, status: TalentCandidateStatus) {
    const response = await fetch("/api/candidaturas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: candidate.id, status, profile: candidate.profile }) });
    const data = await response.json() as { candidate?: TalentCandidate; error?: string };
    if (!response.ok || !data.candidate) { setNotice(data.error || "Não foi possível atualizar a candidatura."); return; }
    setTalentCandidates((current) => current.map((item) => item.id === candidate.id ? data.candidate! : item));
    setNotice("Estado da candidatura atualizado.");
  }

  async function updateTalentProfile(candidate: TalentCandidate, profile: TalentCandidateProfile) {
    const response = await fetch("/api/candidaturas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: candidate.id, status: candidate.status, profile }) });
    const data = await response.json() as { candidate?: TalentCandidate; error?: string };
    if (!response.ok || !data.candidate) { setNotice(data.error || "Não foi possível atualizar o perfil."); return; }
    setTalentCandidates((current) => current.map((item) => item.id === candidate.id ? data.candidate! : item));
    setNotice("Perfil da candidatura atualizado.");
  }

  const roleLabel = (role: AppRole) => role === "admin" ? "Administrador" : role === "editor" ? "Editor" : "Consulta";
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "editor";

  const navItems: { id: View; label: string; glyph: string }[] = [
    { id: "resumo", label: "Resumo", glyph: "▦" },
    { id: "tarefas", label: "Tarefas", glyph: "✓" },
    { id: "objetivos", label: "Objetivos", glyph: "◎" },
    { id: "areasglobais", label: "Áreas", glyph: "⌂" },
    { id: "equipa", label: "Equipa", glyph: "♟" },
    { id: "gerenteloja" as View, label: "Gerente Loja", glyph: "♛" },
    { id: "faturacao" as View, label: "Controlo faturação", glyph: "€" },
    { id: "alertas" as View, label: "Central de Alertas", glyph: "🔔" },
    ...(currentUser?.role === "admin" ? [{ id: "desenvolvimento" as View, label: "Em desenvolvimento", glyph: "◇" }, { id: "configuracoes" as View, label: "Configurações", glyph: "⚙" }] : []),
  ];

  if (!authReady) return <main className="auth-shell"><div className="auth-card auth-loading"><span className="auth-logo">M</span><p>A preparar o McDonald&apos;s Imperial…</p></div></main>;

  if (!currentUser) return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand"><span className="auth-logo">M</span><div><strong>McDonald&apos;s Imperial</strong><small>Portal de gestão</small></div></div>
        <div className="auth-heading"><span className="eyebrow">Acesso reservado</span><h1 id="auth-title">{setupRequired ? "Criar administrador" : authMode === "login" ? "Iniciar sessão" : "Novo utilizador"}</h1><p>{setupRequired ? "A primeira conta ficará definida como administrador do portal." : authMode === "login" ? "Introduza o seu email e password." : "Preencha o nome, email e password. O administrador terá de aprovar o acesso."}</p></div>
        <form className="auth-form" onSubmit={submitAuth}>
          {(setupRequired || authMode === "register") && <label>Nome completo<input type="text" value={authName} onChange={(event) => setAuthName(event.target.value)} autoComplete="name" minLength={2} maxLength={80} required readOnly={setupRequired} placeholder="ex.: Tiago Soutelo" /></label>}
          <label>{setupRequired ? "Email do administrador" : "Email"}<input type="email" value={authLogin} onChange={(event) => setAuthLogin(event.target.value)} autoComplete="email" required readOnly={setupRequired} placeholder="ex.: nome@empresa.pt" /></label>
          <label>Password<input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={8} required placeholder="Mínimo de 8 caracteres" /></label>
          {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
          <button className="auth-submit" disabled={authBusy}>{authBusy ? "A processar…" : setupRequired ? "Criar conta de administrador" : authMode === "login" ? "Entrar" : "Enviar pedido de acesso"}</button>
        </form>
        {!setupRequired && <button className="auth-switch" onClick={() => { setAuthMode((mode) => mode === "login" ? "register" : "login"); setAuthName(""); setAuthMessage(""); setAuthPassword(""); }}>{authMode === "login" ? "＋ Novo utilizador" : "← Já tenho acesso"}</button>}
        <small className="auth-footnote">{!setupRequired && authMode === "login" ? "A sessão permanece ativa durante 24 horas neste dispositivo." : "O acesso só é disponibilizado após aprovação. As passwords são protegidas e não ficam visíveis ao administrador."}</small>
      </section>
    </main>
  );

  return (
    <main className="app-shell">
      <header className="sidebar platform-header" aria-label="Navegação principal">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span><strong>Plataforma McD</strong><small>Imperial</small></span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => { setView(item.id); if (item.id === "areasglobais" || item.id === "objetivos" || item.id === "equipa") setDepartment("global"); }}>
              <span className="nav-glyph">{item.glyph}</span>{item.label}
              {item.id === "tarefas" && <span className="nav-count">{pending}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-departments" aria-label="Departamentos">
          <div className="sidebar-section-title"><span>Departamentos</span></div>
          <div className="department-list">
            {departments.map((item) => (
              <div className="department-entry" key={item.id}>
                <button
                  className={department === item.id ? "department-tab selected" : "department-tab"}
                  onClick={() => { setDepartment(item.id); setView("resumo"); }}
                  aria-pressed={department === item.id}
                  title={item.label}
                >
                  <span className={`department-initials department-icon department-${item.id}`} role="img" aria-label={item.label}>{item.icon}</span>
                  <span className="department-name">{item.label}</span>
                  {department === item.id && <span className="department-active-dot" />}
                </button>
                {item.id !== "global" && department === item.id && (
                  <div className="department-subtabs" aria-label={`Subsecções de ${item.label}`}>
                    <button className={view === "tarefas" ? "department-subtab active" : "department-subtab"} onClick={() => setView("tarefas")}>
                      ✓ <span>Tarefas</span>
                    </button>
                    <button className={view === "objetivos" ? "department-subtab active" : "department-subtab"} onClick={() => setView("objetivos")}>
                      ◎ <span>Objetivos mensais</span>
                    </button>
                    <button className={view === "areas" ? "department-subtab active" : "department-subtab"} onClick={() => setView("areas")}>
                      ⌂ <span>Áreas de limpeza</span>
                    </button>
                    {item.id === "pessoas" && <button className={view === "talento" ? "department-subtab active" : "department-subtab"} onClick={() => setView("talento")}>
                      ✦ <span>Gestão Talento</span>
                    </button>}
                    {item.id === "qualidade" && <button className={view === "custos" ? "department-subtab active" : "department-subtab"} onClick={() => setView("custos")}>
                      ◫ <span>Custo, Comida, Papel &amp; OPS</span>
                    </button>}
                    {item.id === "qualidade" && <button className={view === "haccp" ? "department-subtab active" : "department-subtab"} onClick={() => setView("haccp")}>
                      ◈ <span>Portal HACCP</span>
                    </button>}
                    {item.id === "cliente" && <>
                    <button className={view === "r2p" ? "department-subtab active" : "department-subtab"} onClick={() => setView("r2p")}>
                      ◷ <span>Tempos de serviço · R2P</span>
                    </button>
                    <button className={view === "tellarches" ? "department-subtab active" : "department-subtab"} onClick={() => setView("tellarches")}>
                      ◈ <span>Tell The Arches</span>
                    </button>
                    </>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button className="profile" aria-label="Terminar sessão" onClick={logout} title="Terminar sessão">
          <span className="avatar">{userInitials(currentUser.name, currentUser.login)}</span>
          <span><strong>{currentUser.name || currentUser.login}</strong><small>{currentUser.login} · {roleLabel(currentUser.role)}</small></span>
          <span className="more">↪</span>
        </button>
      </header>

      <section className="workspace">
        <header className={view === "areasglobais" ? "topbar centered" : "topbar"}>
          <div>
            <p className="date-line">{portalDate}{portalDate && " · "}{activeDepartment && <span className={`department-context-icon department-${activeDepartment.id}`} role="img" aria-label={activeDepartment.label}>{activeDepartment.icon}</span>}{departmentLabel}</p>
            <h1>{viewLabels[view]}</h1>
          </div>
        </header>

        {notice && <div className="toast" role="status">✓ {notice}</div>}

        <div className="content">
          {view === "resumo" && (
            <section className="summary-grid" aria-label="Indicadores principais">
              <article className="metric-card feature">
                <div><span className="eyebrow">Progresso do mês</span><strong className="big-number">{completion}%</strong><p>{department === "qualidade" ? <span className="source-copy">Dados de julho · folha GDR</span> : <><span className="up">↗ 8%</span> face ao mês passado</>}</p></div>
                <div className="ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span>{completed}/{scopedTasks.length}</span></div>
              </article>
              <article className="metric-card"><span className="metric-icon mint">✓</span><div><span className="eyebrow">Concluídas</span><strong>{completed}</strong><p>tarefas este mês</p></div></article>
              <article className="metric-card"><span className="metric-icon coral">!</span><div><span className="eyebrow">Pendentes</span><strong>{pending}</strong><p>{department === "qualidade" ? "registadas na folha GDR" : "2 precisam de atenção"}</p></div></article>
              <article className="metric-card"><span className="metric-icon blue">⌂</span><div><span className="eyebrow">Áreas acompanhadas</span><strong>{activeProfile.zones.filter((zone) => zone.percent >= 80).length}/{activeProfile.zones.length}</strong><p>com progresso ≥ 80%</p></div></article>
            </section>
          )}

          {view === "resumo" && department === "qualidade" && (
            <section className="quality-shortcuts" aria-labelledby="quality-shortcuts-title">
              <div className="shortcut-heading">
                <div><span className="eyebrow">Qualidade &amp; Produtos</span><h2 id="quality-shortcuts-title">Acessos rápidos</h2></div>
                <p>Consulte os objetivos, as áreas de limpeza e os indicadores de custo.</p>
              </div>
              <div className="shortcut-actions">
                <button className="shortcut-button objectives" onClick={() => setView("objetivos")}>
                  <span className="shortcut-icon">◎</span>
                  <span className="shortcut-copy"><strong>Objetivos mensais</strong><small>Food, Paper, OPS e Perdas</small></span>
                  <span className="shortcut-arrow">→</span>
                </button>
                <button className="shortcut-button cleaning" onClick={() => setView("areas")}>
                  <span className="shortcut-icon">✦</span>
                  <span className="shortcut-copy"><strong>Áreas Limpeza</strong><small>Estado e progresso das 7 áreas</small></span>
                  <span className="shortcut-arrow">→</span>
                </button>
                <button className="shortcut-button costs" onClick={() => setView("custos")}>
                  <span className="shortcut-icon">◫</span>
                  <span className="shortcut-copy"><strong>Custo, Comida, Papel &amp; OPS</strong><small>Acompanhar desvios por categoria</small></span>
                  <span className="shortcut-arrow">→</span>
                </button>
              </div>
            </section>
          )}

          {view === "resumo" && (
            <section className="panel tasks-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">Plano de trabalho</span><h2>Tarefas em curso esta semana</h2><p className="summary-panel-copy">Acompanhamento das tarefas semanais, de hoje e de amanhã.</p></div>
                <span className="week-task-count">{currentWeekTasks.length} em curso</span>
              </div>
              <div className="task-list">
                {currentWeekTasks.slice(0, 6).map((task) => (
                  <article className={task.done ? "task-row done" : "task-row"} key={task.id}>
                    <button className="check" disabled={!canEdit} aria-label={`${task.done ? "Reabrir" : "Concluir"} ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done ? "✓" : ""}</button>
                    <div className="task-main"><strong>{task.title}</strong><span>{task.area}</span></div>
                    <span className={`priority ${task.priority.toLowerCase().replace("é", "e")}`}>{task.priority}</span>
                    <span className="due">{task.due}</span>
                    <span className="task-owner" title={task.assigneeName ?? task.assignee}><span className="avatar small">{task.assignee}</span>{task.assigneeName && <span>{task.assigneeName.split(" ")[0]}</span>}</span>
                    <button className="row-more" aria-label={`Mais opções para ${task.title}`}>•••</button>
                  </article>
                ))}
                {currentWeekTasks.length === 0 && <div className="empty-state">Sem tarefas em curso para esta semana.</div>}
              </div>
              <button className="text-button" onClick={() => setView("tarefas")}>Ver todas as tarefas <span>→</span></button>
            </section>
          )}

          {view === "equipa" && (
            <section className="team-page" aria-label="Estrutura da equipa Imperial">
              <div className="team-page-heading">
                <div><span className="eyebrow">McDonald&apos;s Imperial</span><h2>Equipa</h2><p>Estrutura, celebrações e marcos de antiguidade da equipa.</p></div>
                <a className="team-source-link" href={teamMilestonesData.sourceUrl} target="_blank" rel="noreferrer">Consultar ficheiro da equipa ↗</a>
              </div>

              <section className="team-milestones team-page-calendar" aria-labelledby="team-page-calendar-title">
                <div className="team-milestones-heading"><div><span className="eyebrow">Agenda da equipa</span><h2 id="team-page-calendar-title">Aniversários e antiguidade</h2><p>Datas assinaladas com detalhe disponível no cursor.</p></div></div>
                <TeamCalendar />
              </section>

              <section className="team-org-section">
                <div className="team-section-heading"><div><span className="eyebrow">Estrutura organizacional</span><h2>Organograma da estrutura</h2><p>Estrutura de liderança apresentada por níveis de responsabilidade.</p></div></div>
                <div className="team-org-chart">
                  {teamMilestonesData.organisation.leadershipLevels.map((level, levelIndex) => <div className="leadership-level-wrap" key={`leadership-${levelIndex}`}>
                    {levelIndex > 0 && <div className="team-org-connector" />}
                    <div className={`team-org-level leadership-level leadership-level-${levelIndex + 1}`}>{level.map((person) => <article className={levelIndex === 0 ? "team-org-card lead" : "team-org-card leadership"} key={person.name}><span className="team-org-avatar">{levelIndex === 0 ? "★" : levelIndex === 1 ? "◆" : levelIndex === 2 ? "◈" : "○"}</span><div><small>{person.label}</small><strong>{person.name}</strong><span>{person.role}</span></div></article>)}</div>
                  </div>)}
                </div>
                <div className="team-management-support"><span className="eyebrow">Apoio à gestão</span><div>{teamMilestonesData.organisation.managementSupport.map((person) => <article key={person.name}><span>◌</span><p><strong>{person.name}</strong><small>{person.role}</small></p></article>)}</div></div>
              </section>

              <section className="team-org-section management-section">
                <div className="team-section-heading"><div><span className="eyebrow">Equipa de gestão</span><h2>Organograma de gestão</h2><p>Estrutura por níveis, seguindo o modelo utilizado no portal HACCP.</p></div><span className="team-section-count">{teamMilestonesData.organisation.managementLevels.flat().length} elementos</span></div>
                <div className="management-org-chart">
                  {teamMilestonesData.organisation.managementLevels.map((level, levelIndex) => <div className="management-org-level-wrap" key={`level-${levelIndex}`}>
                    {levelIndex > 0 && <div className="team-org-connector" />}
                    <div className={`team-org-level management-level level-${levelIndex + 1}`}>{level.map((person) => {
                      const departmentIcon = person.department === "Qualidade & Produtos" ? "🧪" : person.department === "Pessoas" ? "👥" : person.department === "Serviço Cliente" ? "🎧" : person.department === "Manutenção Seg. & IT" ? "🛠️" : person.department ? "★" : undefined;
                      return <article className={levelIndex === 0 ? "team-org-card lead" : "team-org-card management"} key={person.name}><span className="team-org-avatar" title={person.department} aria-label={person.department ? `Departamento: ${person.department}` : undefined}>{departmentIcon ?? (levelIndex === 0 ? "♛" : "●")}</span><div><small>{person.level}</small><strong>{person.name}</strong><span>{person.role}</span></div></article>;
                    })}</div>
                  </div>)}
                </div>
              </section>

              <section className="team-directory-grid">
                <article className="team-directory-card"><div className="team-section-heading"><div><span className="eyebrow">Equipa treinadores</span><h2>Treinadores</h2></div><span className="team-section-count">{teamMilestonesData.organisation.trainers.length}</span></div><div className="team-person-list">{teamMilestonesData.organisation.trainers.map((person) => <div key={person.name}><span>🎓</span><p><strong>{person.name}</strong><small>{person.role}</small></p></div>)}</div></article>
                <article className="team-directory-card"><div className="team-section-heading"><div><span className="eyebrow">Equipa relações públicas</span><h2>Relações públicas</h2></div><span className="team-section-count">{teamMilestonesData.organisation.publicRelations.length}</span></div><div className="team-person-list">{teamMilestonesData.organisation.publicRelations.map((person) => <div key={person.name}><span>🤝</span><p><strong>{person.name}</strong><small>{person.role}</small></p></div>)}</div></article>
                <article className="team-directory-card employees-card"><span className="employees-icon">👥</span><span className="eyebrow">Equipa funcionários</span><strong>{teamMilestonesData.organisation.employees}</strong><p>funcionários ativos na equipa Imperial</p></article>
              </section>
            </section>
          )}

          {view === "gerenteloja" && (
            <section className="manager-page" aria-label="Gerente Loja">
              <div className="availability-frame"><iframe title="Análise de disponibilidades da equipa" src="https://analise-disponibilidades-equipa.tiagosoutelo.chatgpt.site/" /></div>
            </section>
          )}

          {view === "haccp" && department === "qualidade" && (
            <section className="haccp-page" aria-label="Portal HACCP">
              <div className="haccp-heading">
                <div><span className="eyebrow">Qualidade &amp; Produtos</span><h2>Portal HACCP</h2><p>Monitorização integrada da segurança alimentar e dos controlos operacionais.</p></div>
                <a className="talent-application-link" href="https://haccp-monitor-equipa.tiagosoutelo.chatgpt.site/?v=87" target="_blank" rel="noreferrer">Abrir Portal HACCP ↗</a>
              </div>
              <div className="haccp-frame"><iframe title="Portal HACCP" src="https://haccp-monitor-equipa.tiagosoutelo.chatgpt.site/?v=87" /></div>
            </section>
          )}

          {view === "talento" && department === "pessoas" && (
            <section className="talent-page" aria-labelledby="talent-title">
              <div className="talent-heading">
                <div><span className="eyebrow">Pessoas · Recrutamento</span><h2 id="talent-title">Gestão Talento</h2><p>Acompanhe os candidatos e mantenha cada processo atualizado.</p></div>
                <a className="talent-application-link" href="https://candidaturas-imperial.tiagosoutelo.chatgpt.site" target="_blank" rel="noreferrer">＋ Partilhar candidatura ↗</a>
              </div>
              {currentUser?.role === "admin" || currentUser?.role === "editor" && currentUser.department === "pessoas" ? <>
                {(() => {
                  const uniqueCandidates = Array.from(new Map(talentCandidates.map((candidate) => [candidate.email.trim().toLowerCase(), candidate])).values());
                  const jobs = ["Relações Públicas", "Treinadores"] as const;
                  const count = (job: string, profile: TalentCandidateProfile) => uniqueCandidates.filter((candidate) => candidate.jobTitle === job && candidate.profile === profile).length;
                  const table = (job: typeof jobs[number]) => {
                    const candidates = uniqueCandidates.filter((candidate) => candidate.jobTitle === job);
                    return <div className="talent-board" key={job}>
                      <div className="talent-board-heading"><div><span className="eyebrow">Candidaturas</span><h3>{job}</h3></div><span>{talentLoading ? "A carregar…" : `${candidates.length} candidaturas`}</span></div>
                      <div className="talent-table" role="table" aria-label={`Candidaturas ${job}`}>
                        <div className="talent-row header" role="row"><span>Candidato</span><span>Contacto</span><span>Admissão</span><span>Documentos</span><span>Perfil</span><span>Estado</span></div>
                        {candidates.map((candidate) => <div className="talent-row" role="row" key={candidate.id}>
                          <div><strong>{candidate.name}</strong><small>Recebida em {new Date(candidate.createdAt).toLocaleDateString("pt-PT")}</small></div>
                          <div><a href={`mailto:${candidate.email}`}>{candidate.email}</a><small>{candidate.contact}</small></div>
                          <div><strong>{new Date(`${candidate.admissionDate}T00:00:00`).toLocaleDateString("pt-PT")}</strong><small>{candidate.jobTitle}</small></div>
                          <div className="candidate-documents"><a href={`/api/candidaturas/document?id=${candidate.id}&type=cv`} target="_blank" rel="noreferrer">CV ↗</a><a href={`/api/candidaturas/document?id=${candidate.id}&type=cover`} target="_blank" rel="noreferrer">Carta ↗</a></div>
                          <select className={`candidate-profile ${candidate.profile.toLowerCase().replaceAll(" ", "-")}`} value={candidate.profile} onChange={(event) => updateTalentProfile(candidate, event.target.value as TalentCandidateProfile)} aria-label={`Perfil de ${candidate.name}`}><option>Classificar</option><option>Curto prazo</option><option>Médio prazo</option><option>Longo prazo</option><option>Sem perfil</option></select>
                          <select className={`candidate-status ${candidate.status.toLowerCase().replaceAll(" ", "-").replace("á", "a").replace("ã", "a").replace("ç", "c")}`} value={candidate.status} onChange={(event) => updateTalentCandidate(candidate, event.target.value as TalentCandidateStatus)} aria-label={`Estado de ${candidate.name}`}><option>Recebida</option><option>Em análise</option><option>Entrevista</option><option>Admitido</option><option>Não selecionado</option></select>
                        </div>)}
                        {!talentLoading && candidates.length === 0 && <div className="talent-empty"><span>✦</span><div><strong>Ainda não existem candidaturas</strong></div></div>}
                      </div>
                    </div>;
                  };
                  return <><div className="talent-summary grouped">{jobs.map((job) => <article key={job}><div><small>{job}</small><strong>{uniqueCandidates.filter((candidate) => candidate.jobTitle === job).length}<em> candidaturas</em></strong></div><div className="talent-metrics"><span className="short">Curto <b>{count(job, "Curto prazo")}</b></span><span className="medium">Médio <b>{count(job, "Médio prazo")}</b></span><span className="long">Longo <b>{count(job, "Longo prazo")}</b></span><span className="none">Sem perfil <b>{count(job, "Sem perfil")}</b></span></div></article>)}</div>{jobs.map(table)}</>;
                })()}
              </> : <div className="talent-empty restricted"><span>◌</span><div><strong>Acesso reservado à equipa de Pessoas</strong><small>O formulário de candidatura permanece disponível através do botão acima.</small></div></div>}
            </section>
          )}

          {view === "tarefas" && (
            <section className={canEdit ? "board-page" : "board-page read-only"} aria-label="Gestão de tarefas">
              {department === "qualidade" && <div className="board-source-strip">
                <div><span className="source-mark">QP</span><span><strong>Workflow tarefas · Qualidade &amp; Produtos</strong><small>15 tarefas importadas com responsável, periodicidade e dia programado.</small></span></div>
                <a href={qualityTasksSourceUrl} target="_blank" rel="noreferrer">Abrir folha fonte ↗</a>
              </div>}
              <section className="manager-task-summary" aria-label="Resumo de tarefas por gerente">
                {managerTaskSummary.map((manager) => <article key={manager.name}><span className="avatar small">{manager.initials}</span><strong>{manager.name}</strong><small><b>✓ {manager.completed}</b> Concluídas · <b>○ {manager.pending}</b> Por realizar · <b>! {manager.notDone}</b> Não realizadas</small></article>)}
              </section>
              <div className="monday-toolbar">
                <label className="view-picker"><span>⌂</span><select value={boardMode} onChange={(event) => setBoardMode(event.target.value as "tabela" | "kanban")} aria-label="Escolher vista"><option value="tabela">Tabela principal</option><option value="kanban">Kanban</option></select></label>
                <span className="toolbar-divider" />
                {canEdit && <div className="new-item-split"><button onClick={() => createTask()}>Nova tarefa</button><button onClick={() => createTask("mensais")} aria-label="Adicionar tarefa mensal">⌄</button></div>}
                <label className="toolbar-search"><span>⌕</span><input value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} placeholder="Pesquisar" aria-label="Pesquisar tarefas" /></label>
                <label className={ownerFilter !== "Todos" ? "toolbar-control active" : "toolbar-control"}><span>◎</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} aria-label="Filtrar por pessoa"><option>Todos</option>{ownerOptions.map((owner) => <option value={owner.name} key={owner.name}>{owner.name}</option>)}</select></label>
                <label className={statusFilter !== "Todos" ? "toolbar-control active" : "toolbar-control"}><span>▽</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "Todos" | TaskStatus)} aria-label="Filtrar por estado"><option>Todos</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
                <button className="toolbar-action" onClick={() => setSortAsc((current) => !current)}><span>⇅</span> Ordenar</button>
                <button className={hideCompleted ? "toolbar-action active" : "toolbar-action"} onClick={() => setHideCompleted((current) => !current)}><span>◉</span> Ocultar</button>
                <button className="toolbar-action group-label"><span>▣</span> Agrupar por</button>
                <span className="toolbar-more">•••</span>
              </div>

              {!dataReady && <div className="board-loading">A carregar o quadro…</div>}

              {dataReady && boardMode === "tabela" && <div className="monday-board">
                {boardGroups.map((group) => (
                  <div className="board-group" key={group.id} style={{ "--group-color": group.color } as React.CSSProperties}>
                    <button className="group-heading" onClick={() => setCollapsedGroups((current) => ({ ...current, [group.id]: !current[group.id] }))} aria-expanded={!collapsedGroups[group.id]}>
                      <span className="group-chevron">⌄</span><strong>{group.label}</strong><span>{group.tasks.length} itens</span>
                    </button>
                    {!collapsedGroups[group.id] && <>
                      <div className="board-row board-header-row">
                        <span className="row-select"><input type="checkbox" aria-label={`Selecionar ${group.label}`} /></span>
                        <span>Tarefa</span><span>Responsável</span><span>Estado</span><span>Prioridade</span><span>Periodicidade</span><span>Área</span><span />
                      </div>
                      {group.tasks.map((task) => {
                        const taskStatus = task.status ?? (task.done ? "Concluído" : "Por fazer");
                        return <div className="board-row" key={task.id}>
                          <span className="row-select"><input disabled={!canEdit} type="checkbox" checked={taskStatus === "Concluído"} onChange={(event) => updateTask(task.id, { status: event.target.checked ? "Concluído" : "Por fazer" })} aria-label={`Concluir ${task.title}`} /></span>
                          <label className="task-title-cell"><input disabled={!canEdit} className="task-title-input" defaultValue={task.title} onBlur={(event) => { const value = event.target.value.trim(); if (value && value !== task.title) updateTask(task.id, { title: value }); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} aria-label={`Nome da tarefa ${task.title}`} /><span title="Abrir atualizações">⊕</span></label>
                          <label className="owner-cell"><span className="avatar small">{task.assignee}</span><select disabled={!canEdit} value={task.assigneeName ?? ""} onChange={(event) => { const owner = ownerOptions.find((item) => item.name === event.target.value); if (owner) updateTask(task.id, { assignee: owner.initials, assigneeName: owner.name }); }} aria-label={`Responsável por ${task.title}`}><option value="">Sem responsável</option>{ownerOptions.map((owner) => <option value={owner.name} key={owner.name}>{owner.name}</option>)}</select></label>
                          <select disabled={!canEdit} className={`status-cell ${statusClass(taskStatus)}`} value={taskStatus} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })} aria-label={`Estado de ${task.title}`}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select>
                          <select disabled={!canEdit} className={`priority-cell ${statusClass(task.priority)}`} value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Task["priority"] })} aria-label={`Prioridade de ${task.title}`}><option>Alta</option><option>Média</option><option>Baixa</option></select>
                          <label className="timeline-cell"><input disabled={!canEdit} className="plain-cell" defaultValue={task.due} onBlur={(event) => { if (event.target.value !== task.due) updateTask(task.id, { due: event.target.value }); }} aria-label={`Periodicidade de ${task.title}`} /></label>
                          <input disabled={!canEdit} className="plain-cell" defaultValue={task.area} onBlur={(event) => { if (event.target.value !== task.area) updateTask(task.id, { area: event.target.value }); }} aria-label={`Área de ${task.title}`} />
                          {canEdit ? <button className="delete-row" onClick={() => deleteTask(task.id)} aria-label={`Apagar ${task.title}`}>×</button> : <span />}
                        </div>;
                      })}
                      {canEdit && <button className="add-board-row" onClick={() => createTask(group.id as "semanais" | "mensais")}>＋ Adicionar tarefa</button>}
                      <div className="group-summary" aria-label={`Resumo de ${group.label}`}><span /><span /><span /><span className="summary-status"><i style={{ width: `${group.tasks.length ? group.tasks.filter((task) => (task.status ?? (task.done ? "Concluído" : "Por fazer")) === "Concluído").length / group.tasks.length * 100 : 0}%` }} /></span><span /><span className="summary-timeline">{group.tasks.length} tarefas</span><span /><span /></div>
                    </>}
                  </div>
                ))}
              </div>}

              {dataReady && boardMode === "kanban" && <div className="kanban-board">
                {statusOptions.map((status) => {
                  const statusTasks = boardTasks.filter((task) => (task.status ?? (task.done ? "Concluído" : "Por fazer")) === status);
                  return <section className={`kanban-column ${statusClass(status)}`} key={status} onDragOver={(event) => { if (canEdit) event.preventDefault(); }} onDrop={(event) => { if (!canEdit) return; const id = Number(event.dataTransfer.getData("text/plain")); if (id) updateTask(id, { status }); }}>
                    <header><strong>{status}</strong><span>{statusTasks.length}</span></header>
                    <div className="kanban-cards">{statusTasks.map((task) => <article className="kanban-card" draggable={canEdit} onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))} key={task.id}>
                      <span className={`kanban-priority ${statusClass(task.priority)}`}>{task.priority}</span>
                      <strong>{task.title}</strong><small>{task.area}</small>
                      <footer><span className="avatar small">{task.assignee}</span><span>{task.due}</span></footer>
                    </article>)}</div>
                    {canEdit && <button onClick={() => createTask(status === "Por fazer" ? "semanais" : "mensais")}>＋ Adicionar</button>}
                  </section>;
                })}
              </div>}
            </section>
          )}

          {view === "custos" && department === "qualidade" && (
            <section className="cost-section" aria-labelledby="cost-section-title">
              <div className="cost-heading">
                <div><span className="eyebrow">Dados de julho 2026</span><h2 id="cost-section-title">Custo, Comida, Papel e OPS</h2></div>
                <a className="drive-link" href="https://drive.google.com/drive/folders/1W_C3S1yUFZXGdmETHBesGHwJwk3xoeaZ?usp=sharing" target="_blank" rel="noreferrer">Abrir pasta no Drive ↗</a>
              </div>
              <div className="cost-grid">
                <article className="cost-card cost-total">
                  <span className="cost-icon">€</span>
                  <div><span className="eyebrow">Custo</span><strong>6 334,80 €</strong><p>Desvios negativos totais · 486 referências ativas</p></div>
                </article>
                <button type="button" className={`cost-card cost-selector cost-food ${selectedInventoryCategory === "food" ? "selected" : ""}`} onClick={() => setSelectedInventoryCategory("food")} aria-pressed={selectedInventoryCategory === "food"}>
                  <span className="cost-icon">●</span>
                  <div><span className="eyebrow">Comida</span><strong>3 610,47 €</strong><p>74 referências com desvio negativo · <b>+10,7% vs. junho</b></p></div>
                  <span className="selector-mark" aria-hidden="true">✓</span>
                </button>
                <button type="button" className={`cost-card cost-selector cost-paper ${selectedInventoryCategory === "paper" ? "selected" : ""}`} onClick={() => setSelectedInventoryCategory("paper")} aria-pressed={selectedInventoryCategory === "paper"}>
                  <span className="cost-icon">▤</span>
                  <div><span className="eyebrow">Papel</span><strong>1 158,41 €</strong><p>45 referências com desvio negativo · <b>+55,1% vs. junho</b></p></div>
                  <span className="selector-mark" aria-hidden="true">✓</span>
                </button>
                <button type="button" className={`cost-card cost-selector cost-ops ${selectedInventoryCategory === "ops" ? "selected" : ""}`} onClick={() => setSelectedInventoryCategory("ops")} aria-pressed={selectedInventoryCategory === "ops"}>
                  <span className="cost-icon">◇</span>
                  <div><span className="eyebrow">OPS</span><strong>1 565,92 €</strong><p>Produtos de limpeza + escritório · 218 referências ativas</p></div>
                  <span className="selector-mark" aria-hidden="true">✓</span>
                </button>
              </div>
              <div className="inventory-detail">
                <div className="inventory-detail-heading">
                  <div><span className="eyebrow">Relatório MyStore selecionado</span><h3>Produtos — {inventoryCategoryLabels[selectedInventoryCategory]}</h3></div>
                  <span>Período: 01/07–31/07/2026</span>
                </div>
                <div className="inventory-controls">
                  <label className="inventory-search"><span aria-hidden="true">⌕</span><input type="search" value={inventorySearch} onChange={(event) => setInventorySearch(event.target.value)} placeholder="Pesquisar produto, código ou grupo" aria-label="Pesquisar produtos" /></label>
                  <label className="inventory-filter">Estado<select value={inventoryStatus} onChange={(event) => setInventoryStatus(event.target.value as InventoryStatus)}><option>Todos</option><option>Ativo</option><option>Inativo</option></select></label>
                  <strong>{visibleInventoryProducts.length} de {inventoryProducts.filter((product) => product.category === selectedInventoryCategory).length} produtos</strong>
                </div>
                <div className="inventory-table" role="table" aria-label={`Produtos de ${inventoryCategoryLabels[selectedInventoryCategory]}`}>
                  <div className="inventory-product-row inventory-product-header" role="row">
                    {([
                      ["code", "Código"], ["description", "Produto"], ["status", "Estado"], ["source", "Origem"],
                      ["openingStock", "Stock abertura"], ["deliveries", "Entregas"], ["posUsage", "Utilização POS"],
                      ["expectedStock", "Stock esperado"], ["closingStock", "Stock fecho"], ["deviation", "Desvio"],
                      ["deviationEur", "Desvio (€)"], ["currentYield", "Rend. atual"],
                    ] as [ProductSortKey, string][]).map(([key, label]) => <button type="button" onClick={() => changeProductSort(key)} key={key}>{label}<i>{productSort.key === key ? productSort.direction === "asc" ? "↑" : "↓" : "↕"}</i></button>)}
                  </div>
                  {visibleInventoryProducts.map((product) => (
                    <div className="inventory-product-row" role="row" key={product.id}>
                      <span className="product-code">{product.code}</span>
                      <span className="product-name"><strong>{product.description}</strong><small>{product.unit || "—"} · Grupo {product.group || "—"}</small></span>
                      <span><i className={`product-status ${product.status === "Ativo" ? "active" : "inactive"}`}>{product.status}</i></span>
                      <span><i className={`product-source source-${statusClass(product.source)}`}>{product.source}</i></span>
                      <span>{formatQuantity(product.openingStock)}</span>
                      <span>{formatQuantity(product.deliveries)}</span>
                      <span>{formatQuantity(product.posUsage)}</span>
                      <span>{formatQuantity(product.expectedStock)}</span>
                      <span>{formatQuantity(product.closingStock)}</span>
                      <span className={product.deviation < 0 ? "negative-value" : product.deviation > 0 ? "positive-value" : ""}>{formatQuantity(product.deviation)}</span>
                      <span className={product.deviationEur < 0 ? "negative-value" : product.deviationEur > 0 ? "positive-value" : ""}>{formatEuro(product.deviationEur)}</span>
                      <span>{formatYield(product.currentYield)}</span>
                    </div>
                  ))}
                </div>
                <p className="inventory-note">Fonte: relatórios “Desvio de inventário” do restaurante Imperial, período 01/07–31/07/2026, sincronizados em 13 de agosto de 2026. Selecione Comida, Papel ou OPS nos cartões acima; OPS agrega Produtos de Limpeza e Material de Escritório. Todos os produtos ativos e inativos estão incluídos.</p>
              </div>
            </section>
          )}

          {view === "faturacao" && <section className="billing-section" aria-labelledby="billing-title">
            <div className="billing-heading"><div><span className="eyebrow">Controlo de faturação</span><h2 id="billing-title">{billingMonth}</h2><p>Consulte o resumo mensal ou abra uma descarga para gerir os respetivos documentos.</p></div><div className="billing-heading-actions"><button type="button" className="billing-month-button" onClick={() => setBillingMonth((month) => month === "Agosto 2026" ? "Julho 2026" : "Agosto 2026")}>◀ {billingMonth} ▶</button><button type="button" className="billing-primary" onClick={() => setShowNewBillingDelivery(true)}>＋ Adicionar descarga</button></div></div>
            {showNewBillingDelivery && <section className="billing-new-delivery"><div><span className="eyebrow">Nova descarga</span><h3>Passo 1 · Selecionar fornecedor e data</h3><p>Em seguida, carregue a fatura do fornecedor e o ficheiro My Store.</p></div><label>Fornecedor<select value={billingSupplier} onChange={(event) => setBillingSupplier(event.target.value as BillingSupplier)}><option>HAVI</option><option>Maia Paper</option><option>Air Liquide</option></select></label><label>Data da descarga<input type="date" value={newBillingDate} onChange={(event) => setNewBillingDate(event.target.value)} /></label><button type="button" className="billing-primary" disabled={!newBillingDate} onClick={() => { const label = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" }).format(new Date(`${newBillingDate}T12:00:00`)).replace(".", ""); const id = `${newBillingDate}--${crypto.randomUUID()}`; setBillingDeliveries((items) => [...items, { id, date: newBillingDate, label, supplier: billingSupplier }]); setBillingDocuments([]); setBillingCalculated(false); setSelectedInvoiceDelivery(id); setBillingTab("delivery"); setShowNewBillingDelivery(false); setNotice(`Descarga ${billingSupplier} criada. Carregue agora os documentos necessários.`); }}>Criar descarga</button></section>}
            <nav className="billing-delivery-tabs billing-main-tabs" aria-label="Navegação do controlo de faturação"><div><button type="button" className={billingTab === "summary" ? "active" : ""} onClick={() => { setBillingTab("summary"); setSelectedInvoiceDelivery(null); }}><strong>Resumo mensal</strong><small>{billingMonth}</small></button>{billingDeliveries.map((delivery) => <button type="button" key={`${delivery.date}-${delivery.supplier}`} className={billingTab === "delivery" && selectedInvoiceDelivery === delivery.date ? "active" : ""} onClick={() => { setSelectedInvoiceDelivery(delivery.date); setBillingTab("delivery"); setNotice(""); }}><strong>{delivery.supplier} · {delivery.label}</strong><small>Consulta</small></button>)}</div></nav>
            {billingTab === "delivery" && selectedInvoiceDelivery && <button type="button" className="billing-delete" onClick={deleteBillingDelivery}>Eliminar descarga</button>}
            {billingTab === "summary" && <MonthlyBillingControl values={monthlyInputs} onChange={(key, value) => setMonthlyInputs((current) => ({ ...current, [key]: value }))} />}
            {billingTab === "summary" ? <><div className="billing-metrics"><article><span>Descargas registadas</span><strong>{billingDeliveries.length}</strong><small>No mês selecionado</small></article><article className="billing-good"><span>Validadas</span><strong>0</strong><small>Sem diferenças</small></article><article className="billing-warn"><span>Com divergências</span><strong>0</strong><small>A aguardar análise</small></article><article><span>Por concluir</span><strong>{billingDeliveries.length}</strong><small>Ficheiros ou validação em falta</small></article></div><section className="billing-empty"><h3>Resumo mensal</h3><p>{billingDeliveries.length ? "Selecione uma aba de descarga para consultar e concluir o respetivo registo." : "Ainda não existem descargas registadas neste mês. Utilize “Adicionar descarga” para começar."}</p></section></> : selectedInvoiceDelivery && <><div className="billing-layout"><section className="billing-list"><div className="billing-list-heading"><div><h3>Descarga {billingDeliveries.find((delivery) => delivery.date === selectedInvoiceDelivery)?.label}</h3><p>Registo em preparação</p></div><span>Por concluir</span></div><div className="billing-steps"><article className="done"><b>1</b><span><strong>Selecionar data</strong><small>{selectedInvoiceDelivery.split("-").reverse().join("/")}</small></span></article><article className={billingDocuments.some((document) => document.documentType === "havi") ? "done" : ""}><b>2</b><span><strong>Carregar fatura HAVI</strong><small>PDF da fatura do fornecedor</small></span></article><article className={billingDocuments.some((document) => document.documentType === "mystore") ? "done" : ""}><b>3</b><span><strong>Carregar ficheiro My Store</strong><small>PDF, Excel ou CSV</small></span></article><article><b>4</b><span><strong>Rever e validar</strong><small>Confirmar as diferenças encontradas</small></span></article></div></section><aside className="billing-side"><section className="billing-import"><div><h3>Documentos da descarga</h3><p>{selectedInvoiceDelivery.split("-").reverse().join("/")}</p></div><input ref={haviInputRef} className="billing-file-input" type="file" accept="application/pdf,.pdf" onChange={(event) => uploadBillingDocuments("havi", event.target.files)} /><button type="button" className={billingDocuments.some((document) => document.documentType === "havi") ? "billing-upload loaded" : "billing-upload"} onClick={() => haviInputRef.current?.click()} disabled={billingUploadBusy !== null}><b>{billingDocuments.some((document) => document.documentType === "havi") ? "✓" : "+"}</b><span><strong>Fatura HAVI</strong><small>{billingDocuments.filter((document) => document.documentType === "havi").map((document) => document.fileName).join(" · ") || "Carregar PDF da fatura"}</small></span><em>Carregar</em></button><input ref={myStoreInputRef} className="billing-file-input" type="file" multiple accept="application/pdf,.pdf,.xlsx,.xls,.csv" onChange={(event) => uploadBillingDocuments("mystore", event.target.files)} /><button type="button" className={billingDocuments.some((document) => document.documentType === "mystore") ? "billing-upload loaded" : "billing-upload"} onClick={() => myStoreInputRef.current?.click()} disabled={billingUploadBusy !== null}><b>{billingDocuments.some((document) => document.documentType === "mystore") ? "✓" : "+"}</b><span><strong>Documentos My Store</strong><small>{billingDocuments.filter((document) => document.documentType === "mystore").length ? `${billingDocuments.filter((document) => document.documentType === "mystore").length} documento(s) carregado(s)` : "Carregar PDFs, Excel ou CSV"}</small></span><em>Carregar</em></button><button type="button" className="billing-validate" disabled={!billingDocuments.some((document) => document.documentType === "havi") || !billingDocuments.some((document) => document.documentType === "mystore")} onClick={() => setNotice("Descarga validada. O histórico ficará guardado nesta descarga.")}>Validar descarga</button></section></aside></div>{billingDocuments.some((document) => document.documentType === "havi") && billingDocuments.some((document) => document.documentType === "mystore") && <section className="billing-analysis"><div className="billing-analysis-heading"><div><span className="eyebrow">Análise da descarga</span><h3>HAVI vs. My Store</h3><p>Comparação organizada conforme o modelo de controlo partilhado.</p></div><i>Pronta para validação</i></div><div className="billing-comparison"><article><h4>Fatura HAVI</h4><p><span>Congelados</span><b>—</b></p><p><span>Refrigerados</span><b>—</b></p><p><span>Secos comida</span><b>—</b></p><p><span>Secos papel</span><b>—</b></p><p><span>Produtos frescos</span><b>—</b></p><p><span>Outros grupos</span><b>—</b></p><strong>Total HAVI <em>Por apurar</em></strong></article><article><h4>My Store</h4><p><span>Comida</span><b>—</b></p><p><span>Papel</span><b>—</b></p><p><span>F. Operacionais</span><b>—</b></p><p><span>Material Adm.</span><b>—</b></p><p><span>Happy Meal</span><b>—</b></p><p><span>Outros</span><b>—</b></p><strong>Total My Store <em>Por apurar</em></strong></article><article className="billing-difference-card"><h4>Diferença</h4><p><span>Comida</span><b>—</b></p><p><span>Papel</span><b>—</b></p><p><span>F. Operacionais</span><b>—</b></p><p><span>Material Adm.</span><b>—</b></p><p><span>Happy Meal</span><b>—</b></p><p><span>Outros</span><b>—</b></p><strong>Diferença total <em>Por apurar</em></strong></article></div><div className="billing-analysis-details"><section><h4>Diferenças de preço</h4><div className="billing-price-table"><div><span>Rubrica</span><span>Produto</span><span>Preço HAVI</span><span>Preço My Store</span><span>Dif.</span></div><div className="billing-analysis-placeholder"><span>Os artigos e preços identificados nos ficheiros serão apresentados aqui.</span></div></div></section><section><h4>Produtos não introduzidos</h4><p className="billing-analysis-placeholder">Produtos faturados pela HAVI sem correspondência no My Store.</p></section><section><h4>Comentários adicionais</h4><textarea aria-label="Comentários adicionais da descarga" placeholder="Registe aqui a justificação ou observações do gerente." /></section></div></section>}</>}
          </section>}

          {false && view === "faturacao" && (() => {
            const deliveries = [
              { date: "19 Ago", day: "Quarta-feira", invoice: "7131341972", myStore: "Importado", total: "21 230,51 €", difference: "-58,44 €", status: "Rever" },
              { date: "17 Ago", day: "Segunda-feira", invoice: "7131341961", myStore: "Importado", total: "18 140,32 €", difference: "0,00 €", status: "Validada" },
              { date: "14 Ago", day: "Sexta-feira", invoice: "7131341942", myStore: "Importado", total: "19 404,75 €", difference: "-4,71 €", status: "Rever" },
              { date: "21 Ago", day: "Sexta-feira · prevista", invoice: "—", myStore: "Em falta", total: "—", difference: "—", status: "Por importar" },
            ];
            const selected = deliveries[selectedInvoiceDelivery];
            const monthDeliveries = billingMonth === "Agosto 2026" ? deliveries : [];
            const haviFiles = billingDocuments.filter((document) => document.documentType === "havi");
            const myStoreFiles = billingDocuments.filter((document) => document.documentType === "mystore");
            return <section className="billing-section" aria-labelledby="billing-title">
              <div className="billing-heading"><div><span className="eyebrow">Resumo mensal</span><h2 id="billing-title">Controlo de faturação · {billingMonth}</h2><p>Selecione uma descarga e conclua os quatro passos de registo.</p></div><div className="billing-heading-actions"><button className="billing-month-button" onClick={() => setBillingMonth((month) => month === "Agosto 2026" ? "Julho 2026" : "Agosto 2026")}>◀ {billingMonth} ▶</button><button className="billing-primary" onClick={() => setShowNewBillingDelivery(true)}>＋ Adicionar descarga</button></div></div>
              {showNewBillingDelivery && <section className="billing-new-delivery"><div><span className="eyebrow">Nova descarga</span><h3>Passo 1 · Selecionar a data</h3><p>Depois de guardar a data, carregue a fatura HAVI e os documentos My Store.</p></div><label>Data da descarga<input type="date" value={newBillingDate} onChange={(event) => setNewBillingDate(event.target.value)} /></label><button className="billing-primary" disabled={!newBillingDate} onClick={() => { setShowNewBillingDelivery(false); setNotice(`Descarga de ${newBillingDate.split("-").reverse().join("/")} criada. Carregue agora a fatura HAVI e o My Store.`); }}>Guardar data</button></section>}
              <div className="billing-metrics"><article><span>Descargas registadas</span><strong>{billingMonth === "Agosto 2026" ? "4" : "0"}</strong><small>Descargas do mês</small></article><article className="billing-good"><span>Validadas</span><strong>{billingMonth === "Agosto 2026" ? "1" : "0"}</strong><small>Sem diferenças</small></article><article className="billing-warn"><span>Com divergências</span><strong>{billingMonth === "Agosto 2026" ? "2" : "0"}</strong><small>A aguardar análise</small></article><article><span>Por concluir</span><strong>{billingMonth === "Agosto 2026" ? "1" : "0"}</strong><small>Ficheiros em falta</small></article></div>
              <section className="billing-delivery-tabs" aria-label="Descargas do mês"><span>Descargas inseridas</span><div>{monthDeliveries.length ? monthDeliveries.map((delivery,index)=><button type="button" key={delivery.date} className={selectedInvoiceDelivery===index?"active":""} onClick={()=>{setSelectedInvoiceDelivery(index);setNotice("");}}><strong>{delivery.date}</strong><small>{delivery.status}</small></button>) : <em>Não existem descargas registadas neste mês.</em>}</div></section>
              <div className="billing-layout"><section className="billing-list"><div className="billing-list-heading"><div><h3>Descarga {selected.date}</h3><p>{selected.day} · Fatura {selected.invoice === "—" ? "por inserir" : selected.invoice}</p></div><span>{selected.status}</span></div><div className="billing-steps"><article className="done"><b>1</b><span><strong>Selecionar data</strong><small>{selected.date} de agosto de 2026</small></span></article><article className={haviFiles.length ? "done" : ""}><b>2</b><span><strong>Carregar fatura HAVI</strong><small>PDF da fatura do fornecedor</small></span></article><article className={myStoreFiles.length ? "done" : ""}><b>3</b><span><strong>Carregar ficheiro My Store</strong><small>PDF, Excel ou CSV</small></span></article><article className={haviFiles.length && myStoreFiles.length ? "done" : ""}><b>4</b><span><strong>Rever e validar</strong><small>Confirmar as diferenças encontradas</small></span></article></div><div className="billing-table" role="table"><div className="billing-row billing-header" role="row"><span>Data</span><span>Documentos</span><span>Valor HAVI</span><span>Diferença</span><span>Estado</span></div>{deliveries.map((delivery,index)=><button type="button" key={delivery.date} className={selectedInvoiceDelivery===index?"billing-row selected":"billing-row"} onClick={()=>{setSelectedInvoiceDelivery(index);setNotice("");}}><span><b>{delivery.date}</b><small>{delivery.day}</small></span><span><b>{delivery.invoice === "—" ? "Aguardam ficheiros" : `Fatura ${delivery.invoice}`}</b><small>My Store: {delivery.myStore}</small></span><span>{delivery.total}</span><span className={delivery.status === "Rever" ? "billing-difference" : ""}>{delivery.difference}</span><span><i className={`billing-status ${delivery.status === "Validada" ? "valid" : delivery.status === "Rever" ? "review" : "waiting"}`}>{delivery.status}</i></span></button>)}</div></section>
                <aside className="billing-side"><section className="billing-import"><div><h3>Descarga selecionada</h3><p>{selected.date} · {selected.day.replace(" · prevista", "")}</p></div><input ref={haviInputRef} className="billing-file-input" type="file" accept="application/pdf,.pdf" onChange={(event) => uploadBillingDocuments("havi", event.target.files)} /><button type="button" className={haviFiles.length?"billing-upload loaded":"billing-upload"} onClick={()=>haviInputRef.current?.click()} disabled={billingUploadBusy !== null}><b>{haviFiles.length?"✓":"+"}</b><span><strong>Fatura HAVI</strong><small>{haviFiles.length ? haviFiles.map((file) => file.fileName).join(" · ") : "Carregar PDF da fatura"}</small></span><em>{billingUploadBusy === "havi" ? "A carregar…" : haviFiles.length ? "Substituir" : "Carregar"}</em></button><input ref={myStoreInputRef} className="billing-file-input" type="file" multiple accept="application/pdf,.pdf,.xlsx,.xls,.csv" onChange={(event) => uploadBillingDocuments("mystore", event.target.files)} /><button type="button" className={myStoreFiles.length?"billing-upload loaded":"billing-upload"} onClick={()=>myStoreInputRef.current?.click()} disabled={billingUploadBusy !== null}><b>{myStoreFiles.length?"✓":"+"}</b><span><strong>Documentos My Store</strong><small>{myStoreFiles.length ? `${myStoreFiles.length} documento(s) carregado(s)` : "Carregar PDFs, Excel ou CSV"}</small></span><em>{billingUploadBusy === "mystore" ? "A carregar…" : myStoreFiles.length ? "Adicionar" : "Carregar"}</em></button><button className="billing-validate" disabled={!haviFiles.length || !myStoreFiles.length} onClick={()=>setNotice("Descarga validada. O histórico ficará guardado nesta linha.")}>Validar descarga</button></section><section className="billing-process"><h3>Processo automático</h3><ol><li className={haviFiles.length?"done":""}><b>Extrair a fatura</b><small>Artigos, quantidades e preços</small></li><li className={myStoreFiles.length?"done":""}><b>Importar My Store</b><small>Registos da mesma descarga</small></li><li className={haviFiles.length&&myStoreFiles.length?"done":""}><b>Cruzar e sinalizar</b><small>Preço, quantidade e artigos em falta</small></li><li><b>Validar ou justificar</b><small>Responsável e histórico guardados</small></li></ol></section></aside></div>
              {selectedInvoiceDelivery === 0 && <section className="billing-reconciliation"><div className="billing-reconciliation-heading"><div><span className="eyebrow">Registo da descarga · 19 de agosto</span><h3>Resumo de comparação</h3></div><i>Diferença total: -58,44 €</i></div><div className="billing-summary-cards"><article><span>Fatura HAVI</span><strong>21 230,51 €</strong><small>Total recebido do fornecedor</small></article><article><span>My Store</span><strong>21 288,95 €</strong><small>Total registado no sistema</small></article><article><span>Dif. de receção</span><strong>-1,62 €</strong><small>Quantidade / artigos</small></article><article className="negative"><span>Dif. de preço</span><strong>-56,82 €</strong><small>Preço HAVI vs. SMS</small></article></div><div className="billing-analysis-grid"><section><h4>Diferenças de preço</h4><div className="billing-price-table"><div><span>Rubrica</span><span>Preço HAVI</span><span>Preço SMS</span><span>Dif.</span></div><div><b>Comida · Caldo verde</b><span>38,93 €</span><span>35,47 €</span><strong>3,46 €</strong></div><div><b>Comida · Alface Apollo</b><span>29,94 €</span><span>26,82 €</span><strong>3,12 €</strong></div><div><b>Happy Meal</b><span>1 196,60 €</span><span>1 260,00 €</span><strong>-63,40 €</strong></div></div></section><section className="billing-rubrics"><h4>Diferença global por rubrica</h4><p><span>Comida</span><b>6,58 €</b></p><p><span>Papel</span><b>0,00 €</b></p><p><span>Forn. operacionais</span><b>0,00 €</b></p><p><span>Material administrativo</span><b>0,00 €</b></p><p><span>Outros</span><b>0,00 €</b></p><p className="negative"><span>Happy Meal</span><b>-63,40 €</b></p></section></div><section className="billing-not-introduced"><h4>Produto não introduzido</h4><p>Sem produtos identificados nesta descarga.</p></section></section>}
            </section>;
          })()}

          {view === "r2p" && department === "cliente" && (
            <section className="r2p-section" aria-labelledby="r2p-title">
              <div className="r2p-heading">
                <div><span className="eyebrow">Serviço Cliente · Balcão</span><h2 id="r2p-title">Tempos de serviço · R2P</h2><p>Leitura por dia, hora e gerente de turno. Quanto menor o tempo, melhor.</p></div>
                <div className="r2p-actions">
                  <span className="r2p-target-badge"><small>Objetivo</small><strong>{r2pTargetLabel(r2pMonth)}</strong></span>
                  <label className="r2p-month-filter">Mês<select value={r2pMonth} onChange={(event) => setR2pMonth(Number(event.target.value))} aria-label="Filtrar R2P por mês">{[...new Set(r2pData.days.map((day) => day.month))].map((month) => <option value={month} key={month}>{monthNames[month - 1]} 2026</option>)}</select></label>
                  <a className="drive-link" href={r2pData.sourceUrl} target="_blank" rel="noreferrer">Abrir fonte ↗</a>
                </div>
              </div>
              <div className="r2p-period-bar" aria-label="Acesso rápido aos trimestres">
                <div><span className="eyebrow">Período</span><strong>Consultar trimestre</strong></div>
                <div className="quarter-buttons">
                  {[{ quarter: 1, month: 3, label: "1.º trimestre", detail: "Jan–Mar" }, { quarter: 2, month: 6, label: "2.º trimestre", detail: "Abr–Jun" }, { quarter: 3, month: 8, label: "3.º trimestre", detail: "Jul–Set" }].map((item) => <button type="button" className={r2pDashboard.quarter === item.quarter ? "active" : ""} onClick={() => setR2pMonth(item.month)} key={item.quarter}><span>{item.quarter}T</span><strong>{item.label}</strong><small>{item.detail}</small><i>→</i></button>)}
                </div>
              </div>
              <div className="r2p-metrics" aria-label="Indicadores R2P">
                <article className="r2p-metric featured best"><span className="r2p-symbol">★</span><div><span className="eyebrow">Melhor dia R2P</span><strong>{r2pDashboard.bestDay ? formatR2PDate(r2pDashboard.bestDay.day.date) : "—"}</strong><small>{r2pDashboard.bestDay ? `Média diária de ${r2pDashboard.bestDay.value}s` : "Sem dados"}</small></div></article>
                <article className="r2p-metric worst"><span className="r2p-symbol">!</span><div><span className="eyebrow">Pior dia R2P</span><strong>{r2pDashboard.worstDay ? formatR2PDate(r2pDashboard.worstDay.day.date) : "—"}</strong><small>{r2pDashboard.worstDay ? `Média diária de ${r2pDashboard.worstDay.value}s` : "Sem dados"}</small></div></article>
                <article className="r2p-metric worst-hour"><span className="r2p-symbol">↗</span><div><span className="eyebrow">Registo da pior hora</span><strong>{r2pDashboard.worstRecord ? `${r2pDashboard.worstRecord.value}s` : "—"}</strong><small>{r2pDashboard.worstRecord ? `${formatR2PDate(r2pDashboard.worstRecord.day.date)} · ${r2pDashboard.worstRecord.hour}` : "Sem dados"}</small></div></article>
                <article className="r2p-metric best-hour"><span className="r2p-symbol">↘</span><div><span className="eyebrow">Registo da melhor hora</span><strong>{r2pDashboard.bestRecord ? `${r2pDashboard.bestRecord.value}s` : "—"}</strong><small>{r2pDashboard.bestRecord ? `${formatR2PDate(r2pDashboard.bestRecord.day.date)} · ${r2pDashboard.bestRecord.hour}` : "Sem dados"}</small></div></article>
              </div>

              <div className="r2p-visual-grid single">
                <article className="r2p-chart-card">
                  <div className="r2p-card-heading"><div><span className="eyebrow">Perfil horário</span><h3>R2P médio por hora</h3></div><span>Meta {r2pTargetLabel(r2pMonth)}</span></div>
                  <div className="r2p-hour-chart" aria-label={`R2P médio por hora em ${monthNames[r2pMonth - 1]}`}>
                    {r2pDashboard.hourAverages.map((item) => <div className="r2p-hour-bar" key={item.hour}><span className="r2p-bar-value">{item.value || "—"}</span><i className={meetsR2PTarget(item.value, r2pMonth) ? "good" : item.value <= r2pDashboard.target + 60 ? "attention" : "high"} style={{ height: `${item.value ? Math.max(8, Math.min(100, (item.value / 360) * 100)) : 0}%` }} /><small>{item.hour.slice(0, 2)}</small></div>)}
                  </div>
                </article>
              </div>

              <div className="r2p-table-card r2p-heatmap-card">
                <div className="r2p-table-heading"><div><span className="eyebrow">Dia × hora</span><h3>R2P por hora e por dia</h3></div><div className="heatmap-legend"><span><i className="good" />{r2pTargetLabel(r2pMonth)}</span><span><i className="attention" />{r2pDashboard.target}–{r2pDashboard.target + 60}s</span><span><i className="high" />&gt;{r2pDashboard.target + 60}s</span></div></div>
                <div className="r2p-heatmap" role="table" aria-label={`R2P por hora e dia em ${monthNames[r2pMonth - 1]}`}>
                  <div className="heatmap-row heatmap-header" role="row"><span>Dia</span>{r2pData.hours.map((hour) => <span key={hour}>{hour.slice(0, 2)}</span>)}</div>
                  {r2pDashboard.days.map((day) => <div className="heatmap-row" role="row" key={day.date}><span><strong>{new Date(`${day.date}T00:00:00`).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</strong><small>{day.weekday.slice(0, 3)}</small></span>{day.hourly.map((value, index) => <span className={!value ? "empty" : meetsR2PTarget(value, r2pMonth) ? "good" : value <= r2pDashboard.target + 60 ? "attention" : "high"} title={`${day.date} · ${r2pData.hours[index]} · ${value ?? "sem dados"}${value ? "s" : ""}`} key={`${day.date}-${r2pData.hours[index]}`}>{value ?? "·"}</span>)}</div>)}
                </div>
              </div>

              <div className="r2p-ranking-grid">
                <article className="r2p-table-card">
                  <div className="r2p-table-heading"><div><span className="eyebrow">Pódio mensal</span><h3>{monthNames[r2pMonth - 1]} 2026</h3></div><span>Menor R2P</span></div>
                  <RankingPodium ranking={r2pDashboard.monthlyRanking} />
                  <div className="manager-ranking"><div className="manager-rank-row header"><span>#</span><span>Restante ranking</span><span>Turnos</span><span>Média</span></div>{r2pDashboard.monthlyRanking.slice(3).map((manager, index) => <div className="manager-rank-row" key={manager.manager}><span>{index + 4}</span><strong>{manager.manager}</strong><span>{manager.shifts}</span><b className={meetsR2PTarget(manager.average, r2pMonth) ? "on-target" : "off-target"}>{manager.average}s</b></div>)}</div>
                </article>
                <article className="r2p-table-card">
                  <div className="r2p-table-heading"><div><span className="eyebrow">Pódio trimestral</span><h3>{r2pDashboard.quarter}.º trimestre 2026</h3></div><span>Menor R2P</span></div>
                  <RankingPodium ranking={r2pDashboard.quarterlyRanking} />
                  <div className="manager-ranking"><div className="manager-rank-row header"><span>#</span><span>Restante ranking</span><span>Turnos</span><span>Média</span></div>{r2pDashboard.quarterlyRanking.slice(3).map((manager, index) => <div className="manager-rank-row" key={manager.manager}><span>{index + 4}</span><strong>{manager.manager}</strong><span>{manager.shifts}</span><b className={meetsR2PTarget(manager.average, r2pDashboard.quarter === 3 ? 8 : r2pDashboard.quarter * 3) ? "on-target" : "off-target"}>{manager.average}s</b></div>)}</div>
                </article>
              </div>

              <div className="r2p-table-card">
                <div className="r2p-table-heading"><div><span className="eyebrow">Gestão operacional</span><h3>Gerentes por turno e dia</h3></div><span>{r2pDashboard.days.length} dias</span></div>
                <div className="shift-table" role="table" aria-label="Gerentes e R2P por turno e dia">
                  <div className="shift-row shift-header" role="row"><span>Dia</span><span>Abertura · 08–15</span><span>Intermédio · 15–23</span><span>Fecho · 23–05</span><span>Dia SOS</span><span>Nacional</span></div>
                  {r2pDashboard.days.map((day) => <div className="shift-row" role="row" key={day.date}><span><strong>{new Date(`${day.date}T00:00:00`).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</strong><small>{day.weekday}</small></span>{day.shifts.map((shift) => <span className="shift-manager" key={shift.name}><strong>{shift.manager || "—"}</strong><small className={shift.value && meetsR2PTarget(shift.value, r2pMonth) ? "on-target" : "off-target"}>{shift.value ? `${shift.value}s` : "—"}</small></span>)}<span>{day.sos ? `${day.sos}s` : "—"}</span><span>{day.national ? `${day.national}s` : "—"}</span></div>)}
                </div>
                <p className="inventory-note">Fonte: “Tempos de Serviço por Hora e GT - Imperial”. Dados de operação atualizados em {new Date(`${r2pData.snapshotDate}T00:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })} e fonte validada em 13 de agosto de 2026; esta página é uma fotografia dos dados e não uma ligação em tempo real. O objetivo de julho e agosto é manter o R2P abaixo de 230s; nos restantes meses mantém-se a referência de 180s.</p>
              </div>
            </section>
          )}

          {view === "tellarches" && department === "cliente" && (
            <section className="tell-arches-section" aria-labelledby="tell-arches-title">
              <div className="tell-arches-heading">
                <div><span className="eyebrow">Serviço Cliente · Voz do cliente</span><h2 id="tell-arches-title">Tell The Arches</h2><p>Resultados mensais de satisfação e experiência do restaurante Imperial.</p></div>
                <div className="tell-arches-actions">
                  <div className="tell-period-toggle" aria-label="Selecionar período Tell The Arches"><button type="button" className={tellTheArchesPeriod === "monthly" ? "active" : ""} onClick={() => setTellTheArchesPeriod("monthly")}>Mês</button><button type="button" className={tellTheArchesPeriod === "ytd" ? "active" : ""} onClick={() => setTellTheArchesPeriod("ytd")}>YTD</button></div>
                  {tellTheArchesPeriod === "monthly" && <label className="r2p-month-filter">Mês<select value={tellTheArchesMonth} onChange={(event) => setTellTheArchesMonth(Number(event.target.value))} aria-label="Filtrar Tell The Arches por mês">{tellTheArchesData.months.map((item) => <option value={item.month} key={item.month}>{item.label} 2026</option>)}</select></label>}
                  <a className="drive-link" href={tellTheArchesData.folderUrl} target="_blank" rel="noreferrer">Abrir pasta ↗</a>
                </div>
              </div>

              <div className="tell-arches-metrics">
                <article className="tell-metric satisfaction"><span className="tell-metric-icon">★</span><div><span className="eyebrow">Satisfação geral</span><strong>{tellTheArchesDashboard.satisfaction}%</strong><small className={tellTheArchesDashboard.satisfactionDelta >= 0 ? "positive" : "negative"}>{tellTheArchesDashboard.satisfactionDelta >= 0 ? "↑" : "↓"} {Math.abs(tellTheArchesDashboard.satisfactionDelta)} p.p. vs. {tellTheArchesComparison}</small></div></article>
                <article className="tell-metric"><span className="tell-metric-icon">↺</span><div><span className="eyebrow">Probabilidade de regressar</span><strong>{tellTheArchesDashboard.returnIntent}%</strong><small className={tellTheArchesDashboard.returnDelta >= 0 ? "positive" : "negative"}>{tellTheArchesDashboard.returnDelta >= 0 ? "↑" : "↓"} {Math.abs(tellTheArchesDashboard.returnDelta)} p.p.</small></div></article>
                <article className="tell-metric attention"><span className="tell-metric-icon">!</span><div><span className="eyebrow">Avaliações Bottom-2-Box</span><strong>{tellTheArchesDashboard.bottom2}%</strong><small className={tellTheArchesDashboard.bottom2Delta <= 0 ? "positive" : "negative"}>{tellTheArchesDashboard.bottom2Delta > 0 ? "↑" : tellTheArchesDashboard.bottom2Delta < 0 ? "↓" : "—"} {Math.abs(tellTheArchesDashboard.bottom2Delta)} p.p.</small></div></article>
                <article className="tell-metric attention"><span className="tell-metric-icon">×</span><div><span className="eyebrow">Pedidos incorretos</span><strong>{tellTheArchesDashboard.incorrectOrders}%</strong><small className={tellTheArchesDashboard.incorrectDelta <= 0 ? "positive" : "negative"}>{tellTheArchesDashboard.incorrectDelta > 0 ? "↑" : tellTheArchesDashboard.incorrectDelta < 0 ? "↓" : "—"} {Math.abs(tellTheArchesDashboard.incorrectDelta)} p.p.</small></div></article>
              </div>

              <div className="tell-arches-grid">
                <article className="tell-panel trend-panel">
                  <div className="tell-panel-heading"><div><span className="eyebrow">Evolução 2026</span><h3>Satisfação geral</h3></div><span>{tellTheArchesDashboard.responses} respostas · {tellTheArchesDashboard.label}</span></div>
                  <div className="tell-trend" aria-label="Evolução mensal da satisfação geral">{tellTheArchesData.months.map((item) => <button type="button" className={tellTheArchesPeriod === "monthly" && item.month === tellTheArchesMonth ? "selected" : ""} onClick={() => { setTellTheArchesMonth(item.month); setTellTheArchesPeriod("monthly"); }} key={item.month}><span>{item.satisfaction}%</span><i style={{height:`${item.satisfaction}%`}} /><small>{item.label.slice(0,3)}</small></button>)}</div>
                </article>
                <article className="tell-panel recognition-panel"><span className="recognition-icon">✦</span><div><span className="eyebrow">Reconhecimento da equipa</span><strong>{tellTheArchesDashboard.recognition}</strong><p>comentários positivos em {tellTheArchesDashboard.label.toLowerCase()}</p></div></article>
              </div>

              <div className="tell-arches-grid breakdowns">
                <article className="tell-panel"><div className="tell-panel-heading"><div><span className="eyebrow">Satisfação</span><h3>Por dia da semana</h3></div><span>Top-Box</span></div><div className="tell-bars">{weekdayNames.map((label,index) => <div className="tell-bar-row" key={label}><span>{label}</span><i><b style={{width:`${tellTheArchesDashboard.weekdays[index]}%`}} /></i><strong>{tellTheArchesDashboard.weekdays[index]}%</strong></div>)}</div></article>
                <article className="tell-panel"><div className="tell-panel-heading"><div><span className="eyebrow">Satisfação</span><h3>Por período do dia</h3></div><span>Top-Box</span></div><div className="tell-bars">{daypartNames.map((label,index) => <div className="tell-bar-row" key={label}><span>{label}</span><i><b style={{width:`${tellTheArchesDashboard.dayparts[index]}%`}} /></i><strong>{tellTheArchesDashboard.dayparts[index]}%</strong></div>)}</div></article>
              </div>

              <div className="tell-arches-grid breakdowns">
                <article className="tell-panel"><div className="tell-panel-heading"><div><span className="eyebrow">Celebra o sucesso</span><h3>O que mais satisfaz</h3></div><span>Comentários</span></div><div className="factor-list positive-factors">{Object.entries(tellTheArchesDashboard.satisfactionFactors).sort((a,b)=>b[1]-a[1]).map(([label,value]) => <div key={label}><span>{label}</span><i><b style={{width:`${Math.min(100,value*2.2)}%`}} /></i><strong>{value}%</strong></div>)}</div></article>
                <article className="tell-panel attention-panel"><div className="tell-panel-heading"><div><span className="eyebrow">Precisa de atenção</span><h3>Fatores de insatisfação</h3></div><span>Comentários</span></div><div className="factor-list negative-factors">{Object.entries(tellTheArchesDashboard.dissatisfactionFactors).sort((a,b)=>b[1]-a[1]).map(([label,value]) => <div key={label}><span>{label}</span><i><b style={{width:`${Math.min(100,value*10)}%`}} /></i><strong>{value}%</strong></div>)}</div></article>
              </div>

              <div className="tell-history">
                <div className="tell-panel-heading"><div><span className="eyebrow">Relatórios 2026</span><h3>Histórico mensal</h3></div><a className="tell-ytd-link" href={tellTheArchesData.ytd.reportUrl} target="_blank" rel="noreferrer">Relatório YTD ↗</a></div>
                <div className="tell-history-table" role="table" aria-label="Histórico mensal Tell The Arches">
                  <div className="tell-history-row header" role="row"><span>Mês</span><span>Respostas</span><span>Satisfação</span><span>Regresso</span><span>Bottom-2</span><span>Pedidos incorretos</span><span>Relatório</span></div>
                  {tellTheArchesData.months.map((item) => <div className={tellTheArchesPeriod === "monthly" && item.month === tellTheArchesMonth ? "tell-history-row selected" : "tell-history-row"} role="row" key={item.month}><button type="button" onClick={() => { setTellTheArchesMonth(item.month); setTellTheArchesPeriod("monthly"); }}>{item.label}</button><span>{item.responses}</span><strong>{item.satisfaction}%</strong><span>{item.returnIntent}%</span><span>{item.bottom2}%</span><span>{item.incorrectOrders}%</span><a href={item.reportUrl} target="_blank" rel="noreferrer">Abrir ↗</a></div>)}
                </div>
                <p className="inventory-note">Fonte: relatórios mensais e relatório YTD Tell The Arches do restaurante Imperial, disponíveis na pasta partilhada. O YTD cobre 1 de janeiro a 31 de julho de 2026; fonte validada em 13 de agosto de 2026.</p>
              </div>
            </section>
          )}

          {view === "desenvolvimento" && currentUser.role === "admin" && (
            <section className="development-page" aria-labelledby="development-title">
              <div className="development-page-heading"><div><span className="eyebrow">Área reservada</span><h2 id="development-title">Em desenvolvimento</h2><p>Protótipos em construção, disponíveis apenas para o administrador.</p></div><span className="development-private-badge">◆ Administrador</span></div>
              <nav className="development-subnav" aria-label="Módulos em desenvolvimento"><button type="button" className={developmentSection === "cofre" ? "active" : ""} onClick={() => setDevelopmentSection("cofre")}><span>▣</span>Controlo Cofre</button><button type="button" className={developmentSection === "deposito" ? "active" : ""} onClick={() => setDevelopmentSection("deposito")}><span>▤</span>Folha Depósito</button><button type="button" className={developmentSection === "faltas" ? "active" : ""} onClick={() => setDevelopmentSection("faltas")}><span>◷</span>Faltas &amp; Atrasos</button><button type="button" className={developmentSection === "disputas" ? "active" : ""} onClick={() => setDevelopmentSection("disputas")}><span>◎</span>Disputas Delivery</button></nav>
              {developmentSection === "cofre" ? <VaultControlPrototype isAdmin={currentUser.role === "admin"} /> : developmentSection === "deposito" ? <DepositSheetPrototype /> : developmentSection === "faltas" ? <AbsencesPrototype /> : <DeliveryDisputesPrototype />}
            </section>
          )}

          {view === "alertas" && <AlertsCenter />}

          {view === "configuracoes" && (
            <section className="settings-section" aria-labelledby="settings-title">
              <div className="settings-heading">
                <div><span className="eyebrow">Administração do portal</span><h2 id="settings-title">Configurações</h2><p>Gestão dos utilizadores, níveis de acesso e fontes partilhadas.</p></div>
                {!editingFolderCounts ? <button className="settings-update-button" onClick={beginFolderUpdate}>↻ Atualizar quantidades</button> : <div className="settings-edit-actions"><button onClick={() => setEditingFolderCounts(false)}>Cancelar</button><button className="save" onClick={saveFolderCounts}>Guardar alterações</button></div>}
              </div>
              <div className="settings-card users-settings-card requests-card">
                <div className="settings-card-title"><div><span className="eyebrow">Aprovação do administrador</span><h3>Pedidos de acesso</h3></div><span className={managedUsers.some((user) => user.status === "pendente") ? "pending-count has-pending" : "pending-count"}>{managedUsers.filter((user) => user.status === "pendente").length} pendentes</span></div>
                <div className="users-table" role="table" aria-label="Pedidos de acesso pendentes">
                  <div className="user-row request-row user-header" role="row"><span>Utilizador</span><span>Data do pedido</span><span>Departamento</span><span>Nível a atribuir</span><span>Validação</span></div>
                  {managedUsers.filter((user) => user.status === "pendente").map((user) => <div className="user-row request-row" role="row" key={user.id}>
                    <div className="user-identity"><span className="avatar small">{userInitials(user.name, user.login)}</span><span className="user-identity-copy"><strong>{user.name || "Sem nome"}</strong><small>{user.login}</small></span></div>
                    <span>{new Date(user.createdAt).toLocaleDateString("pt-PT")}</span>
                    <select value={user.department} onChange={(event) => updateManagedUser(user.id, { department: event.target.value as UserDepartment })} aria-label={`Departamento de ${user.login}`}><option value="">Por atribuir</option>{departments.map((item) => <option value={item.id} key={item.id}>{item.icon} {item.label}</option>)}</select>
                    <select value={user.role} onChange={(event) => updateManagedUser(user.id, { role: event.target.value as AppRole })} aria-label={`Nível de acesso a atribuir a ${user.login}`}><option value="admin">Administrador</option><option value="editor">Editor</option><option value="consulta">Consulta</option></select>
                    <div className="user-actions"><button className="approve-user" onClick={() => updateManagedUser(user.id, { status: "ativo" })}>✓ Aprovar</button><button className="reject-user" onClick={() => updateManagedUser(user.id, { status: "rejeitado" })}>Recusar</button></div>
                  </div>)}
                  {!managedUsers.some((user) => user.status === "pendente") && <div className="users-empty"><span>✓</span><div><strong>Sem pedidos pendentes</strong><small>Os novos pedidos aparecerão automaticamente nesta lista.</small></div></div>}
                </div>
              </div>
              <div className="settings-card users-settings-card">
                <div className="settings-card-title"><div><span className="eyebrow">Controlo de acessos</span><h3>Lista de utilizadores</h3></div><span>{managedUsers.filter((user) => user.status !== "pendente").length} utilizadores</span></div>
                <div className="access-levels"><span><b>Administrador</b> gestão total</span><span><b>Editor</b> cria e altera tarefas</span><span><b>Consulta</b> apenas visualização</span></div>
                <div className="users-table" role="table" aria-label="Lista de utilizadores validados">
                  <div className="user-row user-header" role="row"><span>Utilizador</span><span>Registo</span><span>Departamento</span><span>Estado</span><span>Nível de acesso</span><span>Ação</span></div>
                  {managedUsers.filter((user) => user.status !== "pendente").map((user) => <div className="user-row" role="row" key={user.id}>
                    <div className="user-identity"><span className="avatar small">{userInitials(user.name, user.login)}</span><span className="user-identity-copy"><strong>{user.name || "Sem nome"}</strong><small>{user.login}</small></span>{user.id === currentUser.id && <small>Você</small>}</div>
                    <span>{new Date(user.createdAt).toLocaleDateString("pt-PT")}</span>
                    <select value={user.department} onChange={(event) => updateManagedUser(user.id, { department: event.target.value as UserDepartment })} aria-label={`Departamento de ${user.login}`}><option value="">Por atribuir</option>{departments.map((item) => <option value={item.id} key={item.id}>{item.icon} {item.label}</option>)}</select>
                    <span className={`user-status ${user.status}`}>{user.status === "ativo" ? "Ativo" : "Recusado"}</span>
                    <select value={user.role} disabled={user.id === currentUser.id} onChange={(event) => updateManagedUser(user.id, { role: event.target.value as AppRole })} aria-label={`Nível de acesso de ${user.login}`}><option value="admin">Administrador</option><option value="editor">Editor</option><option value="consulta">Consulta</option></select>
                    <div className="user-actions">{user.status === "rejeitado" ? <button className="approve-user" onClick={() => updateManagedUser(user.id, { status: "ativo" })}>Reativar</button> : user.id !== currentUser.id ? <button className="reject-user" onClick={() => updateManagedUser(user.id, { status: "rejeitado" })}>Desativar</button> : <span>Conta principal</span>}<button className="delete-user" disabled={user.id === currentUser.id} onClick={() => deleteManagedUser(user)} title={user.id === currentUser.id ? "A conta em utilização não pode ser eliminada" : `Eliminar ${user.login}`}>Eliminar</button></div>
                  </div>)}
                </div>
                <p className="inventory-note">Os novos utilizadores registam nome, email e password através do botão “Novo utilizador”. O portal só fica disponível depois da validação do administrador.</p>
              </div>
              <div className="settings-card">
                <div className="settings-card-title"><div><span className="eyebrow">Google Drive</span><h3>Pastas partilhadas</h3></div><span>{sharedFolders.reduce((sum, folder) => sum + folder.fileCount, 0)} ficheiros registados</span></div>
                <div className="folder-settings-list">
                  {sharedFolders.map((folder) => <article className="folder-setting-row" key={folder.id}>
                    <span className="folder-setting-icon">▣</span>
                    <div className="folder-setting-copy"><strong>{folder.name}</strong><small>{folder.description}</small><span>Atualizado em {new Date(folder.updatedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <label className={editingFolderCounts ? "folder-count editing" : "folder-count"}><span>Ficheiros</span>{editingFolderCounts ? <input type="number" min="0" value={folderDrafts[folder.id] ?? folder.fileCount} onChange={(event) => setFolderDrafts((current) => ({ ...current, [folder.id]: Number(event.target.value) }))} aria-label={`Quantidade de ficheiros em ${folder.name}`} /> : <strong>{folder.fileCount}</strong>}</label>
                    <a href={folder.url} target="_blank" rel="noreferrer">Abrir pasta ↗</a>
                  </article>)}
                </div>
                <p className="inventory-note">Utilize “Atualizar quantidades” para corrigir manualmente a contagem quando forem adicionados ou removidos ficheiros nas pastas do Drive.</p>
              </div>
            </section>
          )}

          {view === "resumo" && (
            <section className="objectives-section">
              <div className="section-title"><div><span className="eyebrow">Julho 2026</span><h2>Objetivos mensais</h2></div>{view === "resumo" && <button className="text-button compact" onClick={() => setView("objetivos")}>Ver detalhe →</button>}</div>
              <div className="objective-grid">
                {activeProfile.objectives.map((objective) => (
                  <article className="objective-card" key={objective.label}>
                    <div className={`objective-icon ${objective.tone}`}>{objective.value >= 90 ? "★" : objective.value >= 75 ? "↗" : "◒"}</div>
                    <div className="objective-copy"><strong>{objective.label}</strong><span>{objective.target}</span></div>
                    <strong className="objective-value">{objective.display ?? `${objective.value}%`}</strong>
                    <div className="progress-track"><span className={objective.tone} style={{ width: `${objective.value}%` }} /></div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "objetivos" && (
            <section ref={objectivesExportRef} className="restaurant-objectives" aria-labelledby="restaurant-objectives-title">
              <div className="restaurant-objectives-heading">
                <div><span className="eyebrow">{selectedObjectiveMonth.label} · {department === "global" ? "Todos os departamentos" : activeDepartment?.label}</span><h2 id="restaurant-objectives-title">Objetivos mensais</h2><p>{department === "global" ? "Leitura rápida das metas, resultados e pontuação." : `Indicadores acompanhados por ${activeDepartment?.label}.`}</p></div>
                <div className="objective-toolbar" data-export-exclude>
                  <label><span>Mês</span><select value={objectiveMonth} onChange={(event) => setObjectiveMonth(event.target.value)} aria-label="Filtrar objetivos por mês">{objectiveMonthOptions.map((month) => <option value={month.value} key={month.value}>{month.label}</option>)}</select></label>
                  <button type="button" className="objective-export" onClick={exportObjectives} disabled={!selectedObjectives.length}><span>⇩</span> Exportar PNG</button>
                </div>
              </div>
              <div className="objectives-kpi-grid" aria-label="Resumo dos objetivos">
                <article className="objective-kpi objective-kpi-month"><span>◎</span><div><small>Percentagem mensal</small><strong>{objectiveStats.monthlyPercent}%</strong><p>{objectiveStats.achievedPoints} de {objectiveStats.possiblePoints} pontos</p></div></article>
                <article className="objective-kpi objective-kpi-superado"><span>★</span><div><small>Superados</small><div className="objective-kpi-value"><strong>{objectiveStats.superados.count}</strong><b>{objectiveStats.superados.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-atingido"><span>✓</span><div><small>Atingidos</small><div className="objective-kpi-value"><strong>{objectiveStats.atingidos.count}</strong><b>{objectiveStats.atingidos.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-proximo"><span>↗</span><div><small>Próximos</small><div className="objective-kpi-value"><strong>{objectiveStats.proximos.count}</strong><b>{objectiveStats.proximos.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-nao"><span>!</span><div><small>Não atingidos</small><div className="objective-kpi-value"><strong>{objectiveStats.naoAtingidos.count}</strong><b>{objectiveStats.naoAtingidos.percent}%</b></div><p>do total de objetivos</p></div></article>
              </div>
              <section className={`objective-analysis analysis-${objectiveAnalysis.tone}`} aria-labelledby="objective-analysis-title">
                <div className="objective-analysis-heading"><div><span className="analysis-icon">✦</span><div><span className="eyebrow">Análise do mês</span><h3 id="objective-analysis-title">Leitura dos resultados</h3></div></div><span className="analysis-status">{selectedObjectives.length ? objectiveAnalysis.label : "Sem dados"}</span></div>
                {selectedObjectives.length ? <div className="objective-analysis-copy">
                  <p>Em <strong>{selectedObjectiveMonth.label}</strong>, o resultado mensal situa-se nos <strong>{objectiveStats.monthlyPercent}%</strong>, com <strong>{objectiveStats.achievedPoints} de {objectiveStats.possiblePoints} pontos</strong> alcançados e {objectiveAnalysis.remainingPoints} pontos ainda por conquistar. Dos {objectiveStats.total} objetivos acompanhados, {objectiveStats.superados.count} {objectiveStats.superados.count === 1 ? "foi superado" : "foram superados"}, {objectiveStats.atingidos.count} {objectiveStats.atingidos.count === 1 ? "foi atingido" : "foram atingidos"}, {objectiveStats.proximos.count} {objectiveStats.proximos.count === 1 ? "está próximo da meta" : "estão próximos da meta"} e {objectiveStats.naoAtingidos.count} {objectiveStats.naoAtingidos.count === 1 ? "não foi atingido" : "não foram atingidos"}. Assim, <strong>{objectiveAnalysis.onTrackPercent}% dos objetivos estão atingidos ou superados</strong>. {objectiveAnalysis.positiveNames.length ? <>Os resultados positivos concentram-se em <strong>{objectiveAnalysis.positiveNames.join(", ")}</strong>. </> : <>Ainda não existem objetivos atingidos ou superados. </>}{objectiveAnalysis.priorityNames.length ? <>A prioridade de intervenção deve incidir sobre <strong>{objectiveAnalysis.priorityNames.join(", ")}</strong>. </> : <>Não existem objetivos críticos a exigir intervenção imediata. </>}{objectiveAnalysis.nearNames.length ? <>Para consolidar a evolução, importa acompanhar de perto <strong>{objectiveAnalysis.nearNames.join(", ")}</strong>.</> : null}</p>
                  <div className="analysis-progress" aria-label={`${objectiveStats.monthlyPercent}% da pontuação mensal`}><i><b style={{ width: `${Math.min(100, objectiveStats.monthlyPercent)}%` }} /></i></div>
                </div> : <div className="objective-analysis-empty"><span>◷</span><p>A análise ficará disponível assim que existirem resultados para {selectedObjectiveMonth.label}.</p></div>}
              </section>
              <div className="objective-topic-grid" aria-label="Objetivos agrupados por tema">
                {!selectedObjectives.length && <div className="objective-empty"><span>◷</span><div><strong>Sem objetivos importados</strong><p>Ainda não existem dados para {selectedObjectiveMonth.label}. Selecione outro mês.</p></div></div>}
                {objectivePointGroups.map((group) => <section className="objective-score-row" key={group.points ?? "sem-pontos"}>
                  <div className="objective-score-heading"><span>{group.points === undefined ? "Sem pontuação definida" : `${group.points} pontos possíveis`}</span><small>{group.objectives.length} {group.objectives.length === 1 ? "objetivo" : "objetivos"}</small></div>
                  <div className="objective-score-cards">{group.objectives.map((item) => { const result = getObjectiveResult(item); const visual = objectiveVisuals[item.theme] ?? { icon: "◎", label: item.theme, tone: "mint" }; const owner = objectiveDepartments[item.theme]; return <article className={`objective-topic-card result-${statusClass(result)}`} key={item.theme}>
                  <div className="objective-topic-head"><span className={`objective-topic-image visual-${visual.tone}`} role="img" aria-label={visual.label}>{visual.icon}</span><div><h3>{item.theme}</h3></div>{owner && <div className="objective-topic-corner"><span className={`objective-department-corner department-${owner.tone}`} role="img" aria-label={`Departamento responsável: ${owner.name}`}>{owner.icon}</span><strong>{owner.name}</strong></div>}</div>
                  <div className="objective-topic-values">
                    <div><small>Objetivo</small><strong>{item.target ?? "—"}</strong></div>
                    <div><small>Resultado</small><strong>{item.result ?? "—"}</strong></div>
                  </div>
                  <div className="objective-topic-points">
                    <span><small>Pontos possíveis</small><strong>{item.possiblePoints ?? "—"}</strong></span>
                    <span><small>Pontos atingidos</small><strong>{item.achievedPoints ?? "—"}</strong></span>
                  </div>
                  <div className="objective-topic-progress">
                    <div><small>Resultado</small><strong>{result}</strong></div>
                    <i><em style={{ width: `${item.achievedPercent ?? 0}%` }} /></i>
                  </div>
                </article>; })}</div>
                </section>)}
              </div>
              <p className="inventory-note">Fonte: folha “BD Mês” do ficheiro de seguimento de objetivos. Os campos sem resultado permanecem assinalados como “Por atualizar”. <a href={objectivesSourceUrl} target="_blank" rel="noreferrer">Abrir ficheiro fonte ↗</a></p>
            </section>
          )}

          {view === "areasglobais" && (
            <section className="area-evaluation-section" aria-labelledby="area-evaluation-title">
              <div className="area-evaluation-heading">
                <div><span className="eyebrow">Compilação de todos os departamentos</span><h2 id="area-evaluation-title">Avaliação mensal das áreas</h2><p>Acompanhamento separado do estado de limpeza e manutenção de cada área.</p></div>
                <div className="area-evaluation-actions">
                  <label><span>Mês</span><select value={evaluationMonth} onChange={(event) => setEvaluationMonth(event.target.value)}>{objectiveMonthOptions.map((month) => <option value={month.value} key={month.value}>{month.label}</option>)}</select></label>
                  {currentUser.role === "admin" ? <button onClick={saveAreaEvaluations} disabled={evaluationBusy}>{evaluationBusy ? "A guardar…" : "Guardar avaliação mensal"}</button> : <span className="read-only-badge">Avaliação reservada ao administrador</span>}
                </div>
              </div>

              <div className="area-evaluation-summary">
                <article><small>Avaliações preenchidas</small><strong>{areaRatingStats.rated}<span>/{areaRatingStats.total} · {areaRatingStats.completionPercent}%</span></strong></article>
                <article className="rating-bom"><small>Bom</small><strong>{areaRatingStats.bom}<span>{areaRatingStats.bomPercent}%</span></strong></article>
                <article className="rating-aceitavel"><small>Aceitável</small><strong>{areaRatingStats.aceitavel}<span>{areaRatingStats.aceitavelPercent}%</span></strong></article>
                <article className="rating-melhorar"><small>Necessita melhorar</small><strong>{areaRatingStats.melhorar}<span>{areaRatingStats.melhorarPercent}%</span></strong></article>
                <article className="rating-nao"><small>Não aceitável</small><strong>{areaRatingStats.naoAceitavel}<span>{areaRatingStats.naoAceitavelPercent}%</span></strong></article>
              </div>

              <div className="department-rating-cards" aria-label="Avaliação global por departamento">
                {departmentEvaluationSummaries.map((summary) => {
                  const profile = departments.find((item) => item.id === summary.departmentId)!;
                  return <article className="department-rating-card" key={summary.departmentId}>
                    <div className="department-rating-card-title"><span className={`department-initials department-icon department-${profile.id}`} role="img" aria-label={profile.label}>{profile.icon}</span><strong>{profile.label}</strong></div>
                    <div className="department-rating-results">
                      <div><small>Limpeza</small><span className="department-rating-value" aria-label={`Limpeza: ${summary.cleaningPercent === null ? "por avaliar" : `${summary.cleaningPercent}%, ${summary.cleaningRating}`}`}><i className={`department-rating-dot ${statusClass(summary.cleaningRating || "Por avaliar")}`} /><strong>{summary.cleaningPercent === null ? "—" : `${summary.cleaningPercent}%`}</strong></span></div>
                      <div><small>Manutenção</small><span className="department-rating-value" aria-label={`Manutenção: ${summary.maintenancePercent === null ? "por avaliar" : `${summary.maintenancePercent}%, ${summary.maintenanceRating}`}`}><i className={`department-rating-dot ${statusClass(summary.maintenanceRating || "Por avaliar")}`} /><strong>{summary.maintenancePercent === null ? "—" : `${summary.maintenancePercent}%`}</strong></span></div>
                    </div>
                  </article>;
                })}
              </div>

              <div className="area-rating-legend" aria-label="Legenda das classificações">
                <span className="bom"><i /> Bom <b>90%–100%</b></span><span className="aceitavel"><i /> Aceitável <b>75%–90%</b></span><span className="necessita-melhorar"><i /> Necessita Melhorar <b>50%–75%</b></span><span className="nao-aceitavel"><i /> Não aceitável <b>0%–50%</b></span>
              </div>

              <div className="department-evaluations">
                {(Object.entries(cleaningAreasByDepartment) as [EvaluationDepartment, readonly string[]][]).map(([departmentId, areas]) => {
                  const profile = departments.find((item) => item.id === departmentId)!;
                  const collapsed = Boolean(collapsedEvaluationDepartments[departmentId]);
                  return <section className="department-evaluation-card" key={departmentId}>
                    <div className="department-evaluation-title"><span className={`department-initials department-icon department-${profile.id}`} role="img" aria-label={profile.label}>{profile.icon}</span><div><h3>{profile.label}</h3><small>{areas.length} {areas.length === 1 ? "área acompanhada" : "áreas acompanhadas"}</small></div><button className="department-evaluation-toggle" type="button" aria-expanded={!collapsed} onClick={() => setCollapsedEvaluationDepartments((current) => ({ ...current, [departmentId]: !collapsed }))}>{collapsed ? "Expandir ↓" : "Ocultar áreas ↑"}</button></div>
                    {!collapsed && <div className="area-evaluation-table">
                      <div className="area-evaluation-row header"><span>Área</span><span>Estado de limpeza</span><span>Estado de manutenção</span></div>
                      {areas.map((area) => {
                        const key = evaluationKey(departmentId, area);
                        const ratings = areaEvaluationDraft[key] ?? { cleaningRating: "" as AreaRating, maintenanceRating: "" as AreaRating };
                        return <div className="area-evaluation-row" key={area}>
                          <strong>{area}</strong>
                          {currentUser.role === "admin" ? <div className="rating-buttons" role="group" aria-label={`Estado de limpeza de ${area}`}>{areaRatings.slice(1).map((rating) => <button type="button" key={rating} title={rating} aria-label={rating} aria-pressed={ratings.cleaningRating === rating} className={`rating-choice ${statusClass(rating)} ${ratings.cleaningRating === rating ? "selected" : ""}`} onClick={() => setAreaEvaluationDraft((current) => ({ ...current, [key]: { ...ratings, cleaningRating: ratings.cleaningRating === rating ? "" : rating } }))}>{areaRatingIcons[rating]}</button>)}</div> : <span className={`rating-display ${statusClass(ratings.cleaningRating || "Por avaliar")}`}>{ratings.cleaningRating || "Por avaliar"}</span>}
                          {currentUser.role === "admin" ? <div className="rating-buttons" role="group" aria-label={`Estado de manutenção de ${area}`}>{areaRatings.slice(1).map((rating) => <button type="button" key={rating} title={rating} aria-label={rating} aria-pressed={ratings.maintenanceRating === rating} className={`rating-choice ${statusClass(rating)} ${ratings.maintenanceRating === rating ? "selected" : ""}`} onClick={() => setAreaEvaluationDraft((current) => ({ ...current, [key]: { ...ratings, maintenanceRating: ratings.maintenanceRating === rating ? "" : rating } }))}>{areaRatingIcons[rating]}</button>)}</div> : <span className={`rating-display ${statusClass(ratings.maintenanceRating || "Por avaliar")}`}>{ratings.maintenanceRating || "Por avaliar"}</span>}
                        </div>;
                      })}
                    </div>}
                  </section>;
                })}
              </div>
              <p className="area-evaluation-footnote">{evaluationUpdatedAt ? `Última atualização: ${new Date(evaluationUpdatedAt).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" })}.` : "Ainda não existe uma avaliação guardada para este mês."} Apenas o administrador pode alterar estas classificações.</p>
            </section>
          )}

          {view === "resumo" && (
            <section className="panel zones-panel">
              <div className="panel-heading"><div><span className="eyebrow department-eyebrow">{activeDepartment && <i className={`department-context-icon department-${activeDepartment.id}`} role="img" aria-label={activeDepartment.label}>{activeDepartment.icon}</i>}Estado atual · {departmentLabel}</span><h2>Áreas de limpeza</h2></div><span className="live-indicator"><i /> Atualizado agora</span></div>
              <div className="zones-grid">
                {activeProfile.zones.map((zone) => (
                  <article className="zone-card" key={zone.name}>
                    <div className={`zone-symbol ${zone.tone}`}>{zone.percent === 100 ? "✓" : zone.percent >= 75 ? "◷" : "!"}</div>
                    <div><strong>{zone.name}</strong><span>{zone.detail}</span></div>
                    <span className={`status ${zone.tone}`}>{zone.status}</span>
                    <div className="zone-track"><span className={zone.tone} style={{ width: `${zone.percent}%` }} /></div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "areas" && interventionDepartment && (
            <section className="panel cleaning-planner" aria-labelledby="cleaning-planner-title">
              <div className="panel-heading cleaning-planner-heading">
                <div><span className="eyebrow department-eyebrow">{activeDepartment && <i className={`department-context-icon department-${activeDepartment.id}`} role="img" aria-label={activeDepartment.label}>{activeDepartment.icon}</i>}{departmentLabel}</span><h2 id="cleaning-planner-title">Áreas de limpeza e intervenções</h2><p>Planeamento de ações de limpeza e manutenção nas áreas acompanhadas.</p></div>
                {canManageCleaning ? <button className="schedule-intervention-button" onClick={() => { if (!showInterventionForm) setInterventionDraft(emptyInterventionDraft(selectedCleaningAreas[0])); setShowInterventionForm((visible) => !visible); }}>{showInterventionForm ? "Fechar formulário" : "+ Agendar intervenção"}</button> : <span className="read-only-badge">Apenas consulta</span>}
              </div>

              <div className="cleaning-summary" aria-label="Resumo das intervenções">
                <article><span>▦</span><div><small>Áreas acompanhadas</small><strong>{selectedCleaningAreas.length}</strong></div></article>
                <article><span>◷</span><div><small>Intervenções abertas</small><strong>{openInterventions}</strong></div></article>
                <article><span>✓</span><div><small>Intervenções encerradas</small><strong>{closedInterventions}</strong></div></article>
              </div>

              <div className="cleaning-areas-catalog" aria-label="Áreas de limpeza">
                {selectedCleaningAreas.map((area) => {
                  const areaInterventions = cleaningInterventions.filter((item) => item.area === area);
                  const areaOpen = areaInterventions.filter((item) => item.status !== "Encerrada").length;
                  return <article key={area} className={areaOpen ? "has-open" : ""}><span>{areaOpen ? "◷" : "✓"}</span><div><strong>{area}</strong><small>{areaOpen ? `${areaOpen} ${areaOpen === 1 ? "intervenção aberta" : "intervenções abertas"}` : areaInterventions.length ? "Sem intervenções abertas" : "Sem intervenções agendadas"}</small></div></article>;
                })}
              </div>

              <section className="department-evaluation-history" aria-labelledby="department-evaluation-history-title">
                <div className="department-evaluation-history-heading"><div><span className="eyebrow">Consulta</span><h3 id="department-evaluation-history-title">Histórico de avaliações</h3></div><span>Limpeza e manutenção</span></div>
                {departmentEvaluationHistorySummaries.length ? <div className="department-history-list">{departmentEvaluationHistorySummaries.map((item) => <article key={item.month}>
                  <div><strong>{new Date(`${item.month}-01T12:00:00`).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}</strong><small>{item.rated}/{item.total} áreas avaliadas</small></div>
                  <span><small>Limpeza</small><b className={`history-rating ${statusClass(item.cleaningRating || "Por avaliar")}`}><i />{item.cleaningPercent === null ? "—" : `${item.cleaningPercent}%`}</b></span>
                  <span><small>Manutenção</small><b className={`history-rating ${statusClass(item.maintenanceRating || "Por avaliar")}`}><i />{item.maintenancePercent === null ? "—" : `${item.maintenancePercent}%`}</b></span>
                </article>)}</div> : <div className="department-history-empty"><span>◷</span><div><strong>Sem avaliações anteriores</strong><small>As avaliações guardadas pelo administrador ficarão disponíveis aqui, mês a mês.</small></div></div>}
              </section>

              {showInterventionForm && canManageCleaning && <form className="intervention-form" onSubmit={scheduleIntervention}>
                <div className="intervention-form-heading"><div><span className="eyebrow">Novo agendamento</span><h3>Detalhes da intervenção</h3></div><small>Todos os campos são obrigatórios</small></div>
                <div className="intervention-form-grid">
                  <label><span>Área</span><select value={interventionDraft.area} onChange={(event) => setInterventionDraft((draft) => ({ ...draft, area: event.target.value }))}>{selectedCleaningAreas.map((area) => <option value={area} key={area}>{area}</option>)}</select></label>
                  <label><span>Tipo</span><select value={interventionDraft.kind} onChange={(event) => setInterventionDraft((draft) => ({ ...draft, kind: event.target.value as "Limpeza" | "Manutenção" }))}><option>Limpeza</option><option>Manutenção</option></select></label>
                  <label><span>Dia da intervenção</span><input type="date" required value={interventionDraft.scheduledDate} onChange={(event) => setInterventionDraft((draft) => ({ ...draft, scheduledDate: event.target.value }))} /></label>
                  <label><span>Horas estimadas</span><input type="number" min="0.5" max="999" step="0.5" required value={interventionDraft.estimatedHours} onChange={(event) => setInterventionDraft((draft) => ({ ...draft, estimatedHours: event.target.value }))} /></label>
                  <label className="resources-field"><span>Recursos necessários</span><textarea required maxLength={500} rows={3} placeholder="Ex.: 2 colaboradores, escadote, detergente e equipamento de proteção" value={interventionDraft.resources} onChange={(event) => setInterventionDraft((draft) => ({ ...draft, resources: event.target.value }))} /></label>
                </div>
                <div className="intervention-form-actions"><button type="button" onClick={() => setShowInterventionForm(false)}>Cancelar</button><button className="save" type="submit" disabled={interventionBusy}>{interventionBusy ? "A guardar…" : "Guardar agendamento"}</button></div>
              </form>}

              <div className="interventions-section">
                <div className="interventions-heading"><div><span className="eyebrow">Planeamento</span><h3>Intervenções agendadas</h3></div><span>{cleaningInterventions.length} {cleaningInterventions.length === 1 ? "registo" : "registos"}</span></div>
                <div className="interventions-list">
                  {cleaningInterventions.map((intervention) => <article className={intervention.status === "Encerrada" ? "intervention-card closed" : "intervention-card"} key={intervention.id}>
                    <div className="intervention-main"><span className={intervention.kind === "Limpeza" ? "kind-badge cleaning" : "kind-badge maintenance"}>{intervention.kind === "Limpeza" ? "✦" : "⚙"} {intervention.kind}</span><strong>{intervention.area}</strong><small>Agendada por {intervention.createdByName}</small></div>
                    <div className="intervention-detail"><small>Dia</small><strong>{new Date(`${intervention.scheduledDate}T12:00:00`).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</strong></div>
                    <div className="intervention-detail"><small>Estimativa</small><strong>{intervention.estimatedHours.toLocaleString("pt-PT")} h</strong></div>
                    <div className="intervention-resources"><small>Recursos necessários</small><p>{intervention.resources}</p></div>
                    <label className="intervention-close"><input type="checkbox" checked={intervention.status === "Encerrada"} disabled={!canManageCleaning} onChange={(event) => setInterventionClosed(intervention, event.target.checked)} /><span>{intervention.status === "Encerrada" ? "Encerrada" : "Marcar como encerrada"}</span></label>
                  </article>)}
                  {!cleaningInterventions.length && <div className="interventions-empty"><span>◷</span><div><strong>Sem intervenções agendadas</strong><small>Utilize “Agendar intervenção” para criar o primeiro registo.</small></div></div>}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
