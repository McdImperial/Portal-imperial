import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Painel de Administração</h1>
          <p className="text-sm text-slate-600 mt-1">Configure turnos, tarefas e áreas</p>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <a
              href="/admin/tasks"
              className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium"
            >
              Tarefas
            </a>
            <a
              href="/admin/shift-types"
              className="py-4 px-2 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            >
              Tipos de Turno
            </a>
            <a
              href="/admin/areas"
              className="py-4 px-2 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            >
              Áreas
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
