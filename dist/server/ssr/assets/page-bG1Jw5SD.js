import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/candidatura/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function CandidaturaPage() {
	const [message, setMessage] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		setMessage("");
		try {
			const response = await fetch("/api/candidaturas", {
				method: "POST",
				body: new FormData(event.currentTarget)
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Não foi possível enviar a candidatura.");
			event.currentTarget.reset();
			setMessage(data.message || "Candidatura recebida com sucesso.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Não foi possível enviar a candidatura.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "application-shell",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "application-card",
			"aria-labelledby": "application-title",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "application-brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "M" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "McDonald's Imperial" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Gestão de talento" })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "application-heading",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Candidatura"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "application-title",
							children: "Junte-se à nossa equipa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Preencha os seus dados e envie o CV e a carta de apresentação em PDF." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "application-form",
					onSubmit: submit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Nome completo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "name",
							type: "text",
							autoComplete: "name",
							minLength: 2,
							maxLength: 100,
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "application-form-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "email",
								type: "email",
								autoComplete: "email",
								maxLength: 160,
								required: true
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Contacto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "contact",
								type: "tel",
								autoComplete: "tel",
								minLength: 6,
								maxLength: 30,
								required: true
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Data de admissão", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "admissionDate",
							type: "date",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
							"CV ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "PDF · máximo 8 MB" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "cv",
								type: "file",
								accept: "application/pdf,.pdf",
								required: true
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
							"Carta de apresentação ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "PDF · máximo 8 MB" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "coverLetter",
								type: "file",
								accept: "application/pdf,.pdf",
								required: true
							})
						] }),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: message === "Candidatura recebida com sucesso." ? "application-message success" : "application-message",
							role: "status",
							children: message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: submitting,
							children: submitting ? "A enviar…" : "Enviar candidatura"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { CandidaturaPage as default };
