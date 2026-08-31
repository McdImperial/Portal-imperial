import { env } from "cloudflare:workers";
let initialized = false;
export async function ensureFinanceExpensesSchema() {
  if (initialized) return;
  if (!env.DB) throw new Error("Database unavailable");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS finance_expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT NOT NULL, name TEXT NOT NULL, amount REAL NOT NULL, payment_type TEXT NOT NULL, entity TEXT, reference TEXT, due_date TEXT, status TEXT NOT NULL DEFAULT 'Pendente', bank TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_finance_expenses_month_due ON finance_expenses(month, due_date)"),
  ]);
  await env.DB.prepare("PRAGMA optimize").run(); initialized = true;
}
