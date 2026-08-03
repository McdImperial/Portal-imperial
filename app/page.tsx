"use client";

import { useEffect, useMemo, useState } from "react";
import inventoryProductsData from "./data/inventory-products.json";
import objectivesDataJson from "./data/objectives-data.json";
import r2pDataJson from "./data/r2p-data.json";
import tellTheArchesDataJson from "./data/tell-the-arches.json";

type View = "resumo" | "tarefas" | "objetivos" | "areas" | "custos" | "r2p" | "tellarches" | "configuracoes";
type Department = "global" | "qualidade" | "pessoas" | "cliente" | "manutencao" | "segit";
type TaskStatus = "Por fazer" | "Em curso" | "Bloqueado" | "Concluído";
type AppRole = "admin" | "editor" | "consulta";
type AppUser = { id: number; name: string; login: string; role: AppRole; status: string };
type ManagedUser = AppUser & { createdAt: string; approvedAt: string | null };

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
  { id: 1, title: "Verificação e validação WebHACCP", area: "Qualidade", due: "Semanal · 2.ª-feira", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 2, title: "LV Segurança Alimentar", area: "Segurança alimentar", due: "Mensal · até dia 10", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 3, title: "Verificação controlo Faturação", area: "Controlo", due: "Semanal · 3.ª-feira", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 4, title: "Download BD My Store", area: "Dados", due: "Semanal · 2.ª-feira", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 5, title: "Controlo Refeições", area: "Controlo", due: "Semanal · 4.ª-feira", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 6, title: "Controlo Perdas", area: "Perdas", due: "Semanal · 5.ª-feira", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Alta", done: false, department: "qualidade" },
  { id: 7, title: "Inventário e Controlo OPS", area: "OPS", due: "Semanal · 3.ª-feira", assignee: "SI", assigneeName: "Silvia Tavares", priority: "Alta", done: false, department: "qualidade" },
  { id: 8, title: "Preparação OPS — Semana", area: "OPS", due: "Semanal · 2.ª-feira", assignee: "SI", assigneeName: "Silvia Tavares", priority: "Média", done: false, department: "qualidade" },
  { id: 9, title: "Análise Desvios Inventário", area: "Inventário", due: "Semanal · 3.ª-feira", assignee: "SU", assigneeName: "Susana Torres", priority: "Alta", done: false, department: "qualidade" },
  { id: 10, title: "Encomenda Air Liquide", area: "Encomendas", due: "Mensal · 5.ª-feira", assignee: "SI", assigneeName: "Silvia Tavares", priority: "Baixa", done: false, department: "qualidade" },
  { id: 11, title: "Encomenda Maiapaper", area: "Encomendas", due: "Mensal · 5.ª-feira", assignee: "SI", assigneeName: "Silvia Tavares", priority: "Baixa", done: false, department: "qualidade" },
  { id: 12, title: "Gestão e Manutenção Layouts", area: "Layouts", due: "Mensal · 4.ª-feira", assignee: "SU", assigneeName: "Susana Torres", priority: "Média", done: false, department: "qualidade" },
  { id: 13, title: "Organização e atualização de listas de inventário", area: "Inventário", due: "Mensal · 2.ª-feira", assignee: "DC", assigneeName: "Diogo Cabral", priority: "Média", done: false, department: "qualidade" },
  { id: 14, title: "LV de Campanhas e Preparação", area: "Campanhas", due: "Mensal", assignee: "SU", assigneeName: "Susana Torres", priority: "Média", done: false, department: "qualidade" },
  { id: 15, title: "Controlo e gestão de Fardas", area: "Fardas", due: "Quinzenal · 4.ª-feira", assignee: "SI", assigneeName: "Silvia Tavares", priority: "Média", done: false, department: "qualidade" },
  { id: 16, title: "Confirmar plano de formação", area: "Desenvolvimento", due: "Hoje, 14:30", assignee: "CM", priority: "Média", done: false, department: "pessoas" },
  { id: 17, title: "Atualizar mapa de férias", area: "Planeamento", due: "Concluída ontem", assignee: "TS", priority: "Baixa", done: true, department: "pessoas" },
  { id: 18, title: "Responder a pedidos críticos", area: "Apoio ao cliente", due: "Hoje, 12:00", assignee: "JS", priority: "Alta", done: false, department: "cliente" },
  { id: 19, title: "Rever satisfação semanal", area: "Experiência", due: "Amanhã", assignee: "ML", priority: "Média", done: false, department: "cliente" },
  { id: 20, title: "Intervenção na câmara frigorífica", area: "Equipamentos", due: "Hoje, 16:00", assignee: "AR", priority: "Alta", done: false, department: "manutencao" },
  { id: 21, title: "Atualizar plano preventivo", area: "Prevenção", due: "Concluída ontem", assignee: "CM", priority: "Média", done: true, department: "manutencao" },
  { id: 22, title: "Rever acessos de novos colaboradores", area: "IT", due: "Hoje, 15:00", assignee: "TS", priority: "Alta", done: false, department: "segit" },
  { id: 23, title: "Teste mensal de emergência", area: "Segurança", due: "Concluída às 10:20", assignee: "JS", priority: "Média", done: true, department: "segit" },
];

const departments: { id: Department; label: string; short: string }[] = [
  { id: "qualidade", label: "Qualidade & Produtos", short: "QP" },
  { id: "pessoas", label: "Pessoas", short: "PE" },
  { id: "cliente", label: "Serviço Cliente", short: "SC" },
  { id: "manutencao", label: "Manutenção", short: "MA" },
  { id: "segit", label: "Seg. & IT", short: "SI" },
];

const statusOptions: TaskStatus[] = ["Por fazer", "Em curso", "Bloqueado", "Concluído"];
const ownerOptions = [
  { initials: "SU", name: "Susana Torres" },
  { initials: "DC", name: "Diogo Cabral" },
  { initials: "SI", name: "Silvia Tavares" },
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
    zones: [{ name: "Qualidade & Produtos", status: "Atenção", detail: "15 tarefas por concluir", percent: 71, tone: "attention" }, { name: "Pessoas", status: "Em dia", detail: "Objetivos atualizados", percent: 92, tone: "good" }, { name: "Serviço Cliente", status: "Atenção", detail: "2 pedidos críticos", percent: 68, tone: "attention" }, { name: "Manutenção · Seg. & IT", status: "Em curso", detail: "2 ações planeadas", percent: 78, tone: "progress" }],
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
    objectives: [{ label: "Preventivas realizadas", value: 79, target: "Meta: 95%", tone: "mint" }, { label: "Disponibilidade técnica", value: 96, target: "Meta: 97%", tone: "blue" }, { label: "Avarias resolvidas no prazo", value: 72, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Equipamentos críticos", status: "Atenção", detail: "1 intervenção aberta", percent: 62, tone: "attention" }, { name: "Manutenção preventiva", status: "Em curso", detail: "Plano a 79%", percent: 79, tone: "progress" }, { name: "Instalações", status: "Em dia", detail: "Ronda concluída", percent: 100, tone: "good" }, { name: "Fornecedores", status: "Em dia", detail: "Sem ações vencidas", percent: 93, tone: "good" }],
  },
  segit: {
    objectives: [{ label: "Incidentes resolvidos", value: 88, target: "Meta: 95%", tone: "mint" }, { label: "Sistemas disponíveis", value: 99, target: "Meta: 99,5%", tone: "blue" }, { label: "Ações de segurança", value: 76, target: "Meta: 90%", tone: "amber" }],
    zones: [{ name: "Segurança no trabalho", status: "Em dia", detail: "Teste concluído hoje", percent: 96, tone: "good" }, { name: "Acessos & Identidades", status: "Atenção", detail: "3 acessos por rever", percent: 65, tone: "attention" }, { name: "Infraestrutura IT", status: "Em dia", detail: "Sistemas estáveis", percent: 99, tone: "good" }, { name: "Continuidade", status: "Em curso", detail: "Plano em revisão", percent: 81, tone: "progress" }],
  },
} satisfies Record<Department, { objectives: { label: string; value: number; display?: string; target: string; tone: string }[]; zones: { name: string; status: string; detail: string; percent: number; tone: string }[] }>;

const viewLabels: Record<View, string> = {
  resumo: "Visão geral",
  tarefas: "Todas as tarefas",
  objetivos: "Objetivos mensais",
  areas: "Áreas de limpeza",
  custos: "Custo, Comida, Papel e OPS",
  r2p: "Tempos de serviço · R2P",
  tellarches: "Tell The Arches",
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
type SharedFolder = { id: string; name: string; description: string; url: string; fileCount: number; updatedAt: string };

const inventoryProducts = inventoryProductsData as InventoryProduct[];
const inventoryCategoryLabels: Record<InventoryCategory, string> = { food: "Comida", paper: "Papel", ops: "OPS" };
const r2pData = r2pDataJson as R2PData;
const tellTheArchesData = tellTheArchesDataJson as TellTheArchesData;
const qualityTasksSourceUrl = "https://docs.google.com/spreadsheets/d/1aH533lMTXySB8jVm4xRFVNpsoBVuPiqgMbpi_GzWVKY/edit?usp=sharing";
const objectivesSourceUrl = "https://docs.google.com/spreadsheets/d/1xrRSvUDCORagI5FmL0scOvWB7Df-5d3zULKJ0K5w-1s/edit?gid=1860306038#gid=1860306038";
const defaultSharedFolders: SharedFolder[] = [
  { id: "inventario", name: "Relatórios de inventário", description: "Comida, papel, limpeza e material de escritório", url: "https://drive.google.com/drive/folders/1W_C3S1yUFZXGdmETHBesGHwJwk3xoeaZ?usp=sharing", fileCount: 8, updatedAt: "2026-08-02T00:00:00.000Z" },
  { id: "tell-the-arches", name: "Tell The Arches", description: "Relatórios mensais e acumulado YTD", url: "https://drive.google.com/drive/folders/1SAYTBKa7b9Zt7WdoCKFMB3VP4CWbFhTV?usp=sharing", fileCount: 8, updatedAt: "2026-08-02T00:00:00.000Z" },
  { id: "gdr-servico-cliente", name: "GDR Serviço Cliente", description: "Folha GDR e pasta Tell The Arches", url: "https://drive.google.com/drive/folders/1SF6Mk9dVDmUaQ5EyB_LLbkDFOVfdQdP8?usp=sharing", fileCount: 2, updatedAt: "2026-08-02T21:32:55.889Z" },
  { id: "gdr-qualidade-produtos", name: "GDR Qualidade & Produtos", description: "Folha GDR e relatórios de custo de inventário", url: "https://drive.google.com/drive/folders/1yD7oRRAMcCJlVAlw_6wWUCEkuMvCArlW?usp=sharing", fileCount: 2, updatedAt: "2026-08-01T09:35:24.409Z" },
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

export default function Home() {
  const [view, setView] = useState<View>("resumo");
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
          if (active) setTasks(data.tasks);
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

  const scopedTasks = tasks.filter((task) => department === "global" || task.department === department);
  const pending = scopedTasks.filter((task) => !task.done).length;
  const completed = scopedTasks.length - pending;
  const completion = scopedTasks.length ? Math.round((completed / scopedTasks.length) * 100) : 0;
  const activeProfile = departmentProfiles[department];
  const departmentLabel = departments.find((item) => item.id === department)?.label ?? "Visão global";
  const selectedObjectiveMonth = objectiveMonthOptions.find((item) => item.value === objectiveMonth) ?? objectiveMonthOptions[6];
  const selectedObjectiveSnapshot = objectivesByMonth[objectiveMonth];
  const selectedObjectives = selectedObjectiveSnapshot?.objectives ?? [];
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
      monthlyPercent: selectedObjectiveSnapshot?.monthlyPercent ?? (possiblePoints ? Math.round((achievedPoints / possiblePoints) * 100) : 0),
      superados: { count: superados, percent: percent(superados) },
      atingidos: { count: atingidos, percent: percent(atingidos) },
      proximos: { count: proximos, percent: percent(proximos) },
      naoAtingidos: { count: naoAtingidos, percent: percent(naoAtingidos) },
    };
  }, [selectedObjectives, selectedObjectiveSnapshot]);

  const visibleTasks = useMemo(() => {
    if (filter === "pendentes") return scopedTasks.filter((task) => !task.done);
    if (filter === "concluidas") return scopedTasks.filter((task) => task.done);
    return scopedTasks;
  }, [filter, scopedTasks]);

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
    if (!selectedObjectives.length) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;
      doc.setFillColor(36, 87, 63);
      doc.rect(0, 0, pageWidth, 27, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("McDonald's Imperial — Objetivos mensais", margin, 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(selectedObjectiveMonth.label, margin, 20);

      doc.setTextColor(27, 43, 36);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Resultado mensal: ${objectiveStats.monthlyPercent}%`, margin, 37);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`${objectiveStats.achievedPoints} de ${objectiveStats.possiblePoints} pontos`, margin, 43);
      doc.text(`Superados ${objectiveStats.superados.count} (${objectiveStats.superados.percent}%)  ·  Atingidos ${objectiveStats.atingidos.count} (${objectiveStats.atingidos.percent}%)  ·  Próximos ${objectiveStats.proximos.count} (${objectiveStats.proximos.percent}%)  ·  Não atingidos ${objectiveStats.naoAtingidos.count} (${objectiveStats.naoAtingidos.percent}%)`, margin, 49);

      const headers = ["Tema objetivo", "Objetivo", "Resultado", "Classificação", "Pontos possíveis", "Pontos atingidos", "% atingido"];
      const widths = [54, 31, 31, 43, 38, 38, 22];
      const startY = 57;
      const rowHeight = 8;
      let x = margin;
      doc.setFillColor(36, 87, 63);
      doc.rect(margin, startY, widths.reduce((sum, width) => sum + width, 0), rowHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      headers.forEach((header, index) => { doc.text(header, x + 2, startY + 5.2); x += widths[index]; });

      selectedObjectives.forEach((item, rowIndex) => {
        const y = startY + rowHeight + rowIndex * rowHeight;
        if (rowIndex % 2 === 0) { doc.setFillColor(247, 249, 248); doc.rect(margin, y, widths.reduce((sum, width) => sum + width, 0), rowHeight, "F"); }
        doc.setDrawColor(222, 229, 225);
        doc.line(margin, y + rowHeight, pageWidth - margin - 3, y + rowHeight);
        doc.setTextColor(31, 45, 39);
        doc.setFont("helvetica", rowIndex === 0 ? "bold" : "normal");
        doc.setFontSize(8);
        const values = [item.theme, item.target ?? "—", item.result ?? "—", getObjectiveResult(item), String(item.possiblePoints ?? "—"), String(item.achievedPoints ?? "—"), `${item.achievedPercent ?? 0}%`];
        x = margin;
        values.forEach((value, index) => { doc.text(value, x + 2, y + 5.2, { maxWidth: widths[index] - 4 }); x += widths[index]; });
      });

      doc.setTextColor(108, 123, 116);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Fonte: folha BD Mês — Seguimento Objetivos IMP - 26", margin, 190);
      doc.save(`objetivos-${objectiveMonth}.pdf`);
      setNotice(`PDF de ${selectedObjectiveMonth.label} exportado.`);
      window.setTimeout(() => setNotice(""), 2400);
    } catch {
      setNotice("Não foi possível gerar o PDF. Tente novamente.");
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

  async function updateManagedUser(id: number, changes: { role?: AppRole; status?: "ativo" | "pendente" | "rejeitado" }) {
    const response = await fetch("/api/auth/users/", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) });
    const data = await response.json() as { user?: ManagedUser; error?: string };
    if (!response.ok || !data.user) { setNotice(data.error || "Não foi possível atualizar o utilizador."); return; }
    setManagedUsers((users) => users.map((user) => user.id === id ? data.user! : user));
    setNotice(changes.status === "ativo" ? "Acesso aprovado." : "Nível de acesso atualizado.");
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

  const roleLabel = (role: AppRole) => role === "admin" ? "Administrador" : role === "editor" ? "Editor" : "Consulta";
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "editor";

  const navItems: { id: View; label: string; glyph: string }[] = [
    { id: "resumo", label: "Resumo", glyph: "▦" },
    { id: "tarefas", label: "Tarefas", glyph: "✓" },
    { id: "objetivos", label: "Objetivos", glyph: "◎" },
    { id: "areas", label: "Áreas", glyph: "⌂" },
    ...(currentUser?.role === "admin" ? [{ id: "configuracoes" as View, label: "Configurações", glyph: "⚙" }] : []),
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
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>McDonald&apos;s Imperial</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => setView(item.id)}>
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
                  <span className="department-initials">{item.short}</span>
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
                    {item.id === "qualidade" && <button className={view === "custos" ? "department-subtab active" : "department-subtab"} onClick={() => setView("custos")}>
                      ◫ <span>Custo, Comida, Papel &amp; OPS</span>
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
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="date-line">Sexta-feira · 31 de julho · {departmentLabel}</p>
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
                <div><span className="eyebrow">Plano de trabalho</span><h2>{view === "resumo" ? "Tarefas prioritárias" : "Lista de tarefas"}</h2></div>
                <div className="segmented" aria-label="Filtrar tarefas">
                  {(["pendentes", "concluidas", "todas"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item === "concluidas" ? "Concluídas" : item[0].toUpperCase() + item.slice(1)}</button>)}
                </div>
              </div>
              <div className="task-list">
                {(view === "resumo" ? visibleTasks.slice(0, 5) : visibleTasks).map((task) => (
                  <article className={task.done ? "task-row done" : "task-row"} key={task.id}>
                    <button className="check" disabled={!canEdit} aria-label={`${task.done ? "Reabrir" : "Concluir"} ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done ? "✓" : ""}</button>
                    <div className="task-main"><strong>{task.title}</strong><span>{task.area}</span></div>
                    <span className={`priority ${task.priority.toLowerCase().replace("é", "e")}`}>{task.priority}</span>
                    <span className="due">{task.due}</span>
                    <span className="task-owner" title={task.assigneeName ?? task.assignee}><span className="avatar small">{task.assignee}</span>{task.assigneeName && <span>{task.assigneeName.split(" ")[0]}</span>}</span>
                    <button className="row-more" aria-label={`Mais opções para ${task.title}`}>•••</button>
                  </article>
                ))}
                {visibleTasks.length === 0 && <div className="empty-state">Sem tarefas nesta categoria.</div>}
              </div>
              {view === "resumo" && <button className="text-button" onClick={() => setView("tarefas")}>Ver todas as tarefas <span>→</span></button>}
            </section>
          )}

          {view === "tarefas" && (
            <section className={canEdit ? "board-page" : "board-page read-only"} aria-label="Gestão de tarefas">
              {department === "qualidade" && <div className="board-source-strip">
                <div><span className="source-mark">QP</span><span><strong>Workflow tarefas · Qualidade &amp; Produtos</strong><small>15 tarefas importadas com responsável, periodicidade e dia programado.</small></span></div>
                <a href={qualityTasksSourceUrl} target="_blank" rel="noreferrer">Abrir folha fonte ↗</a>
              </div>}
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
                <p className="inventory-note">Fonte: relatórios “Desvio de inventário” do restaurante Imperial. Selecione Comida, Papel ou OPS nos cartões acima; OPS agrega Produtos de Limpeza e Material de Escritório. Todos os produtos ativos e inativos estão incluídos.</p>
              </div>
            </section>
          )}

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
                <p className="inventory-note">Fonte: “Tempos de Serviço por Hora e GT - Imperial”. Dados publicados em 2 de agosto de 2026; esta página é uma fotografia dos dados e não uma ligação em tempo real. O objetivo de julho e agosto é manter o R2P abaixo de 230s; nos restantes meses mantém-se a referência de 180s.</p>
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
                <p className="inventory-note">Fonte: relatórios mensais e relatório YTD Tell The Arches do restaurante Imperial, disponíveis na pasta partilhada. O YTD cobre 1 de janeiro a 31 de julho de 2026; fotografia consultada em 2 de agosto de 2026.</p>
              </div>
            </section>
          )}

          {view === "configuracoes" && (
            <section className="settings-section" aria-labelledby="settings-title">
              <div className="settings-heading">
                <div><span className="eyebrow">Administração do portal</span><h2 id="settings-title">Configurações</h2><p>Gestão dos utilizadores, níveis de acesso e fontes partilhadas.</p></div>
                {!editingFolderCounts ? <button className="settings-update-button" onClick={beginFolderUpdate}>↻ Atualizar quantidades</button> : <div className="settings-edit-actions"><button onClick={() => setEditingFolderCounts(false)}>Cancelar</button><button className="save" onClick={saveFolderCounts}>Guardar alterações</button></div>}
              </div>
              <div className="settings-card users-settings-card requests-card">
                <div className="settings-card-title"><div><span className="eyebrow">Aprovação do administrador</span><h3>Pedidos de acesso</h3></div><span className={managedUsers.some((user) => user.status === "pendente") ? "pending-count has-pending" : "pending-count"}>{managedUsers.filter((user) => user.status === "pendente").length} pendentes</span></div>
                <div className="users-table" role="table" aria-label="Pedidos de acesso pendentes">
                  <div className="user-row request-row user-header" role="row"><span>Utilizador</span><span>Data do pedido</span><span>Nível a atribuir</span><span>Validação</span></div>
                  {managedUsers.filter((user) => user.status === "pendente").map((user) => <div className="user-row request-row" role="row" key={user.id}>
                    <div className="user-identity"><span className="avatar small">{userInitials(user.name, user.login)}</span><span className="user-identity-copy"><strong>{user.name || "Sem nome"}</strong><small>{user.login}</small></span></div>
                    <span>{new Date(user.createdAt).toLocaleDateString("pt-PT")}</span>
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
                  <div className="user-row user-header" role="row"><span>Utilizador</span><span>Registo</span><span>Estado</span><span>Nível de acesso</span><span>Ação</span></div>
                  {managedUsers.filter((user) => user.status !== "pendente").map((user) => <div className="user-row" role="row" key={user.id}>
                    <div className="user-identity"><span className="avatar small">{userInitials(user.name, user.login)}</span><span className="user-identity-copy"><strong>{user.name || "Sem nome"}</strong><small>{user.login}</small></span>{user.id === currentUser.id && <small>Você</small>}</div>
                    <span>{new Date(user.createdAt).toLocaleDateString("pt-PT")}</span>
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
            <section className="restaurant-objectives" aria-labelledby="restaurant-objectives-title">
              <div className="restaurant-objectives-heading">
                <div><span className="eyebrow">{selectedObjectiveMonth.label}</span><h2 id="restaurant-objectives-title">Objetivos mensais</h2><p>Leitura rápida das metas, resultados e pontuação.</p></div>
                <div className="objective-toolbar">
                  <label><span>Mês</span><select value={objectiveMonth} onChange={(event) => setObjectiveMonth(event.target.value)} aria-label="Filtrar objetivos por mês">{objectiveMonthOptions.map((month) => <option value={month.value} key={month.value}>{month.label}</option>)}</select></label>
                  <button type="button" className="objective-export" onClick={exportObjectives} disabled={!selectedObjectives.length}><span>⇩</span> Exportar PDF</button>
                </div>
              </div>
              <div className="objectives-kpi-grid" aria-label="Resumo dos objetivos">
                <article className="objective-kpi objective-kpi-month"><span>◎</span><div><small>Percentagem mensal</small><strong>{objectiveStats.monthlyPercent}%</strong><p>{objectiveStats.achievedPoints} de {objectiveStats.possiblePoints} pontos</p></div></article>
                <article className="objective-kpi objective-kpi-superado"><span>★</span><div><small>Superados</small><div className="objective-kpi-value"><strong>{objectiveStats.superados.count}</strong><b>{objectiveStats.superados.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-atingido"><span>✓</span><div><small>Atingidos</small><div className="objective-kpi-value"><strong>{objectiveStats.atingidos.count}</strong><b>{objectiveStats.atingidos.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-proximo"><span>↗</span><div><small>Próximos</small><div className="objective-kpi-value"><strong>{objectiveStats.proximos.count}</strong><b>{objectiveStats.proximos.percent}%</b></div><p>do total de objetivos</p></div></article>
                <article className="objective-kpi objective-kpi-nao"><span>!</span><div><small>Não atingidos</small><div className="objective-kpi-value"><strong>{objectiveStats.naoAtingidos.count}</strong><b>{objectiveStats.naoAtingidos.percent}%</b></div><p>do total de objetivos</p></div></article>
              </div>
              <div className="objective-topic-grid" aria-label="Objetivos agrupados por tema">
                {!selectedObjectives.length && <div className="objective-empty"><span>◷</span><div><strong>Sem objetivos importados</strong><p>Ainda não existem dados para {selectedObjectiveMonth.label}. Selecione outro mês.</p></div></div>}
                {objectivePointGroups.map((group) => <section className="objective-score-row" key={group.points ?? "sem-pontos"}>
                  <div className="objective-score-heading"><span>{group.points === undefined ? "Sem pontuação definida" : `${group.points} pontos possíveis`}</span><small>{group.objectives.length} {group.objectives.length === 1 ? "objetivo" : "objetivos"}</small></div>
                  <div className="objective-score-cards">{group.objectives.map((item) => { const result = getObjectiveResult(item); const visual = objectiveVisuals[item.theme] ?? { icon: "◎", label: item.theme, tone: "mint" }; return <article className={`objective-topic-card result-${statusClass(result)}`} key={item.theme}>
                  <div className="objective-topic-head"><span className={`objective-topic-image visual-${visual.tone}`} role="img" aria-label={visual.label}>{visual.icon}</span><div><h3>{item.theme}</h3></div><span className={`objective-classification-badge result-${statusClass(result)}`}>{result}</span></div>
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

          {(view === "resumo" || view === "areas") && (
            <section className="panel zones-panel">
              <div className="panel-heading"><div><span className="eyebrow">Estado atual · {departmentLabel}</span><h2>Áreas de limpeza</h2></div><span className="live-indicator"><i /> Atualizado agora</span></div>
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
        </div>
      </section>
    </main>
  );
}
