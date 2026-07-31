"use client";

import { useMemo, useState } from "react";

type View = "resumo" | "tarefas" | "objetivos" | "areas";

type Task = {
  id: number;
  title: string;
  area: string;
  due: string;
  assignee: string;
  priority: "Alta" | "Média" | "Baixa";
  done: boolean;
};

const initialTasks: Task[] = [
  { id: 1, title: "Limpeza profunda da cozinha", area: "Cozinha", due: "Hoje, 11:00", assignee: "ML", priority: "Alta", done: false },
  { id: 2, title: "Repor consumíveis nos WC", area: "Casas de banho", due: "Hoje, 14:30", assignee: "AR", priority: "Média", done: false },
  { id: 3, title: "Verificar material de limpeza", area: "Armazém", due: "Amanhã", assignee: "JS", priority: "Baixa", done: false },
  { id: 4, title: "Higienizar zona de refeições", area: "Sala comum", due: "Concluída às 09:10", assignee: "CM", priority: "Média", done: true },
  { id: 5, title: "Limpar vidros da entrada", area: "Entrada", due: "Concluída ontem", assignee: "AR", priority: "Baixa", done: true },
];

const objectives = [
  { label: "Tarefas concluídas", value: 78, target: "Meta: 90%", tone: "mint" },
  { label: "Inspeções sem falhas", value: 92, target: "Meta: 95%", tone: "blue" },
  { label: "Consumo de produtos", value: 64, target: "Meta: abaixo de 75%", tone: "amber" },
];

const zones = [
  { name: "Cozinha", status: "Atenção", detail: "1 tarefa em atraso", percent: 68, tone: "attention" },
  { name: "Casas de banho", status: "Em curso", detail: "Próxima verificação 14:30", percent: 80, tone: "progress" },
  { name: "Sala comum", status: "Em dia", detail: "Verificada às 09:10", percent: 100, tone: "good" },
  { name: "Entrada e receção", status: "Em dia", detail: "Verificada ontem", percent: 100, tone: "good" },
];

const viewLabels: Record<View, string> = {
  resumo: "Visão geral",
  tarefas: "Todas as tarefas",
  objetivos: "Objetivos mensais",
  areas: "Áreas de limpeza",
};

export default function Home() {
  const [view, setView] = useState<View>("resumo");
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"pendentes" | "concluidas" | "todas">("pendentes");
  const [notice, setNotice] = useState("");

  const pending = tasks.filter((task) => !task.done).length;
  const completed = tasks.length - pending;
  const completion = Math.round((completed / tasks.length) * 100);

  const visibleTasks = useMemo(() => {
    if (filter === "pendentes") return tasks.filter((task) => !task.done);
    if (filter === "concluidas") return tasks.filter((task) => task.done);
    return tasks;
  }, [filter, tasks]);

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
    }, ...current]);
    setFilter("pendentes");
    setView("tarefas");
    setNotice("Nova tarefa adicionada à lista.");
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
          {(view === "resumo" || view === "tarefas") && (
            <section className="summary-grid" aria-label="Indicadores principais">
              <article className="metric-card feature">
                <div><span className="eyebrow">Progresso do mês</span><strong className="big-number">{completion}%</strong><p><span className="up">↗ 8%</span> face ao mês passado</p></div>
                <div className="ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span>{completed}/{tasks.length}</span></div>
              </article>
              <article className="metric-card"><span className="metric-icon mint">✓</span><div><span className="eyebrow">Concluídas</span><strong>{completed}</strong><p>tarefas este mês</p></div></article>
              <article className="metric-card"><span className="metric-icon coral">!</span><div><span className="eyebrow">Pendentes</span><strong>{pending}</strong><p>2 precisam de atenção</p></div></article>
              <article className="metric-card"><span className="metric-icon blue">⌂</span><div><span className="eyebrow">Áreas em dia</span><strong>4/6</strong><p>67% das áreas</p></div></article>
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
                {objectives.map((objective) => (
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
              <div className="panel-heading"><div><span className="eyebrow">Estado atual</span><h2>Áreas de limpeza</h2></div><span className="live-indicator"><i /> Atualizado agora</span></div>
              <div className="zones-grid">
                {zones.map((zone) => (
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
