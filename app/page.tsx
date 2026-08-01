"use client";

import { useEffect, useMemo, useState } from "react";

type View = "resumo" | "tarefas" | "objetivos" | "areas" | "custos";
type Department = "global" | "qualidade" | "pessoas" | "cliente" | "manutencao" | "segit";
type TaskStatus = "Por fazer" | "Em curso" | "Bloqueado" | "Concluído";

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
  { id: "global", label: "Visão global", short: "VG" },
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
  areas: "Áreas de acompanhamento",
  custos: "Custo, Comida e Papel",
};

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
  const [boardMode, setBoardMode] = useState<"tabela" | "kanban">("tabela");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
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
  }, []);

  const scopedTasks = tasks.filter((task) => department === "global" || task.department === department);
  const pending = scopedTasks.filter((task) => !task.done).length;
  const completed = scopedTasks.length - pending;
  const completion = scopedTasks.length ? Math.round((completed / scopedTasks.length) * 100) : 0;
  const activeProfile = departmentProfiles[department];
  const departmentLabel = departments.find((item) => item.id === department)?.label ?? "Visão global";

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

  async function updateTask(id: number, changes: Partial<Task>) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...changes, done: changes.status ? changes.status === "Concluído" : task.done } : task));
    try {
      await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) });
    } catch {
      setNotice("Alteração aplicada localmente; não foi possível guardar.");
    }
  }

  function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (task) updateTask(id, { status: task.done ? "Por fazer" : "Concluído", done: !task.done });
  }

  async function createTask(group: "semanais" | "mensais" = "semanais") {
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
    setTasks((current) => current.filter((task) => task.id !== id));
    try { await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch { setNotice("Tarefa removida apenas nesta sessão."); }
  }

  const navItems: { id: View; label: string; glyph: string }[] = [
    { id: "resumo", label: "Resumo", glyph: "▦" },
    { id: "tarefas", label: "Tarefas", glyph: "✓" },
    { id: "objetivos", label: "Objetivos", glyph: "◎" },
    { id: "areas", label: "Áreas", glyph: "⌂" },
  ];

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
                {item.id === "qualidade" && department === "qualidade" && (
                  <div className="department-subtabs" aria-label="Subsecções de Qualidade e Produtos">
                    <button className={view === "custos" ? "department-subtab active" : "department-subtab"} onClick={() => setView("custos")}>
                      ◫ <span>Custo, Comida e Papel</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="sidebar-card">
          <span className="eyebrow">Julho 2026</span>
          <strong>{completion}% concluído</strong>
          <div className="mini-track"><span style={{ width: `${completion}%` }} /></div>
          <small>Bom ritmo. Faltam {pending} tarefas.</small>
        </div>
        <button className="profile" aria-label="Abrir perfil">
          <span className="avatar">TS</span>
          <span><strong>Tiago Soutelo</strong><small>Administrador</small></span>
          <span className="more">•••</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="date-line">Sexta-feira · 31 de julho · {departmentLabel}</p>
            <h1>{department === "qualidade" && view === "areas" ? "Áreas Limpeza" : viewLabels[view]}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações"><span className="notification-dot" />♢</button>
            <button className="primary-button" onClick={() => createTask()}><span>＋</span> Nova tarefa</button>
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
                  <span className="shortcut-copy"><strong>Custo, Comida e Papel</strong><small>Acompanhar os três indicadores</small></span>
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
                    <button className="check" aria-label={`${task.done ? "Reabrir" : "Concluir"} ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done ? "✓" : ""}</button>
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
            <section className="board-page" aria-label="Gestão de tarefas">
              <div className="monday-toolbar">
                <label className="view-picker"><span>⌂</span><select value={boardMode} onChange={(event) => setBoardMode(event.target.value as "tabela" | "kanban")} aria-label="Escolher vista"><option value="tabela">Tabela principal</option><option value="kanban">Kanban</option></select></label>
                <span className="toolbar-divider" />
                <div className="new-item-split"><button onClick={() => createTask()}>Nova tarefa</button><button onClick={() => createTask("mensais")} aria-label="Adicionar tarefa mensal">⌄</button></div>
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
                          <span className="row-select"><input type="checkbox" checked={taskStatus === "Concluído"} onChange={(event) => updateTask(task.id, { status: event.target.checked ? "Concluído" : "Por fazer" })} aria-label={`Concluir ${task.title}`} /></span>
                          <label className="task-title-cell"><input className="task-title-input" defaultValue={task.title} onBlur={(event) => { const value = event.target.value.trim(); if (value && value !== task.title) updateTask(task.id, { title: value }); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} aria-label={`Nome da tarefa ${task.title}`} /><span title="Abrir atualizações">⊕</span></label>
                          <label className="owner-cell"><span className="avatar small">{task.assignee}</span><select value={task.assigneeName ?? ""} onChange={(event) => { const owner = ownerOptions.find((item) => item.name === event.target.value); if (owner) updateTask(task.id, { assignee: owner.initials, assigneeName: owner.name }); }} aria-label={`Responsável por ${task.title}`}><option value="">Sem responsável</option>{ownerOptions.map((owner) => <option value={owner.name} key={owner.name}>{owner.name}</option>)}</select></label>
                          <select className={`status-cell ${statusClass(taskStatus)}`} value={taskStatus} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })} aria-label={`Estado de ${task.title}`}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select>
                          <select className={`priority-cell ${statusClass(task.priority)}`} value={task.priority} onChange={(event) => updateTask(task.id, { priority: event.target.value as Task["priority"] })} aria-label={`Prioridade de ${task.title}`}><option>Alta</option><option>Média</option><option>Baixa</option></select>
                          <label className="timeline-cell"><input className="plain-cell" defaultValue={task.due} onBlur={(event) => { if (event.target.value !== task.due) updateTask(task.id, { due: event.target.value }); }} aria-label={`Periodicidade de ${task.title}`} /></label>
                          <input className="plain-cell" defaultValue={task.area} onBlur={(event) => { if (event.target.value !== task.area) updateTask(task.id, { area: event.target.value }); }} aria-label={`Área de ${task.title}`} />
                          <button className="delete-row" onClick={() => deleteTask(task.id)} aria-label={`Apagar ${task.title}`}>×</button>
                        </div>;
                      })}
                      <button className="add-board-row" onClick={() => createTask(group.id as "semanais" | "mensais")}>＋ Adicionar tarefa</button>
                      <div className="group-summary" aria-label={`Resumo de ${group.label}`}><span /><span /><span /><span className="summary-status"><i style={{ width: `${group.tasks.length ? group.tasks.filter((task) => (task.status ?? (task.done ? "Concluído" : "Por fazer")) === "Concluído").length / group.tasks.length * 100 : 0}%` }} /></span><span /><span className="summary-timeline">{group.tasks.length} tarefas</span><span /><span /></div>
                    </>}
                  </div>
                ))}
              </div>}

              {dataReady && boardMode === "kanban" && <div className="kanban-board">
                {statusOptions.map((status) => {
                  const statusTasks = boardTasks.filter((task) => (task.status ?? (task.done ? "Concluído" : "Por fazer")) === status);
                  return <section className={`kanban-column ${statusClass(status)}`} key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = Number(event.dataTransfer.getData("text/plain")); if (id) updateTask(id, { status }); }}>
                    <header><strong>{status}</strong><span>{statusTasks.length}</span></header>
                    <div className="kanban-cards">{statusTasks.map((task) => <article className="kanban-card" draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))} key={task.id}>
                      <span className={`kanban-priority ${statusClass(task.priority)}`}>{task.priority}</span>
                      <strong>{task.title}</strong><small>{task.area}</small>
                      <footer><span className="avatar small">{task.assignee}</span><span>{task.due}</span></footer>
                    </article>)}</div>
                    <button onClick={() => createTask(status === "Por fazer" ? "semanais" : "mensais")}>＋ Adicionar</button>
                  </section>;
                })}
              </div>}
            </section>
          )}

          {view === "custos" && department === "qualidade" && (
            <section className="cost-section" aria-labelledby="cost-section-title">
              <div className="cost-heading">
                <div><span className="eyebrow">Qualidade &amp; Produtos</span><h2 id="cost-section-title">Custo, Comida e Papel</h2></div>
                <p>Acompanhamento mensal dos indicadores principais de consumo e operação.</p>
              </div>
              <div className="cost-grid">
                <article className="cost-card cost-total">
                  <span className="cost-icon">€</span>
                  <div><span className="eyebrow">Custo</span><strong>Por registar</strong><p>Custo total do mês</p></div>
                </article>
                <article className="cost-card cost-food">
                  <span className="cost-icon">●</span>
                  <div><span className="eyebrow">Comida</span><strong>—</strong><p>Meta mensal por definir</p></div>
                </article>
                <article className="cost-card cost-paper">
                  <span className="cost-icon">▤</span>
                  <div><span className="eyebrow">Papel</span><strong>—</strong><p>Meta mensal por definir</p></div>
                </article>
              </div>
            </section>
          )}

          {(view === "resumo" || view === "objetivos") && (
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

          {(view === "resumo" || view === "areas") && (
            <section className="panel zones-panel">
              <div className="panel-heading"><div><span className="eyebrow">Estado atual · {departmentLabel}</span><h2>{department === "qualidade" ? "Áreas Limpeza" : "Áreas de acompanhamento"}</h2></div><span className="live-indicator"><i /> Atualizado agora</span></div>
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
