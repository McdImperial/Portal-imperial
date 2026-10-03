"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShiftType {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    shiftTypeId: "",
    areaId: "",
    orderIndex: "",
    scheduledTime: "",
    deadlineTime: "",
    criticality: "normal",
    responseType: "yes_no",
    photoRequired: false,
    qrCodeRequired: false,
    allowNa: true,
    enabled: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftsRes, areasRes] = await Promise.all([
          fetch("/api/admin/shift-types"),
          fetch("/api/admin/areas"),
        ]);

        if (!shiftsRes.ok || !areasRes.ok) throw new Error("Erro ao carregar dados");

        const shifts = await shiftsRes.json();
        const areas = await areasRes.json();

        setShiftTypes(shifts.shiftTypes || []);
        setAreas(areas.areas || []);
      } catch (err) {
        setError("Erro ao carregar dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          shiftTypeId: parseInt(form.shiftTypeId, 10),
          areaId: parseInt(form.areaId, 10),
          orderIndex: form.orderIndex ? parseInt(form.orderIndex, 10) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push("/admin/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Nova Tarefa</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Turno *
              </label>
              <select
                value={form.shiftTypeId}
                onChange={(e) => setForm({ ...form, shiftTypeId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {shiftTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Área *
              </label>
              <select
                value={form.areaId}
                onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ordem
              </label>
              <input
                type="number"
                value={form.orderIndex}
                onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora Prevista
              </label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora Limite
              </label>
              <input
                type="time"
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Criticidade
              </label>
              <select
                value={form.criticality}
                onChange={(e) => setForm({ ...form, criticality: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Resposta
              </label>
              <select
                value={form.responseType}
                onChange={(e) => setForm({ ...form, responseType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="yes_no">Sim/Não</option>
                <option value="numeric">Numérico</option>
                <option value="text">Texto</option>
                <option value="multiple">Múltipla Escolha</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.photoRequired}
                onChange={(e) => setForm({ ...form, photoRequired: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Fotografia Obrigatória</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.qrCodeRequired}
                onChange={(e) => setForm({ ...form, qrCodeRequired: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-slate-700">QR Code Obrigatório</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowNa}
                onChange={(e) => setForm({ ...form, allowNa: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Permite Marcar "Não Aplicável"</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Ativo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition"
            >
              {submitting ? "Criando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
