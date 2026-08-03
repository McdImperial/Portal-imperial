"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Profile = "Tiago Soutelo" | "Marlene Soutelo";
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

const navItems = ["Visão geral", "Registos", "Atividade", "Evolução"] as const;

function displayDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function lastOf(items: HealthRecord[], kind: RecordKind) {
  return items.filter((item) => item.kind === kind).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
}

export default function HealthPortal() {
  const [profile, setProfile] = useState<Profile>("Tiago Soutelo");
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]>("Visão geral");
  const [records, setRecords] = useState<HealthRecord[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<RecordKind | null>(null);
  const [saved, setSaved] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/records", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { records: HealthRecord[] };
        if (data.records.length) setRecords(data.records);
      }
    } catch {
      // The in-product preview uses realistic examples until cloud storage is available.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const personRecords = useMemo(
    () => records.filter((item) => item.profile === profile).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [profile, records],
  );
  const weight = lastOf(personRecords, "weight");
  const previousWeight = personRecords.filter((r) => r.kind === "weight")[1];
  const bp = lastOf(personRecords, "blood_pressure");
  const activities = personRecords.filter((r) => r.kind === "activity");
  const activityMinutes = activities.reduce((sum, item) => sum + (item.duration ?? 0), 0);
  const steps = activities.reduce((sum, item) => sum + (item.value2 ?? 0), 0);
  const medical = personRecords.filter((r) => r.kind === "medical");

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

  const currentProfile = profiles.find((item) => item.name === profile)!;
  const chartWeights = personRecords.filter((r) => r.kind === "weight").slice(0, 8).reverse();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">+</span><span>Vitae</span></div>
        <p className="side-label">Perfis</p>
        <div className="profile-list">
          {profiles.map((item) => (
            <button key={item.name} className={`profile-button ${profile === item.name ? "selected" : ""}`} onClick={() => setProfile(item.name)}>
              <span className={`avatar ${item.tint}`}>{item.initials}</span><span>{item.name}</span>
            </button>
          ))}
        </div>
        <nav aria-label="Navegação principal">
          {navItems.map((item) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}><span className="nav-dot" />{item}</button>)}
        </nav>
        <div className="privacy-note"><span>Dados privados</span><small>Apenas as pessoas autorizadas podem aceder a este portal.</small></div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeNav}</p>
            <h1>Boa noite, {profile.split(" ")[0]}</h1>
            <p>Acompanhe o seu bem-estar, com tudo no mesmo lugar.</p>
          </div>
          <div className="header-actions">
            <button className="date-chip">Últimos 30 dias <span>⌄</span></button>
            <button className="primary" onClick={() => setModal("weight")}><span>＋</span> Novo registo</button>
          </div>
        </header>

        {activeNav === "Visão geral" && <>
          <section className="metrics-grid" aria-label="Resumo de saúde">
            <MetricCard tone="sage" label="Peso atual" value={weight ? `${weight.value1} kg` : "—"} detail={previousWeight && weight ? `${(Number(weight.value1) - Number(previousWeight.value1)).toFixed(1)} kg desde ${displayDate(previousWeight.recordedAt)}` : "Adicione uma medição"} icon="↘" />
            <MetricCard tone="rose" label="Tensão arterial" value={bp ? `${bp.value1} / ${bp.value2}` : "—"} detail={bp ? `Última medição · ${displayDate(bp.recordedAt)}` : "Adicione uma medição"} icon="♡" unit="mmHg" />
            <MetricCard tone="sky" label="Atividade" value={`${activityMinutes} min`} detail={`${activities.length} sessões registadas`} icon="⌁" />
            <MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(steps)} detail="No período selecionado" icon="↑" />
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
              <div className="soft-message">As medições recentes parecem consistentes. Continue a registar sempre nas mesmas condições.</div>
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

        <footer><span>Vitae · Portal familiar de saúde</span><span>Este portal ajuda a organizar registos e não substitui aconselhamento médico.</span></footer>
      </main>

      {loading && <div className="loading-pill">A atualizar os seus dados…</div>}
      {saved && <div className="toast">Registo guardado com sucesso</div>}
      {modal && <RecordModal kind={modal} profile={profile} onClose={() => setModal(null)} onSubmit={submitRecord} />}
    </div>
  );
}

function MetricCard({ tone, label, value, detail, icon, unit }: { tone: string; label: string; value: string; detail: string; icon: string; unit?: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value} {unit && <small>{unit}</small>}</div><p>{detail}</p></article>;
}

function WeightChart({ records }: { records: HealthRecord[] }) {
  if (!records.length) return <div className="empty">Ainda não existem medições de peso.</div>;
  const values = records.map((r) => Number(r.value1));
  const min = Math.min(...values) - 0.6; const max = Math.max(...values) + 0.6;
  return <div className="chart"><div className="chart-area">{records.map((item, i) => { const height = 24 + ((Number(item.value1) - min) / Math.max(max - min, 1)) * 90; return <div className="bar-wrap" key={item.id}><div className="bar" style={{ height }}><span>{item.value1}</span></div><small>{displayDate(item.recordedAt)}</small></div>; })}</div><div className="chart-summary"><strong>{values[values.length - 1]} kg</strong><span>{values.length > 1 ? `${(values[values.length - 1] - values[0]).toFixed(1)} kg no período` : "Primeira medição"}</span></div></div>;
}

function RecordRow({ item }: { item: HealthRecord }) {
  const labels: Record<RecordKind, { icon: string; name: string }> = { weight: { icon: "⚖", name: "Peso" }, blood_pressure: { icon: "♡", name: "Tensão arterial" }, activity: { icon: "⌁", name: item.title || "Atividade" }, medical: { icon: "+", name: item.title || "Registo de saúde" } };
  const detail = item.kind === "weight" ? `${item.value1} kg` : item.kind === "blood_pressure" ? `${item.value1} / ${item.value2} mmHg` : item.kind === "activity" ? `${item.duration} min · ${item.value1} km` : item.notes;
  return <div className="record-row"><span className={`record-icon ${item.kind}`}>{labels[item.kind].icon}</span><div><strong>{labels[item.kind].name}</strong><small>{detail}</small></div><time>{displayDate(item.recordedAt)}</time></div>;
}

function RecordsView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const [filter, setFilter] = useState<"all" | RecordKind>("all");
  const filtered = filter === "all" ? records : records.filter((r) => r.kind === filter);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Histórico completo</p><h2>Todos os registos</h2><p>Consulte a informação organizada por data e categoria.</p></div><button className="primary" onClick={onAdd}>＋ Registo de saúde</button></div><div className="filters">{[["all","Todos"],["medical","Saúde"],["weight","Peso"],["blood_pressure","Tensão"],["activity","Atividade"]].map(([value,label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div><div className="records-table">{filtered.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function ActivityView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const totalDistance = records.reduce((s, r) => s + (r.value1 ?? 0), 0);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Movimento</p><h2>Atividade física</h2><p>Acompanhe sessões, duração, distância e passos.</p></div><button className="primary" onClick={onAdd}>＋ Nova atividade</button></div><div className="activity-summary"><MetricCard tone="sky" label="Tempo total" value={`${records.reduce((s,r)=>s+(r.duration??0),0)} min`} detail={`${records.length} sessões`} icon="⌁"/><MetricCard tone="sage" label="Distância" value={`${totalDistance.toFixed(1)} km`} detail="No período selecionado" icon="↗"/><MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(records.reduce((s,r)=>s+(r.value2??0),0))} detail="Total registado" icon="↑"/></div><div className="records-table">{records.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function TrendsView({ records, chartWeights }: { records: HealthRecord[]; chartWeights: HealthRecord[] }) {
  const bpRecords = records.filter((r) => r.kind === "blood_pressure").slice(0, 6);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Análise pessoal</p><h2>Evolução e tendências</h2><p>Uma leitura simples dos seus registos ao longo do tempo.</p></div></div><div className="trend-grid"><article className="panel"><div className="panel-heading"><h2>Peso</h2><span className="subtle-tag">kg</span></div><WeightChart records={chartWeights}/></article><article className="panel"><div className="panel-heading"><h2>Tensão arterial</h2><span className="subtle-tag">mmHg</span></div><div className="bp-columns">{bpRecords.reverse().map((r)=><div key={r.id}><div className="bp-column sys" style={{height: Math.max(48,(r.value1??0)/1.6)}}/><div className="bp-column dia" style={{height: Math.max(36,(r.value2??0)/1.6)}}/><small>{displayDate(r.recordedAt)}</small></div>)}</div><div className="legend"><span><i className="sys"/>Sistólica</span><span><i className="dia"/>Diastólica</span></div></article></div><div className="insight-box"><strong>Uma boa rotina de medição torna as tendências mais úteis.</strong><span>Registe em condições semelhantes e leve o histórico a um profissional de saúde quando precisar de apoio na interpretação.</span></div></section>;
}

function RecordModal({ kind, profile, onClose, onSubmit }: { kind: RecordKind; profile: Profile; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const title = { weight: "Registar peso", blood_pressure: "Registar tensão arterial", activity: "Registar atividade", medical: "Registo de saúde" }[kind];
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><p className="eyebrow">{profile}</p><h2 id="modal-title">{title}</h2></div><button aria-label="Fechar" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><label>Data<input name="recordedAt" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></label>{kind === "weight" && <label>Peso (kg)<input name="value1" type="number" step="0.1" min="20" max="300" placeholder="78,4" required autoFocus/></label>}{kind === "blood_pressure" && <div className="field-pair"><label>Sistólica<input name="value1" type="number" min="60" max="260" placeholder="120" required autoFocus/></label><label>Diastólica<input name="value2" type="number" min="35" max="180" placeholder="80" required/></label></div>}{kind === "activity" && <><label>Tipo de atividade<input name="title" placeholder="Ex.: caminhada" required autoFocus/></label><div className="field-pair"><label>Duração (min)<input name="duration" type="number" min="1" placeholder="45" required/></label><label>Distância (km)<input name="value1" type="number" step="0.1" min="0" placeholder="4,5"/></label></div><label>Passos (opcional)<input name="value2" type="number" min="0" placeholder="6500"/></label></>}{kind === "medical" && <label>Título<input name="title" placeholder="Ex.: consulta de rotina" required autoFocus/></label>}<label>Notas (opcional)<textarea name="notes" rows={3} placeholder="Acrescente contexto que queira guardar…"/></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Guardar registo</button></div></form></div></div>;
}
