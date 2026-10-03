"use client";

import { useEffect, useState } from "react";
import QSLRoundModal from "./QSLRoundModal";

interface QSLRound {
  id: number;
  roundNumber: number;
  scheduledTime: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  checkpoints: any[];
  completedCheckpoints: number;
  totalCheckpoints: number;
}

interface QSLRoundsPanelProps {
  shiftId: number;
}

export default function QSLRoundsPanel({ shiftId }: QSLRoundsPanelProps) {
  const [rounds, setRounds] = useState<QSLRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<QSLRound | null>(null);

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 30000);
    return () => clearInterval(interval);
  }, [shiftId]);

  const fetchRounds = async () => {
    try {
      const response = await fetch(`/api/qsl/rounds?shiftId=${shiftId}`);
      if (!response.ok) throw new Error("Erro ao carregar voltas QSL");
      const data = await response.json();
      setRounds(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar voltas QSL");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-800 border-gray-300",
    em_curso: "bg-blue-100 text-blue-800 border-blue-300",
    concluida: "bg-green-100 text-green-800 border-green-300",
    atrasada: "bg-orange-100 text-orange-800 border-orange-300",
    nao_realizada: "bg-red-100 text-red-800 border-red-300",
  };

  const statusLabels = {
    pending: "Pendente",
    em_curso: "Em Curso",
    concluida: "Concluída",
    atrasada: "Atrasada",
    nao_realizada: "Não Realizada",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  const totalCompleted = rounds.filter((r) => r.status === "concluida").length;
  const totalPending = rounds.filter((r) => r.status === "pending" || r.status === "atrasada").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-slate-900">{rounds.length}</div>
          <p className="text-sm text-slate-600">Voltas Totais</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
          <p className="text-sm text-slate-600">Concluídas</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{totalPending}</div>
          <p className="text-sm text-slate-600">Pendentes</p>
        </div>
      </div>

      <div className="space-y-2">
        {rounds.map((round) => (
          <div
            key={round.id}
            onClick={() => setSelectedRound(round)}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition ${
              statusColors[round.status as keyof typeof statusColors]
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Volta {round.roundNumber}</p>
                <p className="text-sm">
                  {new Date(round.scheduledTime).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[round.status as keyof typeof statusColors]
                  }`}
                >
                  {statusLabels[round.status as keyof typeof statusLabels]}
                </span>
                <p className="text-sm text-slate-600 mt-2">
                  {round.completedCheckpoints}/{round.totalCheckpoints} pontos
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRound && (
        <QSLRoundModal
          round={selectedRound}
          shiftId={shiftId}
          onClose={() => setSelectedRound(null)}
          onComplete={() => {
            setSelectedRound(null);
            fetchRounds();
          }}
        />
      )}
    </div>
  );
}
