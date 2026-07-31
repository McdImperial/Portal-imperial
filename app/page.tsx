"use client";

import { useMemo, useState } from "react";

type View = "resumo" | "tarefas" | "objetivos" | "areas";
type Department = "global" | "qualidade" | "pessoas" | "cliente" | "manutencao" | "segit";

type Task = {
  id: number;
  title: string;
  area: string;
  due: string;
  assignee: string;
  priority: "Alta" | "Média" | "Baixa";
  done: boolean;
  department: Exclude<Department, "global">;
};

const initialTasks: Task[] = [
  { id: 1, title: "Validar novas fichas de produto", area: "Produtos", due: "Hoje, 11:00", assignee: "ML", priority: "Alta", done: false, department: "qualidade" },
  { id: 2, title: "Fechar auditoria de higiene", area: "Qualidade", due: "Concluída às 09:10", assignee: "AR", priority: "Média", done: true, department: "qualidade" },
  { id: 3, title: "Confirmar plano de formação", area: "Desenvolvimento", due: "Hoje, 14:30", assignee: "CM", priority: "Média", done: false, department: "pessoas" },
  { id: 4, title: "Atualizar mapa de férias", area: "Planeamento", due: "Concluída ontem", assignee: "TS", priority: "Baixa", done: true, department: "pessoas" },
  { id: 5, title: "Responder a pedidos críticos", area: "Apoio ao cliente", due: "Hoje, 12:00", assignee: "JS", priority: "Alta", done: false, department: "cliente" },
  { id: 6, title: "Rever satisfação semanal", area: "Experiência", due: "Amanhã", assignee: "ML", priority: "Média", done: false, department: "cliente" },
  { id: 7, title: "Intervenção na câmara frigorífica", area: "Equipamentos", due: "Hoje, 16:00", assignee: "AR", priority: "Alta", done: false, department: "manutencao" },
  { id: 8, title: "Atualizar plano preventivo", area: "Prevenção", due: "Concluída ontem", assignee: "CM", priority: "Média", done: true, department: "manutencao" },
  { id: 9, title: "Rever acessos de novos colaboradores", area: "IT", due: "Hoje, 15:00", assignee: "TS", priority: "Alta", done: false, department: "segit" },
  { id: 10, title: "Teste mensal de emergência", area: "Segurança", due: "Concluída às 10:20", assignee: "JS", priority: "Média", done: true, department: "segit" },
];

const departments: { id: Department; label: string; short: string }[] = [
  { id: "global", label: "Visão global", short: "VG" },
  { id: "qualidade", label: "Qualidade & Produtos", short: "QP" },
  { id: "pessoas", label: "Pessoas", short: "PE" },
  { id: "cliente", label: "Serviço Cliente", short: "SC" },
  { id: "manutencao", label: "Manutenção", short: "MA" },
  { id: "segit", label: "Seg. & IT", short: "SI" },
];

const departmentProfiles = {
  global: {
    objectives: [{ label: "Execução transversal", value: 76, target: "Meta: 90%", tone: "mint" }, { label: "Objetivos no verde", value: 84, target: "Meta: 90%", tone: "blue" }, { label: "Planos sem desvios", value: 71, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Qualidade & Produtos", status: "Em curso", detail: "1 ação prioritária", percent: 82, tone: "progress" }, { name: "Pessoas", status: "Em dia", detail: "Objetivos atualizados", percent: 92, tone: "good" }, { name: "Serviço Cliente", status: "Atenção", detail: "2 pedidos críticos", percent: 68, tone: "attention" }, { name: "Manutenção · Seg. & IT", status: "Em curso", detail: "2 ações planeadas", percent: 78, tone: "progress" }],
  },
  qualidade: {
    objectives: [{ label: "Auditorias concluídas", value: 92, target: "Meta: 95%", tone: "mint" }, { label: "Fichas atualizadas", value: 78, target: "Meta: 90%", tone: "blue" }, { label: "Não conformidades fechadas", value: 66, target: "Meta: 85%", tone: "amber" }],
    zones: [{ name: "Qualidade", status: "Em dia", detail: "Auditoria fechada hoje", percent: 100, tone: "good" }, { name: "Produtos", status: "Em curso", detail: "3 fichas em validação", percent: 78, tone: "progress" }, { name: "Higiene & Segurança Alimentar", status: "Em dia", detail: "Sem desvios críticos", percent: 96, tone: "good" }, { name: "Documentação", status: "Atenção", detail: "1 revisão em atraso", percent: 64, tone: "attention" }],
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
} satisfies Record<Department, { objectives: { label: string; value: number; target: string; tone: string }[]; zones: { name: string; status: string; detail: string; percent: number; tone: string }[] }>;

const viewLabels: Record<View, string> = {
  resumo: "Visão geral",
  tarefas: "Todas as tarefas",
  objetivos: "Objetivos mensais",
  areas: "Áreas de acompanhamento",
};

export default function Home() {
  const [view, setView] = useState<View>("resumo");
  const [department, setDepartment] = useState<Department>("global");
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"pendentes" | "concluidas" | "todas">("pendentes");
  const [notice, setNotice] = useState("");

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

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function createTask() {
    const id = Math.max(...tasks.map((task) => task.id)) + 1;
    setTasks((current) => [{
      id,
      title: "Nova verificação de rotina",
      area: "Área geral",
      due: "Hoje, 17:00",
      assignee: "TS",
      priority: "Média",
      done: false,
      department: department === "global" ? "qualidade" : department,
    }, ...current]);
    setFilter("pendentes");
    setView("tarefas");
    setNotice(`Nova tarefa adicionada a ${departmentLabel}.`);
    window.setTimeout(() => setNotice(""), 2400);
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
          <span className="brand-mark">P</span>
          <span>Prumo</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => setView(item.id)}>
              <span className="nav-glyph">{item.glyph}</span>{item.label}
              {item.id === "tarefas" && <span className="nav-count">{pending}</span>}
            </button>
          ))}
        </nav>
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
            <p className="date-line">Sexta-feira · 31 de julho</p>
            <h1>{viewLabels[view]}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações"><span className="notification-dot" />♢</button>
            <button className="primary-button" onClick={createTask}><span>＋</span> Nova tarefa</button>
          </div>
        </header>

        {notice && <div className="toast" role="status">✓ {notice}</div>}

        <div className="content">
          <section className="department-switcher" aria-label="Selecionar departamento">
            <div className="department-context">
              <span className="eyebrow">Departamento ativo</span>
              <strong>{departmentLabel}</strong>
            </div>
            <div className="department-buttons">
              {departments.map((item) => (
                <button key={item.id} className={department === item.id ? "department-button selected" : "department-button"} onClick={() => setDepartment(item.id)} title={item.label}>
                  <span>{item.short}</span>{item.label}
                </button>
              ))}
            </div>
          </section>

          {(view === "resumo" || view === "tarefas") && (
            <section className="summary-grid" aria-label="Indicadores principais">
              <article className="metric-card feature">
                <div><span className="eyebrow">Progresso do mês</span><strong className="big-number">{completion}%</strong><p><span className="up">↗ 8%</span> face ao mês passado</p></div>
                <div className="ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span>{completed}/{scopedTasks.length}</span></div>
              </article>
              <article className="metric-card"><span className="metric-icon mint">✓</span><div><span className="eyebrow">Concluídas</span><strong>{completed}</strong><p>tarefas este mês</p></div></article>
              <article className="metric-card"><span className="metric-icon coral">!</span><div><span className="eyebrow">Pendentes</span><strong>{pending}</strong><p>2 precisam de atenção</p></div></article>
              <article className="metric-card"><span className="metric-icon blue">⌂</span><div><span className="eyebrow">Áreas acompanhadas</span><strong>{activeProfile.zones.filter((zone) => zone.percent >= 80).length}/{activeProfile.zones.length}</strong><p>com progresso ≥ 80%</p></div></article>
            </section>
          )}

          {(view === "resumo" || view === "tarefas") && (
            <section className="panel tasks-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">Plano de trabalho</span><h2>{view === "resumo" ? "Tarefas prioritárias" : "Lista de tarefas"}</h2></div>
                <div className="segmented" aria-label="Filtrar tarefas">
                  {(["pendentes", "concluidas", "todas"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item === "concluidas" ? "Concluídas" : item[0].toUpperCase() + item.slice(1)}</button>)}
                </div>
              </div>
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <article className={task.done ? "task-row done" : "task-row"} key={task.id}>
                    <button className="check" aria-label={`${task.done ? "Reabrir" : "Concluir"} ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done ? "✓" : ""}</button>
                    <div className="task-main"><strong>{task.title}</strong><span>{task.area}</span></div>
                    <span className={`priority ${task.priority.toLowerCase().replace("é", "e")}`}>{task.priority}</span>
                    <span className="due">{task.due}</span>
                    <span className="avatar small">{task.assignee}</span>
                    <button className="row-more" aria-label={`Mais opções para ${task.title}`}>•••</button>
                  </article>
                ))}
                {visibleTasks.length === 0 && <div className="empty-state">Sem tarefas nesta categoria.</div>}
              </div>
              {view === "resumo" && <button className="text-button" onClick={() => setView("tarefas")}>Ver todas as tarefas <span>→</span></button>}
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
                    <strong className="objective-value">{objective.value}%</strong>
                    <div className="progress-track"><span className={objective.tone} style={{ width: `${objective.value}%` }} /></div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(view === "resumo" || view === "areas") && (
            <section className="panel zones-panel">
              <div className="panel-heading"><div><span className="eyebrow">Estado atual · {departmentLabel}</span><h2>Áreas de acompanhamento</h2></div><span className="live-indicator"><i /> Atualizado agora</span></div>
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
