"use client";

import { useState, useMemo, useCallback } from "react";

type Section = "acessos-diarios" | "vendas" | "rh" | "projetos" | "operacoes" | "financeiro" | "arquitetura";
type UserRole = "Administrador" | "Gerente" | "Colaborador";

type MetricCard = { label: string; value: string; detail: string; tone: string; icon: string };
type SalesData = { id: number; date: string; store: string; revenue: number; target: number; status: "Acima" | "Dentro" | "Abaixo" };
type StaffMember = { id: number; name: string; role: string; department: string; status: "Ativo" | "Ausência" | "Férias"; startDate: string };
type Project = { id: number; name: string; owner: string; status: "Planeamento" | "Em curso" | "Concluído"; progress: number; deadline: string };
type Operation = { id: number; task: string; responsible: string; priority: "Alta" | "Média" | "Baixa"; status: "Pendente" | "Em progresso" | "Concluído"; dueDate: string };
type FinanceTransaction = { id: number; date: string; description: string; category: string; amount: number; type: "Receita" | "Despesa"; status: "Confirmado" | "Pendente" };

const sections = [
  { id: "acessos-diarios", label: "Acessos diários", icon: "◉" },
  { id: "vendas", label: "Vendas", icon: "↗" },
  { id: "rh", label: "RH & Pessoas", icon: "👥" },
  { id: "projetos", label: "Projetos", icon: "▢" },
  { id: "operacoes", label: "Operações", icon: "⚙" },
  { id: "financeiro", label: "Financeiro", icon: "€" },
  { id: "arquitetura", label: "Arquitetura", icon: "🏗" },
] as const;

const salesData: SalesData[] = [
  { id: 1, date: "2026-10-03", store: "Loja Central", revenue: 4850, target: 4500, status: "Acima" },
  { id: 2, date: "2026-10-03", store: "Loja Norte", revenue: 3920, target: 4000, status: "Dentro" },
  { id: 3, date: "2026-10-03", store: "Loja Sul", revenue: 3450, target: 3800, status: "Abaixo" },
  { id: 4, date: "2026-10-02", store: "Loja Central", revenue: 4620, target: 4500, status: "Acima" },
  { id: 5, date: "2026-10-02", store: "Loja Este", revenue: 3280, target: 3500, status: "Dentro" },
];

const staffMembers: StaffMember[] = [
  { id: 1, name: "Tiago Soutelo", role: "Gerente Loja", department: "Operações", status: "Ativo", startDate: "2020-01-15" },
  { id: 2, name: "Marlene Silva", role: "Assistente Loja", department: "Operações", status: "Ativo", startDate: "2021-06-01" },
  { id: 3, name: "João Santos", role: "Supervisor Qualidade", department: "Qualidade", status: "Ativo", startDate: "2019-03-20" },
  { id: 4, name: "Rita Oliveira", role: "Operadora Caixa", department: "Operações", status: "Férias", startDate: "2022-09-10" },
  { id: 5, name: "Carlos Mendes", role: "Técnico Manutenção", department: "Manutenção", status: "Ativo", startDate: "2021-11-05" },
];

const projects: Project[] = [
  { id: 1, name: "Renovação Loja Central", owner: "Tiago Soutelo", status: "Em curso", progress: 65, deadline: "2026-12-15" },
  { id: 2, name: "Programa Lealdade Cliente", owner: "Marlene Silva", status: "Planeamento", progress: 20, deadline: "2026-11-30" },
  { id: 3, name: "Implementação Sistema POS", owner: "João Santos", status: "Em curso", progress: 45, deadline: "2026-10-31" },
  { id: 4, name: "Treinamento Equipa", owner: "Rita Oliveira", status: "Concluído", progress: 100, deadline: "2026-09-20" },
];

const operations: Operation[] = [
  { id: 1, task: "Limpeza e desinfecção", responsible: "Marlene Silva", priority: "Alta", status: "Concluído", dueDate: "2026-10-03" },
  { id: 2, task: "Verificação de equipamentos", responsible: "Carlos Mendes", priority: "Alta", status: "Em progresso", dueDate: "2026-10-03" },
  { id: 3, task: "Reabastecimento de stock", responsible: "João Santos", priority: "Média", status: "Pendente", dueDate: "2026-10-04" },
  { id: 4, task: "Relatório de vendas diárias", responsible: "Tiago Soutelo", priority: "Média", status: "Pendente", dueDate: "2026-10-04" },
];

const financialData: FinanceTransaction[] = [
  { id: 1, date: "2026-10-03", description: "Venda diária - Loja Central", category: "Vendas", amount: 4850, type: "Receita", status: "Confirmado" },
  { id: 2, date: "2026-10-03", description: "Fornecedor de alimentos", category: "Fornecimentos", amount: -1200, type: "Despesa", status: "Confirmado" },
  { id: 3, date: "2026-10-03", description: "Pagamento funcionários", category: "RH", amount: -8500, type: "Despesa", status: "Pendente" },
  { id: 4, date: "2026-10-02", description: "Venda - Loja Norte", category: "Vendas", amount: 3920, type: "Receita", status: "Confirmado" },
  { id: 5, date: "2026-10-02", description: "Utilidades", category: "Operações", amount: -450, type: "Despesa", status: "Confirmado" },
];

export default function ManagementPortal() {
  const [currentSection, setCurrentSection] = useState<Section>("acessos-diarios");
  const [userRole] = useState<UserRole>("Administrador");
  const [userName] = useState("Tiago Soutelo");

  const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
  const activeStaff = staffMembers.filter(s => s.status === "Ativo").length;
  const activeProjects = projects.filter(p => p.status === "Em curso").length;
  const pendingOperations = operations.filter(o => o.status === "Pendente").length;
  const totalBalance = financialData.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">McD</span>
          <span><strong>Imperial</strong><small>Gestão</small></span>
        </div>

        <nav className="main-nav">
          <p className="side-label">Menu Principal</p>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-section ${currentSection === section.id ? "active" : ""}`}
              onClick={() => setCurrentSection(section.id as Section)}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="user-profile">
          <div className="avatar-small">{userName.charAt(0)}</div>
          <div>
            <p className="user-name">{userName}</p>
            <p className="user-role">{userRole}</p>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard Imperial</p>
            <h1>{sections.find(s => s.id === currentSection)?.label || "Gestão"}</h1>
            <p>Sábado, 3 de outubro · Visão global</p>
          </div>
          <div className="header-info">
            <span className="date-chip">{new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </header>

        {currentSection === "acessos-diarios" && <AcessosDiarios />}
        {currentSection === "vendas" && <VendasView salesData={salesData} totalRevenue={totalRevenue} />}
        {currentSection === "rh" && <RHView staffMembers={staffMembers} activeStaff={activeStaff} />}
        {currentSection === "projetos" && <ProjetosView projects={projects} activeProjects={activeProjects} />}
        {currentSection === "operacoes" && <OperacoesView operations={operations} pendingOperations={pendingOperations} />}
        {currentSection === "financeiro" && <FinanceiroView financialData={financialData} totalBalance={totalBalance} />}
        {currentSection === "arquitetura" && <ArquiteturaView />}

        <footer>
          <span>Plataforma Imperial · Gestão Corporativa</span>
          <span>Todos os dados atualizados em tempo real</span>
        </footer>
      </main>
    </div>
  );
}

function AcessosDiarios() {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Área comum da equipa</p>
          <h2>Acessos diários</h2>
          <p>Ferramentas operacionais disponíveis para toda a equipa Imperial.</p>
        </div>
      </div>

      <div className="quick-access-grid">
        <div className="access-card sage">
          <span className="access-icon">💰</span>
          <h3>Controlo Caixa</h3>
          <p>Registar e consultar a contagem do cofre.</p>
          <a href="#" className="access-link">Abrir →</a>
        </div>

        <div className="access-card rose">
          <span className="access-icon">📊</span>
          <h3>Registo de Vendas</h3>
          <p>Registar dados de vendas diárias, faturação e performance.</p>
          <a href="#" className="access-link">Abrir →</a>
        </div>

        <div className="access-card sky">
          <span className="access-icon">📝</span>
          <h3>Tarefas Diárias</h3>
          <p>Consultar e atualizar tarefas operacionais e checklist.</p>
          <a href="#" className="access-link">Abrir →</a>
        </div>

        <div className="access-card gold">
          <span className="access-icon">📋</span>
          <h3>Relatórios</h3>
          <p>Gerar e consultar relatórios de operações e performance.</p>
          <a href="#" className="access-link">Abrir →</a>
        </div>
      </div>

      <div className="info-box">
        <strong>ℹ</strong>
        <p>Novos acessos comuns serão acrescentados conforme novas ferramentas forem disponibilizadas pela equipa corporativa.</p>
      </div>
    </section>
  );
}

function VendasView({ salesData, totalRevenue }: { salesData: SalesData[]; totalRevenue: number }) {
  const avgRevenue = (totalRevenue / salesData.length).toFixed(0);
  const bestStore = salesData.reduce((prev, current) => prev.revenue > current.revenue ? prev : current);

  return (
    <section className="page-section">
      <div className="metrics-grid">
        <MetricCard tone="sage" label="Receita total" value={`€${totalRevenue.toFixed(0)}`} detail="Últimas 5 operações" icon="↗" />
        <MetricCard tone="rose" label="Média por loja" value={`€${avgRevenue}`} detail="Performance média" icon="◐" />
        <MetricCard tone="sky" label="Melhor desempenho" value={bestStore.store} detail={`€${bestStore.revenue.toFixed(0)}`} icon="⬆" />
        <MetricCard tone="gold" label="Performance" value={`${((totalRevenue / (salesData.length * 4000)) * 100).toFixed(0)}%`} detail="Face ao target" icon="◉" />
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Performance</p>
              <h2>Vendas por loja</h2>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Loja</th>
                  <th>Receita</th>
                  <th>Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id}>
                    <td><time>{formatDate(sale.date)}</time></td>
                    <td><strong>{sale.store}</strong></td>
                    <td className="amount">€{sale.revenue.toFixed(2)}</td>
                    <td className="amount">€{sale.target.toFixed(2)}</td>
                    <td><span className={`status-badge ${sale.status.toLowerCase().replace(" ", "-")}`}>{sale.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

function RHView({ staffMembers, activeStaff }: { staffMembers: StaffMember[]; activeStaff: number }) {
  const onLeave = staffMembers.filter(s => s.status !== "Ativo").length;

  return (
    <section className="page-section">
      <div className="metrics-grid">
        <MetricCard tone="sage" label="Equipa ativa" value={String(activeStaff)} detail={`Total: ${staffMembers.length}`} icon="✓" />
        <MetricCard tone="rose" label="Ausências" value={String(onLeave)} detail="Férias ou ausência" icon="—" />
        <MetricCard tone="sky" label="Departamentos" value="5" detail="Operações, RH, Qualidade..." icon="▢" />
        <MetricCard tone="gold" label="Tempo de empresa" value="2.5" detail="Anos de permanência média" icon="📅" />
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Recursos Humanos</p>
              <h2>Equipa collaboradores</h2>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Função</th>
                  <th>Departamento</th>
                  <th>Status</th>
                  <th>Desde</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((member) => (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role}</td>
                    <td>{member.department}</td>
                    <td><span className={`status-badge ${member.status.toLowerCase()}`}>{member.status}</span></td>
                    <td className="date">{formatDate(member.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

function ProjetosView({ projects, activeProjects }: { projects: Project[]; activeProjects: number }) {
  const completed = projects.filter(p => p.status === "Concluído").length;

  return (
    <section className="page-section">
      <div className="metrics-grid">
        <MetricCard tone="sage" label="Total de projetos" value={String(projects.length)} detail="Em diferentes etapas" icon="▢" />
        <MetricCard tone="rose" label="Em execução" value={String(activeProjects)} detail="Projetos ativos" icon="▶" />
        <MetricCard tone="sky" label="Concluídos" value={String(completed)} detail="Projetos finalizados" icon="✓" />
        <MetricCard tone="gold" label="Taxa conclusão" value={`${((completed / projects.length) * 100).toFixed(0)}%`} detail="Do total de projetos" icon="◉" />
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Gestão de Projetos</p>
              <h2>Projetos em curso</h2>
            </div>
          </div>
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div>
                    <strong>{project.name}</strong>
                    <small>{project.owner}</small>
                  </div>
                  <span className={`status-badge ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="project-footer">
                  <span className="progress-text">{project.progress}% concluído</span>
                  <span className="deadline">Entrega: {formatDate(project.deadline)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function OperacoesView({ operations, pendingOperations }: { operations: Operation[]; pendingOperations: number }) {
  const completed = operations.filter(o => o.status === "Concluído").length;

  return (
    <section className="page-section">
      <div className="metrics-grid">
        <MetricCard tone="sage" label="Tarefas totais" value={String(operations.length)} detail="Tarefas operacionais" icon="✓" />
        <MetricCard tone="rose" label="Pendentes" value={String(pendingOperations)} detail="Aguardam ação" icon="⏱" />
        <MetricCard tone="sky" label="Em progresso" value={String(operations.filter(o => o.status === "Em progresso").length)} detail="Tarefas ativas" icon="▶" />
        <MetricCard tone="gold" label="Prioridade alta" value={String(operations.filter(o => o.priority === "Alta").length)} detail="Tarefas críticas" icon="!" />
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Tarefas Operacionais</p>
              <h2>Checklist de operações</h2>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Responsável</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Data limite</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id}>
                    <td><strong>{op.task}</strong></td>
                    <td>{op.responsible}</td>
                    <td><span className={`priority-badge ${op.priority.toLowerCase()}`}>{op.priority}</span></td>
                    <td><span className={`status-badge ${op.status.toLowerCase().replace(" ", "-")}`}>{op.status}</span></td>
                    <td className="date">{formatDate(op.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

function FinanceiroView({ financialData, totalBalance }: { financialData: FinanceTransaction[]; totalBalance: number }) {
  const revenue = financialData.filter(f => f.type === "Receita").reduce((sum, f) => sum + f.amount, 0);
  const expenses = Math.abs(financialData.filter(f => f.type === "Despesa").reduce((sum, f) => sum + f.amount, 0));

  return (
    <section className="page-section">
      <div className="metrics-grid">
        <MetricCard tone="sage" label="Receita total" value={`€${revenue.toFixed(0)}`} detail="Movimentos de receita" icon="↗" />
        <MetricCard tone="rose" label="Despesas" value={`€${expenses.toFixed(0)}`} detail="Total despendido" icon="↙" />
        <MetricCard tone="sky" label="Saldo líquido" value={`€${totalBalance.toFixed(0)}`} detail="Receita menos despesas" icon="◐" />
        <MetricCard tone="gold" label="Margem" value={`${((revenue - expenses) / revenue * 100).toFixed(0)}%`} detail="Lucro operacional" icon="◉" />
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Movimentos Financeiros</p>
              <h2>Histórico de transações</h2>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Montante</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((trans) => (
                  <tr key={trans.id}>
                    <td className="date">{formatDate(trans.date)}</td>
                    <td><strong>{trans.description}</strong></td>
                    <td>{trans.category}</td>
                    <td><span className={`type-badge ${trans.type.toLowerCase()}`}>{trans.type}</span></td>
                    <td className={`amount ${trans.type === "Receita" ? "positive" : "negative"}`}>
                      {trans.type === "Receita" ? "+" : ""}€{Math.abs(trans.amount).toFixed(2)}
                    </td>
                    <td><span className={`status-badge ${trans.status.toLowerCase()}`}>{trans.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

function ArquiteturaView() {
  const stack = [
    { category: "Framework", items: ["Next.js 16.2.6", "React 19.2.6", "Vite 8.0.13"] },
    { category: "Styling", items: ["Tailwind CSS 4.2.1", "CSS Custom Properties"] },
    { category: "Database", items: ["Drizzle ORM 0.45.2", "SQLite", "Cloudflare D1"] },
    { category: "Deployment", items: ["Cloudflare Workers", "GitHub Pages", "Vinext 0.0.50"] },
  ];

  const folders = [
    { name: "app/", description: "Componentes React e páginas Next.js", items: ["ManagementPortal.tsx", "page.tsx", "layout.tsx", "globals.css", "api/"] },
    { name: "db/", description: "Schema Drizzle e helpers de database", items: ["schema.ts", "index.ts", "records.ts", "metrics.ts"] },
    { name: "worker/", description: "Entry point do Cloudflare Worker", items: ["index.ts"] },
    { name: "build/", description: "Configuração de build customizada", items: ["sites-vite-plugin.ts"] },
    { name: "public/", description: "Assets estáticos (imagens, SVGs)", items: ["favicon.svg", "og-portal.png"] },
    { name: "drizzle/", description: "Database migrations", items: ["0000_*.sql", "0001_*.sql", "meta/"] },
  ];

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Estrutura do Projeto</p>
          <h2>Dashboard de Arquitetura</h2>
          <p>Exploração completa da estrutura, stack tecnológico e componentes do repositório.</p>
        </div>
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Stack Tecnológico</p>
            <h3>Tecnologias Utilizadas</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", padding: "16px" }}>
            {stack.map((section) => (
              <div key={section.category} style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: "8px", backgroundColor: "var(--cream)" }}>
                <strong style={{ display: "block", marginBottom: "8px", color: "var(--teal)" }}>{section.category}</strong>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {section.items.map((item) => (
                    <li key={item} style={{ fontSize: "14px", padding: "4px 0", color: "var(--muted)" }}>
                      → {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Organização</p>
            <h3>Estrutura de Pastas</h3>
          </div>
          <div style={{ padding: "16px" }}>
            {folders.map((folder) => (
              <div key={folder.name} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>📁</span>
                  <strong style={{ fontFamily: "monospace", color: "var(--teal)" }}>{folder.name}</strong>
                </div>
                <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 8px 26px" }}>{folder.description}</p>
                <div style={{ margin: "0 0 0 26px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {folder.items.map((item) => (
                    <span key={item} style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "var(--cream)", borderRadius: "4px", fontFamily: "monospace", color: "var(--ink)" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Informação</p>
            <h3>Detalhes do Projeto</h3>
          </div>
          <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--cream)", borderRadius: "8px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Repositório</span>
              <strong style={{ display: "block", color: "var(--ink)" }}>Portal Imperial</strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Management Dashboard</span>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--cream)", borderRadius: "8px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Branch Atual</span>
              <strong style={{ display: "block", color: "var(--ink)" }}>claude/management-portal</strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Feature branch</span>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--cream)", borderRadius: "8px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Node.js</span>
              <strong style={{ display: "block", color: "var(--ink)" }}>22.13.0+</strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Versão mínima</span>
            </div>
            <div style={{ padding: "12px", backgroundColor: "var(--cream)", borderRadius: "8px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>Deployment</span>
              <strong style={{ display: "block", color: "var(--ink)" }}>GitHub Pages</strong>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Automático via Actions</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MetricCard({ tone, label, value, detail, icon }: { tone: string; label: string; value: string; detail: string; icon: string }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <p>{detail}</p>
    </article>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(date);
}
