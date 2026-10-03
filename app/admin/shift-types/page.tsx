"use client";

import { useEffect, useState } from "react";

interface ShiftType {
  id: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  color: string;
}

export default function ShiftTypesPage() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShiftTypes = async () => {
      try {
        const response = await fetch("/api/admin/shift-types");
        const data = await response.json();
        setShiftTypes(data.shiftTypes || []);
      } catch (err) {
        console.error("Erro ao carregar tipos de turno:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftTypes();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Tipos de Turno</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-lg shadow p-6">
              <div
                className="w-8 h-8 rounded mb-3"
                style={{ backgroundColor: type.color || "#cbd5e1" }}
              ></div>
              <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
              <p className="text-sm text-slate-600 mt-2">
                {type.startTime} — {type.endTime}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
