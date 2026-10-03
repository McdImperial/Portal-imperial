"use client";

import { useEffect, useState } from "react";
import TaskCompleteModal from "./TaskCompleteModal";
import QSLRoundsPanel from "./QSLRoundsPanel";

interface ShiftDetail {
  id: number;
  shiftTypeId: number;
  shiftTypeName: string;
  shiftDate: string;
  startedAt: string;
  status: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  tasks: Array<{
    id: number;
    name: string;
    area: string;
    status: string;
    scheduledTime?: string;
    criticality: string;
    deadline_time?: string;
  }>;
}

interface ShiftDashboardProps {
  shiftId: number;
}

export default function ShiftDashboard({ shiftId }: ShiftDashboardProps) {
  const [shift, setShift] = useState<ShiftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "qsl">("tasks");

  useEffect(() => {
    const fetchShift = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shifts/${shiftId}`);
        if (!response.ok) throw new Error("Erro ao carregar turno");
        const data = await response.json();
        setShift(data);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar turno");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
    const interval = setInterval(fetchShift, 30000);
    return () => clearInterval(interval);
  }, [shiftId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const nextTask = shift.tasks.find((t) => t.status === "pending");
  const shiftColor = {
    "Abertura": "bg-green-50 border-green-200",
    "Transição": "bg-amber-50 border-amber-200",
    "Fecho": "bg-red-50 border-red-200",
  }[shift.shiftTypeName] || "bg-slate-50";

  const shiftColorBg = {
    "Abertura": "bg-green-100 text-green-800",
    "Transição": "bg-amber-100 text-amber-800",
    "Fecho": "bg-red-100 text-red-800",
  }[shift.shiftTypeName] || "bg-slate-100 text-slate-800";

  return (
    <div className="space-y-6">
      {/* Status do Turno */}
      <div className={`border rounded-lg p-6 ${shiftColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{shift.shiftTypeName}</h2>
            <p className="text-slate-600">
              Iniciado às {new Date(shift.startedAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={() => handleEndShift(shiftId)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Finalizar Turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progresso LV */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase mb-4">Progresso LV</h3>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-900">{shift.progress.percentage}%</div>
              <span className="text-slate-600 text-sm">
                {shift.progress.completed}/{shift.progress.total}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${shift.progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Próxima Tarefa */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase mb-4">Próxima Tarefa</h3>
          {nextTask ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900">{nextTask.name}</p>
              <p className="text-sm text-slate-600">{nextTask.area}</p>
              {nextTask.scheduledTime && (
                <p className="text-sm font-medium text-blue-600">{nextTask.scheduledTime}</p>
              )}
            </div>
          ) : (
            <p className="text-slate-600">Todas as tarefas concluídas!</p>
          )}
        </div>

        {/* Não Conformidades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase mb-4">NC Abertas</h3>
          <div className="text-3xl font-bold text-slate-900">0</div>
          <p className="text-sm text-slate-600 mt-2">Nenhuma não conformidade registada</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-4 px-6 font-medium text-center transition ${
              activeTab === "tasks"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tarefas ({shift.tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("qsl")}
            className={`flex-1 py-4 px-6 font-medium text-center transition ${
              activeTab === "qsl"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Voltas QSL
          </button>
        </div>

        <div className="p-6">
          {activeTab === "tasks" && (
            <div className="space-y-2">
              {shift.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  shiftId={shiftId}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}

          {activeTab === "qsl" && (
            <QSLRoundsPanel shiftId={shiftId} />
          )}
        </div>
      </div>

      {/* Modal de Completar Tarefa */}
      {selectedTask && (
        <TaskCompleteModal
          taskId={selectedTask.id}
          taskName={selectedTask.name}
          area={selectedTask.area}
          responseType={selectedTask.responseType}
          requiresPhoto={selectedTask.requiresPhoto}
          allowNa={selectedTask.allowNa}
          onClose={() => setSelectedTask(null)}
          onComplete={() => {
            setSelectedTask(null);
            // Refresh shift data
            fetch(`/api/shifts/${shiftId}`)
              .then(r => r.json())
              .then(data => setShift(data));
          }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, shiftId, onClick }: { task: any; shiftId: number; onClick?: () => void }) {
  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    non_conformance: "bg-red-100 text-red-800",
    na: "bg-slate-100 text-slate-800",
  };

  const statusLabels = {
    pending: "Pendente",
    completed: "Concluída",
    non_conformance: "Não Conforme",
    na: "N/A",
  };

  const criticalityColors = {
    critical: "🔴",
    high: "🟠",
    normal: "🟡",
    low: "🟢",
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span>{criticalityColors[task.criticality as keyof typeof criticalityColors] || "○"}</span>
          <div>
            <p className="font-medium text-slate-900">{task.name}</p>
            <p className="text-sm text-slate-600">{task.area}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {task.scheduledTime && (
          <span className="text-sm text-slate-600">{task.scheduledTime}</span>
        )}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[task.status as keyof typeof statusColors]
          }`}
        >
          {statusLabels[task.status as keyof typeof statusLabels]}
        </span>
      </div>
    </div>
  );
}

function handleEndShift(shiftId: number) {
  if (!confirm("Finalizar este turno? Esta ação não pode ser desfeita.")) return;

  fetch(`/api/shifts/${shiftId}/end`, { method: "POST" })
    .then(() => window.location.reload())
    .catch(() => alert("Erro ao finalizar turno"));
}
