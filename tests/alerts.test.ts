import assert from "node:assert/strict";
import test from "node:test";
import { executionKey, nextScheduledAt } from "../lib/alerts/scheduler.ts";
import { renderAlertTemplate, templateVariables } from "../lib/alerts/template.ts";

test("renders supported variables and preserves unknown ones", () => {
  assert.equal(renderAlertTemplate("Olá {{ nome }}, {{alerta}} em {{data}}. {{outro}}", { nome: "Ana", alerta: "Inventário", data: "28/08/2026" }), "Olá Ana, Inventário em 28/08/2026. {{outro}}");
  assert.deepEqual(templateVariables("{{nome}} {{data}} {{nome}}"), ["nome", "data"]);
});

test("builds a stable idempotency key", () => {
  assert.equal(executionKey(12, 8, "2026-08-28T08:00:00.000Z"), "12:8:2026-08-28T08:00:00.000Z");
});

test("calculates the next daily execution", () => {
  assert.equal(nextScheduledAt({ frequency: "daily", timeOfDay: "09:30" }, new Date("2026-08-28T08:00:00.000Z")), "2026-08-28T09:30:00.000Z");
});
