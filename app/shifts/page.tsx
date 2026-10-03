"use client";

import { useEffect, useState } from "react";
import ShiftDashboard from "./ShiftDashboard";

interface ShiftData {
  id: number;
  status: string;
  shiftTypeId: number;
  startedAt: string;
  shiftDate: string;
}

export default function ShiftsPage() {
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShift = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/shifts");
        const data = await response.json();
        setShift(data.shift);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar turno");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Iniciar Turno</h2>
          <p className="text-slate-600 mb-6">Nenhum turno ativo para hoje. Escolha o tipo de turno para começar.</p>
          <StartShiftForm />
        </div>
      </div>
    );
  }

  return <ShiftDashboard shiftId={shift.id} />;
}

function StartShiftForm() {
  const [shiftTypeId, setShiftTypeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!shiftTypeId) {
      setError("Selecione um tipo de turno");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftTypeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao iniciar turno");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tipo de Turno
        </label>
        <select
          value={shiftTypeId || ""}
          onChange={(e) => setShiftTypeId(parseInt(e.target.value, 10) || null)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione um turno...</option>
          <option value="1">🌅 Abertura (06:00-12:00)</option>
          <option value="2">🔄 Transição (12:00-17:00)</option>
          <option value="3">🌙 Fecho (22:00-23:30)</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleStart}
        disabled={loading || !shiftTypeId}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition"
      >
        {loading ? "Iniciando..." : "Iniciar Turno"}
      </button>
    </div>
  );
}
