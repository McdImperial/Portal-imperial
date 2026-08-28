import type { TemplateVariables } from "./types";

const VARIABLE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function renderAlertTemplate(message: string, variables: TemplateVariables) {
  return message.replace(VARIABLE, (_match, key: string) => String(variables[key] ?? `{{${key}}}`));
}

export function templateVariables(message: string) {
  return [...message.matchAll(VARIABLE)].map((match) => match[1]).filter((value, index, all) => all.indexOf(value) === index);
}
