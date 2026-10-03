"use client";

import { useState } from "react";

interface TaskCompleteModalProps {
  taskId: number;
  taskName: string;
  area: string;
  responseType: string;
  requiresPhoto: number;
  allowNa: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function TaskCompleteModal({
  taskId,
  taskName,
  area,
  responseType,
  requiresPhoto,
  allowNa,
  onClose,
  onComplete,
}: TaskCompleteModalProps) {
  const [status, setStatus] = useState<"completed" | "non_conformance" | "na">("completed");
  const [value1, setValue1] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          value1: value1 || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      onComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900">{taskName}</h3>
          <p className="text-sm text-slate-600 mt-1">{area}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === "completed"}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">✅ Conforme</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="non_conformance"
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">⚠️ Não Conforme</span>
              </label>

              {allowNa === 1 && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="na"
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">— Não Aplicável</span>
                </label>
              )}
            </div>
          </div>

          {/* Response Field */}
          {status === "completed" && responseType !== "yes_no" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Valor/Resposta
              </label>
              <input
                type={responseType === "numeric" ? "number" : "text"}
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                placeholder={
                  responseType === "numeric" ? "Digite o valor numérico" : "Digite a resposta"
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Adicione observações se necessário..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
