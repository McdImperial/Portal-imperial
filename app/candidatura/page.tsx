"use client";

import { type FormEvent, useState } from "react";

export default function CandidaturaPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/candidaturas", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a candidatura.");
      event.currentTarget.reset();
      setMessage(data.message || "Candidatura recebida com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar a candidatura.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="application-shell">
    <section className="application-card" aria-labelledby="application-title">
      <div className="application-brand"><span>M</span><div><strong>McDonald&apos;s Imperial</strong><small>Gestão de talento</small></div></div>
      <div className="application-heading"><span className="eyebrow">Candidatura</span><h1 id="application-title">Junte-se à nossa equipa</h1><p>Preencha os seus dados e envie o CV e a carta de apresentação em PDF.</p></div>
      <form className="application-form" onSubmit={submit}>
        <label>Nome completo<input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <div className="application-form-row"><label>Email<input name="email" type="email" autoComplete="email" maxLength={160} required /></label><label>Contacto<input name="contact" type="tel" autoComplete="tel" minLength={6} maxLength={30} required /></label></div>
        <label>Data de admissão<input name="admissionDate" type="date" required /></label>
        <label>Cargo a que se candidata<input name="jobTitle" type="text" minLength={2} maxLength={100} required placeholder="ex.: Funcionário, Treinador ou Relações Públicas" /></label>
        <label>CV <small>PDF · máximo 8 MB</small><input name="cv" type="file" accept="application/pdf,.pdf" required /></label>
        <label>Carta de apresentação <small>PDF · máximo 8 MB</small><input name="coverLetter" type="file" accept="application/pdf,.pdf" required /></label>
        {message && <p className={message === "Candidatura recebida com sucesso." ? "application-message success" : "application-message"} role="status">{message}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "A enviar…" : "Enviar candidatura"}</button>
      </form>
    </section>
  </main>;
}
