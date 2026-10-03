"use client";

import { useEffect, useState, useRef } from "react";

interface Checkpoint {
  id: number;
  qslPointId: number;
  status: string;
  scannedAt?: string;
  photoUrl?: string;
  notes?: string;
  issues?: string;
  pointCode?: string;
  pointName?: string;
  areaName?: string;
  areaColor?: string;
}

interface RoundDetail {
  id: number;
  roundNumber: number;
  scheduledTime: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  checkpoints: Checkpoint[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface QSLRoundModalProps {
  round: any;
  shiftId: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function QSLRoundModal({ round, shiftId, onClose, onComplete }: QSLRoundModalProps) {
  const [roundDetail, setRoundDetail] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [checkpointNotes, setCheckpointNotes] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchRoundDetail();
  }, [round.id]);

  const fetchRoundDetail = async () => {
    try {
      const response = await fetch(`/api/qsl/rounds/${round.id}`);
      if (!response.ok) throw new Error("Erro ao carregar detalhes da volta");
      const data = await response.json();
      setRoundDetail(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar detalhes da volta");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async () => {
    try {
      const response = await fetch(`/api/qsl/rounds/${round.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "em_curso" }),
      });
      if (!response.ok) throw new Error("Erro ao iniciar volta");
      await fetchRoundDetail();
    } catch (err) {
      setError("Erro ao iniciar volta");
    }
  };

  const handleCompleteRound = async () => {
    try {
      const response = await fetch(`/api/qsl/rounds/${round.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "concluida" }),
      });
      if (!response.ok) throw new Error("Erro ao completar volta");
      await fetchRoundDetail();
      onComplete();
    } catch (err) {
      setError("Erro ao completar volta");
    }
  };

  const handleScanCheckpoint = async () => {
    if (!selectedCheckpoint || !qrCode) return;

    try {
      const response = await fetch(`/api/qsl/checkpoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: round.id,
          qslPointId: selectedCheckpoint.qslPointId,
          qrCodeData: qrCode,
          notes: checkpointNotes || null,
        }),
      });

      if (!response.ok) throw new Error("Erro ao registar checkpoint");
      setQrCode("");
      setCheckpointNotes("");
      setShowCamera(false);
      setSelectedCheckpoint(null);
      await fetchRoundDetail();
    } catch (err) {
      setError("Erro ao registar checkpoint");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!roundDetail) return null;

  const statusColors = {
    pending: "bg-gray-100 text-gray-800",
    em_curso: "bg-blue-100 text-blue-800",
    concluida: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Volta {roundDetail.roundNumber}</h3>
              <p className="text-sm text-slate-600">
                {new Date(roundDetail.scheduledTime).toLocaleTimeString("pt-PT")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-slate-700">Progresso</span>
              <span className="text-lg font-bold text-slate-900">{roundDetail.progress.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${roundDetail.progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Status and Actions */}
          {roundDetail.status === "pending" && (
            <button
              onClick={handleStartRound}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Iniciar Volta
            </button>
          )}

          {roundDetail.status === "em_curso" && (
            <button
              onClick={handleCompleteRound}
              disabled={roundDetail.progress.percentage < 100}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-slate-400"
            >
              {roundDetail.progress.percentage === 100
                ? "Completar Volta"
                : `Completar Volta (${roundDetail.progress.completed}/${roundDetail.progress.total})`}
            </button>
          )}

          {roundDetail.status === "concluida" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium">✓ Volta concluída</p>
            </div>
          )}

          {/* Checkpoints */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Pontos de Controlo</h4>
            {roundDetail.checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                onClick={() => {
                  if (roundDetail.status === "em_curso") setSelectedCheckpoint(checkpoint);
                }}
                className={`border rounded-lg p-4 ${
                  checkpoint.status === "completed"
                    ? statusColors.completed
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{checkpoint.pointName}</p>
                    <p className="text-sm text-slate-600">{checkpoint.areaName}</p>
                  </div>
                  <span className="text-xl">
                    {checkpoint.status === "completed" ? "✓" : "○"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkpoint Scanning Modal */}
        {selectedCheckpoint && (
          <div className="border-t border-slate-200 p-6 space-y-4 bg-slate-50">
            <h4 className="font-medium text-slate-900">Registar Ponto: {selectedCheckpoint.pointName}</h4>

            {!showCamera ? (
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Código QR ou ID do ponto"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            ) : (
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                autoPlay
                playsInline
              />
            )}

            <textarea
              value={checkpointNotes}
              onChange={(e) => setCheckpointNotes(e.target.value)}
              placeholder="Observações (opcional)"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCheckpoint(null)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleScanCheckpoint}
                disabled={!qrCode}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
