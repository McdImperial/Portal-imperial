"use client";

import { type FormEvent, useState } from "react";

export default function NatureWalkPage() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interested, setInterested] = useState<"sim" | "nao">("sim");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formElement = event.currentTarget;
    setSubmitting(true); setMessage(""); setSuccess(false);
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/caminhada-natureza", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), interested: interested === "sim", sharingItem: form.get("sharingItem") }) });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a inscrição.");
      formElement.reset(); setInterested("sim"); setSuccess(true); setMessage(data.message || "Inscrição registada com sucesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar a inscrição."); }
    finally { setSubmitting(false); }
  }

  return <main className="walk-shell">
    <section className="walk-card" aria-labelledby="walk-title">
      <header className="walk-brand"><span>M</span><div><strong>McDonald&apos;s Imperial</strong><small>Plano Motivacional</small></div></header>
      <div className="walk-heading"><span className="eyebrow">Ação de equipa</span><h1 id="walk-title">Caminhada pela Natureza</h1><div className="walk-event-details"><strong>15 de setembro</strong><span>08h30 — 16h00</span></div><p>Confirme o seu interesse e diga-nos se pretende levar algo para partilhar.</p></div>
      <form className="walk-form" onSubmit={submit}>
        <label>Nome completo<input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required placeholder="Escreva o seu nome" /></label>
        <fieldset><legend>Tem interesse em participar?</legend><label><input type="radio" name="interest" value="sim" checked={interested === "sim"} onChange={() => setInterested("sim")} /> Sim</label><label><input type="radio" name="interest" value="nao" checked={interested === "nao"} onChange={() => setInterested("nao")} /> Não</label></fieldset>
        <label>Vou levar algo para partilhar <small>Opcional</small><textarea name="sharingItem" rows={4} maxLength={300} placeholder="Indique o que pretende levar" /></label>
        {message && <p className={`walk-message ${success ? "success" : ""}`} role="status">{message}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "A enviar…" : "Enviar inscrição"}</button>
      </form>
    </section>
  </main>;
}
