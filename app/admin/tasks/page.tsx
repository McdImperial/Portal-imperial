"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Task {
  id: number;
  name: string;
  area: string;
  shiftType: string;
  scheduledTime?: string;
  criticality: string;
  enabled: number;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/tasks");
        if (!response.ok) throw new Error("Erro ao carregar tarefas");
        const data = await response.json();
        setTasks(data.tasks);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar tarefas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const criticityColors = {
    critical: "text-red-600 bg-red-50",
    high: "text-amber-600 bg-amber-50",
    normal: "text-blue-600 bg-blue-50",
    low: "text-green-600 bg-green-50",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Tarefas</h2>
        <Link
          href="/admin/tasks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nova Tarefa
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando tarefas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Nome</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Turno</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Área</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Hora</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Criticidade</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">{task.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{task.shiftType}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{task.area}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{task.scheduledTime || "—"}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          criticityColors[task.criticality as keyof typeof criticityColors] ||
                          "text-slate-600 bg-slate-50"
                        }`}
                      >
                        {task.criticality}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.enabled ? "text-green-600 bg-green-50" : "text-slate-600 bg-slate-50"
                        }`}
                      >
                        {task.enabled ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
