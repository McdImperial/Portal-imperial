"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Profile = "Tiago Soutelo" | "Marlene Soutelo";
type Area = "Financeiro" | "Saúde";
type RecordKind = "weight" | "blood_pressure" | "activity" | "medical";
type HealthRecord = {
  id: number;
  profile: Profile;
  kind: RecordKind;
  recordedAt: string;
  value1: number | null;
  value2: number | null;
  unit: string | null;
  title: string | null;
  notes: string | null;
  duration: number | null;
};
type MetricGroup = "body" | "pressure" | "activity";
type HealthMetric = {
  id: number;
  profile: Profile;
  groupName: MetricGroup;
  metricKey: string;
  metricLabel: string;
  recordedAt: string;
  value: number;
  unit: string | null;
  sourceUrl: string | null;
  note: string | null;
};

type FinanceDocument = {
  category: string;
  provider: string;
  detail: string;
  value: string | null;
  date: string;
  icon: string;
  url: string;
  tone: string;
};

const profiles: { name: Profile; initials: string; tint: string }[] = [
  { name: "Tiago Soutelo", initials: "TS", tint: "blue" },
  { name: "Marlene Soutelo", initials: "MS", tint: "plum" },
];

const fallback: HealthRecord[] = [
  { id: 1, profile: "Tiago Soutelo", kind: "weight", recordedAt: "2026-08-03", value1: 78.4, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 2, profile: "Tiago Soutelo", kind: "weight", recordedAt: "2026-07-27", value1: 79.1, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 3, profile: "Tiago Soutelo", kind: "blood_pressure", recordedAt: "2026-08-03", value1: 122, value2: 78, unit: "mmHg", title: null, notes: "Medição ao acordar", duration: null },
  { id: 4, profile: "Tiago Soutelo", kind: "blood_pressure", recordedAt: "2026-07-30", value1: 126, value2: 81, unit: "mmHg", title: null, notes: null, duration: null },
  { id: 5, profile: "Tiago Soutelo", kind: "activity", recordedAt: "2026-08-02", value1: 6.2, value2: 8250, unit: "km", title: "Caminhada", notes: "Parque e zona ribeirinha", duration: 54 },
  { id: 6, profile: "Tiago Soutelo", kind: "activity", recordedAt: "2026-07-31", value1: 3.8, value2: 5100, unit: "km", title: "Caminhada", notes: null, duration: 37 },
  { id: 7, profile: "Tiago Soutelo", kind: "medical", recordedAt: "2026-07-21", value1: null, value2: null, unit: null, title: "Consulta de rotina", notes: "Rever análises na próxima consulta.", duration: null },
  { id: 8, profile: "Marlene Soutelo", kind: "weight", recordedAt: "2026-08-01", value1: 64.7, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 9, profile: "Marlene Soutelo", kind: "weight", recordedAt: "2026-07-24", value1: 65.2, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 10, profile: "Marlene Soutelo", kind: "blood_pressure", recordedAt: "2026-08-02", value1: 116, value2: 74, unit: "mmHg", title: null, notes: "Antes do pequeno-almoço", duration: null },
  { id: 11, profile: "Marlene Soutelo", kind: "activity", recordedAt: "2026-08-03", value1: 4.1, value2: 6200, unit: "km", title: "Caminhada", notes: null, duration: 42 },
  { id: 12, profile: "Marlene Soutelo", kind: "medical", recordedAt: "2026-07-18", value1: null, value2: null, unit: null, title: "Análises clínicas", notes: "Resultados arquivados.", duration: null },
];

const navItems = ["Visão geral", "Registos", "Atividade", "Evolução", "Exames", "Health Manager"] as const;

const financeDocuments: FinanceDocument[] = [
  { category: "Internet & TV", provider: "Vodafone", detail: "Fatura de 16 jun a 15 jul", value: "73,33 €", date: "18 jul 2026", icon: "◌", tone: "violet", url: "https://drive.google.com/file/d/1y0NT5TvkIE2Q0erzj5YxsrHdBwQrBabb/view?usp=drivesdk" },
  { category: "Água", provider: "Águas de Gaia", detail: "Período de faturação: 9 abr a 8 mai", value: "56,28 €", date: "8 mai 2026", icon: "≈", tone: "aqua", url: "https://drive.google.com/file/d/1yzdruDN_ady6ACSz_TXaxPWrHIkEySUZ/view?usp=drivesdk" },
  { category: "Mobilidade elétrica", provider: "EDP", detail: "Fatura de mobilidade elétrica", value: "118,15 €", date: "2 jun 2026", icon: "↯", tone: "gold", url: "https://drive.google.com/file/d/1OL8IZSqhu467T_QGO3-Ouqi3C1e5GVGL/view?usp=drivesdk" },
  { category: "Eletricidade", provider: "EDP", detail: "Período de faturação: 4 abr a 3 mai", value: "89,18 €", date: "6 mai 2026", icon: "◈", tone: "orange", url: "https://drive.google.com/file/d/1d6fpF66En1F_Jpy7x3X66VbQ6rzdmqn6/view?usp=drivesdk" },
];

function displayDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function lastOf(items: HealthRecord[], kind: RecordKind) {
  return items.filter((item) => item.kind === kind).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
}

export default function HealthPortal() {
  const [area, setArea] = useState<Area>("Saúde");
  const [profile, setProfile] = useState<Profile>("Tiago Soutelo");
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]>("Visão geral");
  const [records, setRecords] = useState<HealthRecord[]>(fallback);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<RecordKind | null>(null);
  const [saved, setSaved] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/records", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { records: HealthRecord[] };
        setRecords(data.records);
      }
      const metricsResponse = await fetch("/api/metrics", { cache: "no-store" });
      if (metricsResponse.ok) {
        const data = (await metricsResponse.json()) as { metrics: HealthMetric[] };
        setMetrics(data.metrics);
      }
    } catch {
      // The in-product preview uses realistic examples until cloud storage is available.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRecords(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const personRecords = useMemo(
    () => records.filter((item) => item.profile === profile).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [profile, records],
  );
  const weight = lastOf(personRecords, "weight");
  const previousWeight = personRecords.filter((r) => r.kind === "weight")[1];
  const bp = lastOf(personRecords, "blood_pressure");
  const activities = personRecords.filter((r) => r.kind === "activity");
  const activityMinutes = activities.reduce((sum, item) => sum + (item.duration ?? 0), 0);
  const activityDistance = activities.reduce((sum, item) => sum + (item.value1 ?? 0), 0);
  const steps = activities.reduce((sum, item) => sum + (item.value2 ?? 0), 0);
  const medical = personRecords.filter((r) => r.kind === "medical");
  const personMetrics = useMemo(
    () => metrics.filter((item) => item.profile === profile),
    [metrics, profile],
  );

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      profile,
      kind: modal,
      recordedAt: data.get("recordedAt"),
      value1: data.get("value1") || null,
      value2: data.get("value2") || null,
      unit: modal === "weight" ? "kg" : modal === "blood_pressure" ? "mmHg" : modal === "activity" ? "km" : null,
      title: data.get("title") || null,
      notes: data.get("notes") || null,
      duration: data.get("duration") || null,
    };
    try {
      const response = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) await loadRecords();
      else throw new Error();
    } catch {
      const optimistic: HealthRecord = {
        id: Date.now(), profile, kind: modal!, recordedAt: String(payload.recordedAt),
        value1: payload.value1 ? Number(payload.value1) : null, value2: payload.value2 ? Number(payload.value2) : null,
        unit: payload.unit, title: payload.title ? String(payload.title) : null, notes: payload.notes ? String(payload.notes) : null,
        duration: payload.duration ? Number(payload.duration) : null,
      };
      setRecords((current) => [optimistic, ...current]);
    }
    setModal(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  }

  const chartWeights = personRecords.filter((r) => r.kind === "weight").slice(0, 8).reverse();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">◇</span><span>Portal Soutelo</span></div>
        <p className="side-label">Áreas</p>
        <div className="area-list">
          <button className={`area-button ${area === "Financeiro" ? "selected" : ""}`} onClick={() => setArea("Financeiro")}>
            <span className="area-icon finance">€</span><span><strong>Financeiro</strong><small>Em preparação</small></span>
          </button>
          <button className={`area-button ${area === "Saúde" ? "selected" : ""}`} onClick={() => setArea("Saúde")}>
            <span className="area-icon health">♡</span><span><strong>Saúde</strong><small>Registos e evolução</small></span>
          </button>
        </div>
        {area === "Saúde" && <div className="health-navigation">
          <p className="side-label profile-label">Perfis</p>
          <div className="profile-list">
            {profiles.map((item) => (
              <button key={item.name} className={`profile-button ${profile === item.name ? "selected" : ""}`} onClick={() => setProfile(item.name)}>
                <span className={`avatar ${item.tint}`}>{item.initials}</span><span>{item.name}</span>
              </button>
            ))}
          </div>
          <nav aria-label="Navegação da área de saúde">
            {navItems.map((item) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}><span className="nav-dot" />{item}</button>)}
          </nav>
        </div>}
        <div className="privacy-note"><span>Espaço privado</span><small>Apenas as pessoas autorizadas podem aceder a este portal.</small></div>
      </aside>

      <main>
        {area === "Financeiro" ? <FinanceDashboard /> : <>
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeNav}</p>
            <h1>Boa noite, {profile.split(" ")[0]}</h1>
            <p>Acompanhe o seu bem-estar, com tudo no mesmo lugar.</p>
          </div>
          <div className="header-actions">
            <button className="date-chip">Todo o histórico <span>⌄</span></button>
            <button className="primary" onClick={() => setModal("weight")}><span>＋</span> Novo registo</button>
          </div>
        </header>

        {activeNav === "Visão geral" && <>
          <section className="metrics-grid" aria-label="Resumo de saúde">
            <MetricCard tone="sage" label="Peso atual" value={weight ? `${weight.value1} kg` : "—"} detail={previousWeight && weight ? `${(Number(weight.value1) - Number(previousWeight.value1)).toFixed(1)} kg desde ${displayDate(previousWeight.recordedAt)}` : "Adicione uma medição"} icon="↘" />
            <MetricCard tone="rose" label="Tensão arterial" value={bp ? `${bp.value1} / ${bp.value2}` : "—"} detail={bp ? `Última medição · ${displayDate(bp.recordedAt)}` : "Adicione uma medição"} icon="♡" unit="mmHg" />
            <MetricCard tone="sky" label="Atividade" value={activityMinutes ? `${activityMinutes} min` : `${activityDistance.toFixed(1)} km`} detail={`${activities.length} dias ou sessões registados`} icon="⌁" />
            <MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(steps)} detail="No histórico importado" icon="↑" />
          </section>

          <section className="content-grid">
            <article className="panel chart-panel">
              <div className="panel-heading"><div><p className="eyebrow">Tendência</p><h2>Evolução do peso</h2></div><button onClick={() => setActiveNav("Evolução")}>Ver detalhe</button></div>
              <WeightChart records={chartWeights} />
            </article>
            <article className="panel bp-panel">
              <div className="panel-heading"><div><p className="eyebrow">Medições</p><h2>Tensão arterial</h2></div><button onClick={() => setModal("blood_pressure")}>＋ Registar</button></div>
              <div className="bp-list">
                {personRecords.filter((r) => r.kind === "blood_pressure").slice(0, 3).map((item, index) => (
                  <div className="bp-row" key={item.id}><span className={`status-dot ${index === 0 ? "good" : ""}`} /><div><strong>{item.value1} / {item.value2}</strong><small>mmHg</small></div><span>{displayDate(item.recordedAt)}</span></div>
                ))}
              </div>
              <div className="soft-message">Resumo descritivo dos registos. A interpretação clínica deve ser feita por um profissional de saúde.</div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel recent-panel">
              <div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2>Registos recentes</h2></div><button onClick={() => setActiveNav("Registos")}>Ver todos</button></div>
              {personRecords.slice(0, 4).map((item) => <RecordRow key={item.id} item={item} />)}
            </article>
            <article className="panel quick-panel">
              <p className="eyebrow">Acesso rápido</p><h2>O que quer registar?</h2>
              <div className="quick-grid">
                <button onClick={() => setModal("weight")}><span>⚖</span>Peso</button>
                <button onClick={() => setModal("blood_pressure")}><span>♡</span>Tensão</button>
                <button onClick={() => setModal("activity")}><span>⌁</span>Atividade</button>
                <button onClick={() => setModal("medical")}><span>＋</span>Saúde</button>
              </div>
            </article>
          </section>
        </>}

        {activeNav === "Registos" && <RecordsView records={personRecords} onAdd={() => setModal("medical")} />}
        {activeNav === "Atividade" && <ActivityView records={activities} onAdd={() => setModal("activity")} />}
        {activeNav === "Evolução" && <TrendsView records={personRecords} chartWeights={chartWeights} />}
        {activeNav === "Exames" && <ExamsView records={medical} profile={profile} />}
        {activeNav === "Health Manager" && <HealthManagerView metrics={personMetrics} profile={profile} />}
        </>}

        <footer><span>Portal Soutelo · Espaço familiar privado</span><span>{area === "Saúde" ? "Os registos organizam informação e não substituem aconselhamento médico." : "Área financeira reservada para desenvolvimento futuro."}</span></footer>
      </main>

      {loading && <div className="loading-pill">A atualizar os seus dados…</div>}
      {saved && <div className="toast">Registo guardado com sucesso</div>}
      {modal && <RecordModal kind={modal} profile={profile} onClose={() => setModal(null)} onSubmit={submitRecord} />}
    </div>
  );
}

function FinanceDashboard() {
  return <section className="finance-page">
    <header className="topbar finance-header"><div><p className="eyebrow">Financeiro</p><h1>Finanças da família</h1><p>Documentos bancários e despesas recorrentes organizados a partir da pasta financeira partilhada.</p></div><a className="source-button" href="https://drive.google.com/drive/folders/1Bhtz_GJ5_bQfyqd0wGyqHkHwCV6Sk44x" target="_blank" rel="noreferrer">Abrir pasta financeira <span>↗</span></a></header>
    <section className="finance-metrics" aria-label="Resumo financeiro do último extrato disponível">
      <article className="finance-metric balance"><span>Saldo à ordem</span><strong>5 578,03 €</strong><small>Millennium BCP · extrato de julho de 2026</small></article>
      <article className="finance-metric lending"><span>Empréstimos</span><strong>4 847,01 €</strong><small>Saldo devedor indicado no extrato</small></article>
      <article className="finance-metric card"><span>Cartão de crédito</span><strong>2 692,54 €</strong><small>Saldo em dívida no último extrato</small></article>
      <article className="finance-metric docs"><span>Documentos organizados</span><strong>44</strong><small>28 despesas e 16 extratos disponíveis</small></article>
    </section>
    <section className="finance-layout">
      <article className="panel finance-commitments"><div className="panel-heading"><div><p className="eyebrow">Despesas recorrentes</p><h2>Últimos documentos</h2></div><span className="subtle-tag">Valores por documento</span></div><div className="finance-doc-list">{financeDocuments.map((document) => <a className="finance-doc" key={document.category} href={document.url} target="_blank" rel="noreferrer"><span className={`finance-doc-icon ${document.tone}`}>{document.icon}</span><span className="finance-doc-info"><strong>{document.category}</strong><small>{document.provider} · {document.detail}</small></span><span className="finance-doc-amount"><strong>{document.value}</strong><small>{document.date} <b>↗</b></small></span></a>)}</div><p className="finance-caption">Os valores representam o último documento confirmado em cada categoria e não são somados, pois os períodos de faturação são diferentes.</p></article>
      <article className="panel finance-accounts"><div className="panel-heading"><div><p className="eyebrow">Instituições</p><h2>Contas e extratos</h2></div></div><div className="bank-list"><a href="https://drive.google.com/drive/folders/16c24b2PraLZCBLiePfqYHbMPM2zGRzj9" target="_blank" rel="noreferrer"><span className="bank-mark bcp">M</span><span><strong>Millennium BCP</strong><small>8 extratos de conta e 8 de cartão</small></span><b>↗</b></a><div className="bank-empty"><span className="bank-mark nb">N</span><span><strong>Novo Banco</strong><small>Ainda sem documentos na pasta</small></span></div><div className="bank-empty"><span className="bank-mark bpi">B</span><span><strong>BPI</strong><small>Ainda sem documentos na pasta</small></span></div></div><div className="finance-note"><strong>Âmbito atual</strong><span>A informação apresentada é documental. Não são calculados saldos globais entre bancos nem classificações automáticas de movimentos.</span></div></article>
    </section>
    <section className="finance-folders"><div className="section-title"><div><p className="eyebrow">Arquivo financeiro</p><h2>Pastas acompanhadas</h2><p>Acesso direto aos documentos originais, mantendo a organização já existente.</p></div></div><div className="folder-grid"><FinanceFolder name="Gastos Gerais" detail="Água, eletricidade, mobilidade elétrica e Internet/TV" count="28 documentos" url="https://drive.google.com/drive/folders/1MiX4nsnwC9MBUYhy3_63AvCf49KYOhxI" icon="▤" /><FinanceFolder name="Bancos" detail="Millennium BCP, Novo Banco e BPI" count="16 documentos" url="https://drive.google.com/drive/folders/1Sbi7pi246h6M1qm23c2erU1haltD46D9" icon="⌂" /></div></section>
  </section>;
}

function FinanceFolder({ name, detail, count, url, icon }: { name: string; detail: string; count: string; url: string; icon: string }) {
  return <a className="finance-folder" href={url} target="_blank" rel="noreferrer"><span className="folder-icon">{icon}</span><span><strong>{name}</strong><small>{detail}</small></span><em>{count}</em><b>↗</b></a>;
}

function MetricCard({ tone, label, value, detail, icon, unit }: { tone: string; label: string; value: string; detail: string; icon: string; unit?: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value} {unit && <small>{unit}</small>}</div><p>{detail}</p></article>;
}

function WeightChart({ records }: { records: HealthRecord[] }) {
  if (!records.length) return <div className="empty">Ainda não existem medições de peso.</div>;
  const values = records.map((r) => Number(r.value1));
  const min = Math.min(...values) - 0.6; const max = Math.max(...values) + 0.6;
  return <div className="chart"><div className="chart-area">{records.map((item) => { const height = 24 + ((Number(item.value1) - min) / Math.max(max - min, 1)) * 90; return <div className="bar-wrap" key={item.id}><div className="bar" style={{ height }}><span>{item.value1}</span></div><small>{displayDate(item.recordedAt)}</small></div>; })}</div><div className="chart-summary"><strong>{values[values.length - 1]} kg</strong><span>{values.length > 1 ? `${(values[values.length - 1] - values[0]).toFixed(1)} kg no período` : "Primeira medição"}</span></div></div>;
}

function RecordRow({ item }: { item: HealthRecord }) {
  const labels: Record<RecordKind, { icon: string; name: string }> = { weight: { icon: "⚖", name: "Peso" }, blood_pressure: { icon: "♡", name: "Tensão arterial" }, activity: { icon: "⌁", name: item.title || "Atividade" }, medical: { icon: "+", name: item.title || "Registo de saúde" } };
  const driveUrl = item.notes?.match(/https:\/\/drive\.google\.com\/\S+/)?.[0] ?? null;
  const note = driveUrl ? item.notes?.replace(driveUrl, "").trim() : item.notes;
  const detail = item.kind === "weight" ? `${item.value1} kg` : item.kind === "blood_pressure" ? `${item.value1} / ${item.value2} mmHg` : item.kind === "activity" ? (item.duration ? `${item.duration} min · ${item.value1 ?? 0} km` : `${item.value1 ?? 0} km · ${new Intl.NumberFormat("pt-PT").format(item.value2 ?? 0)} passos`) : note;
  return <div className="record-row"><span className={`record-icon ${item.kind}`}>{labels[item.kind].icon}</span><div><strong>{labels[item.kind].name}</strong><small>{detail}{driveUrl && <>{detail ? " · " : ""}<a href={driveUrl} target="_blank" rel="noreferrer">Abrir no Drive</a></>}</small></div><time>{displayDate(item.recordedAt)}</time></div>;
}

function RecordsView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const [filter, setFilter] = useState<"all" | RecordKind>("all");
  const filtered = filter === "all" ? records : records.filter((r) => r.kind === filter);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Histórico completo</p><h2>Todos os registos</h2><p>Consulte a informação organizada por data e categoria.</p></div><button className="primary" onClick={onAdd}>＋ Registo de saúde</button></div><div className="filters">{[["all","Todos"],["medical","Saúde"],["weight","Peso"],["blood_pressure","Tensão"],["activity","Atividade"]].map(([value,label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div><div className="records-table">{filtered.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function ActivityView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const totalDistance = records.reduce((s, r) => s + (r.value1 ?? 0), 0);
  const totalMinutes = records.reduce((s,r)=>s+(r.duration??0),0);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Movimento</p><h2>Atividade física</h2><p>Acompanhe dias ativos, distância, passos e sessões adicionadas.</p></div><button className="primary" onClick={onAdd}>＋ Nova atividade</button></div><div className="activity-summary"><MetricCard tone="sky" label={totalMinutes ? "Tempo total" : "Dias registados"} value={totalMinutes ? `${totalMinutes} min` : `${records.length}`} detail={totalMinutes ? `${records.length} sessões` : "Com dados de atividade"} icon="⌁"/><MetricCard tone="sage" label="Distância" value={`${totalDistance.toFixed(1)} km`} detail="No histórico importado" icon="↗"/><MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(records.reduce((s,r)=>s+(r.value2??0),0))} detail="Total registado" icon="↑"/></div><div className="records-table">{records.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function ExamsView({ records, profile }: { records: HealthRecord[]; profile: Profile }) {
  const documents = records.filter((item) => item.notes?.includes("drive.google.com"));
  const analyses = documents.filter((item) => item.title?.toLocaleLowerCase("pt-PT").includes("análises"));
  const exams = documents.filter((item) => !item.title?.toLocaleLowerCase("pt-PT").includes("análises"));
  return <section className="page-panel exams-page">
    <div className="section-title"><div><p className="eyebrow">Documentos clínicos</p><h2>Exames de {profile.split(" ")[0]}</h2><p>Exames, relatórios e análises guardados na pasta pessoal do Google Drive.</p></div><span className="document-count">{documents.length} documentos</span></div>
    <div className="exam-summary"><div><span className="summary-icon">▤</span><p><strong>{exams.length}</strong><small>Exames e relatórios</small></p></div><div><span className="summary-icon lab">◇</span><p><strong>{analyses.length}</strong><small>Análises clínicas</small></p></div></div>
    {exams.length > 0 && <DocumentGroup title="Exames e relatórios" records={exams} />}
    {analyses.length > 0 && <DocumentGroup title="Análises clínicas" records={analyses} />}
    {!documents.length && <div className="empty">Ainda não existem exames associados a este perfil.</div>}
  </section>;
}

function DocumentGroup({ title, records }: { title: string; records: HealthRecord[] }) {
  return <section className="document-group"><div className="document-group-title"><h3>{title}</h3><span>{records.length}</span></div><div className="document-grid">{records.map((item) => <DocumentCard key={item.id} item={item} />)}</div></section>;
}

function DocumentCard({ item }: { item: HealthRecord }) {
  const driveUrl = item.notes?.match(/https:\/\/drive\.google\.com\/\S+/)?.[0] ?? null;
  const note = driveUrl ? item.notes?.replace(driveUrl, "").trim() : item.notes;
  const needsConfirmation = item.title?.includes("data a confirmar");
  return <article className="document-card"><div className="document-card-top"><span className="document-icon">PDF</span>{needsConfirmation && <span className="confirm-tag">A confirmar</span>}</div><h4>{item.title}</h4><time>{new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${item.recordedAt}T12:00:00`))}</time>{note && <p>{note}</p>}{driveUrl && <a href={driveUrl} target="_blank" rel="noreferrer">Abrir no Google Drive <span>↗</span></a>}</article>;
}

const metricGroupDetails: Record<MetricGroup, { title: string; description: string }> = {
  body: { title: "Composição corporal", description: "Peso, IMC e medições de composição disponíveis no relatório." },
  pressure: { title: "Tensão e pulsação", description: "Medições de tensão arterial, pulsação e pressão arterial média." },
  activity: { title: "Atividade", description: "Passos, distância, energia e área-alvo quando registada." },
};

function HealthManagerView({ metrics, profile }: { metrics: HealthMetric[]; profile: Profile }) {
  const sourceUrl = metrics.find((item) => item.sourceUrl)?.sourceUrl;
  const dates = metrics.map((item) => item.recordedAt.slice(0, 10)).sort();
  const distinctMetrics = new Set(metrics.map((item) => item.metricKey)).size;
  return <section className="page-panel health-manager-page">
    <div className="section-title"><div><p className="eyebrow">Relatório HealthManager Pro</p><h2>Evolução de {profile.split(" ")[0]}</h2><p>Todas as métricas disponíveis no ficheiro partilhado, organizadas por tema e por data.</p></div>{sourceUrl && <a className="source-button" href={sourceUrl} target="_blank" rel="noreferrer">Abrir relatório <span>↗</span></a>}</div>
    <div className="hm-overview">
      <div><strong>{distinctMetrics || "—"}</strong><span>Métricas acompanhadas</span></div>
      <div><strong>{metrics.length || "—"}</strong><span>Valores registados</span></div>
      <div><strong>{dates.length ? `${displayMetricDate(dates[0])} — ${displayMetricDate(dates[dates.length - 1])}` : "—"}</strong><span>Período disponível</span></div>
    </div>
    {(["body", "pressure", "activity"] as MetricGroup[]).map((group) => {
      const groupMetrics = metrics.filter((item) => item.groupName === group);
      const keys = [...new Set(groupMetrics.map((item) => item.metricKey))];
      return <section className="hm-section" key={group}>
        <div className="hm-section-heading"><div><h3>{metricGroupDetails[group].title}</h3><p>{metricGroupDetails[group].description}</p></div><span>{keys.length} {keys.length === 1 ? "métrica" : "métricas"}</span></div>
        {keys.length ? <div className="hm-chart-grid">{keys.map((key) => <MetricTrendCard key={key} records={groupMetrics.filter((item) => item.metricKey === key)} />)}</div> : <div className="hm-empty">O relatório deste perfil não contém registos de {group === "activity" ? "atividade" : metricGroupDetails[group].title.toLocaleLowerCase("pt-PT")}.</div>}
      </section>;
    })}
    <div className="hm-note"><strong>Leitura dos gráficos</strong><span>Cada gráfico usa uma escala focada na variação da própria métrica. Os valores e unidades seguem o relatório original; as lacunas não foram estimadas.</span></div>
  </section>;
}

function displayMetricDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function metricValue(value: number, unit: string | null) {
  const maximumDigits = Number.isInteger(value) ? 0 : 2;
  return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: maximumDigits }).format(value)}${unit ? ` ${unit}` : ""}`;
}

function MetricTrendCard({ records }: { records: HealthMetric[] }) {
  const ordered = [...records].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const values = ordered.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, Math.abs(max) * .02, 1);
  const latest = ordered[ordered.length - 1];
  const change = latest.value - ordered[0].value;
  const changeUnit = latest.unit ? ` ${latest.unit}` : "";
  return <article className="hm-chart-card">
    <div className="hm-card-heading"><div><h4>{latest.metricLabel}</h4><span>{latest.unit || "Índice"}</span></div><div className="hm-latest"><strong>{metricValue(latest.value, latest.unit)}</strong><small>{change === 0 ? "Sem alteração" : `${change > 0 ? "+" : ""}${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 2 }).format(change)}${changeUnit} no período`}</small></div></div>
    <div className="hm-bars" aria-label={`Evolução de ${latest.metricLabel}`}>
      {ordered.map((item) => {
        const height = 18 + ((item.value - min) / range) * 64;
        return <span className="hm-bar-slot" key={`${item.recordedAt}-${item.id}`} title={`${displayMetricDate(item.recordedAt)} · ${metricValue(item.value, item.unit)}`}><i style={{ height: `${height}%` }} /></span>;
      })}
    </div>
    <div className="hm-axis"><span>{displayMetricDate(ordered[0].recordedAt)}</span><span>{ordered.length} leituras</span><span>{displayMetricDate(latest.recordedAt)}</span></div>
    {ordered.length < 3 && <p className="limited-data">Apenas {ordered.length} leituras disponíveis; tendência ainda limitada.</p>}
  </article>;
}

function TrendsView({ records, chartWeights }: { records: HealthRecord[]; chartWeights: HealthRecord[] }) {
  const bpRecords = records.filter((r) => r.kind === "blood_pressure").slice(0, 6);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Análise pessoal</p><h2>Evolução e tendências</h2><p>Uma leitura simples dos seus registos ao longo do tempo.</p></div></div><div className="trend-grid"><article className="panel"><div className="panel-heading"><h2>Peso</h2><span className="subtle-tag">kg</span></div><WeightChart records={chartWeights}/></article><article className="panel"><div className="panel-heading"><h2>Tensão arterial</h2><span className="subtle-tag">mmHg</span></div><div className="bp-columns">{bpRecords.reverse().map((r)=><div key={r.id}><div className="bp-column sys" style={{height: Math.max(48,(r.value1??0)/1.6)}}/><div className="bp-column dia" style={{height: Math.max(36,(r.value2??0)/1.6)}}/><small>{displayDate(r.recordedAt)}</small></div>)}</div><div className="legend"><span><i className="sys"/>Sistólica</span><span><i className="dia"/>Diastólica</span></div></article></div><div className="insight-box"><strong>Uma boa rotina de medição torna as tendências mais úteis.</strong><span>Registe em condições semelhantes e leve o histórico a um profissional de saúde quando precisar de apoio na interpretação.</span></div></section>;
}

function RecordModal({ kind, profile, onClose, onSubmit }: { kind: RecordKind; profile: Profile; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const title = { weight: "Registar peso", blood_pressure: "Registar tensão arterial", activity: "Registar atividade", medical: "Registo de saúde" }[kind];
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><p className="eyebrow">{profile}</p><h2 id="modal-title">{title}</h2></div><button aria-label="Fechar" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><label>Data<input name="recordedAt" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></label>{kind === "weight" && <label>Peso (kg)<input name="value1" type="number" step="0.1" min="20" max="300" placeholder="78,4" required autoFocus/></label>}{kind === "blood_pressure" && <div className="field-pair"><label>Sistólica<input name="value1" type="number" min="60" max="260" placeholder="120" required autoFocus/></label><label>Diastólica<input name="value2" type="number" min="35" max="180" placeholder="80" required/></label></div>}{kind === "activity" && <><label>Tipo de atividade<input name="title" placeholder="Ex.: caminhada" required autoFocus/></label><div className="field-pair"><label>Duração (min)<input name="duration" type="number" min="1" placeholder="45" required/></label><label>Distância (km)<input name="value1" type="number" step="0.1" min="0" placeholder="4,5"/></label></div><label>Passos (opcional)<input name="value2" type="number" min="0" placeholder="6500"/></label></>}{kind === "medical" && <label>Título<input name="title" placeholder="Ex.: consulta de rotina" required autoFocus/></label>}<label>Notas (opcional)<textarea name="notes" rows={3} placeholder="Acrescente contexto que queira guardar…"/></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Guardar registo</button></div></form></div></div>;
}
