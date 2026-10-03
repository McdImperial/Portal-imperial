"use client";

import { useEffect, useState } from "react";

interface Area {
  id: number;
  name: string;
  color: string;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("/api/admin/areas");
        const data = await response.json();
        setAreas(data.areas || []);
      } catch (err) {
        console.error("Erro ao carregar áreas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Áreas</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div key={area.id} className="bg-white rounded-lg shadow p-6">
              <div
                className="w-8 h-8 rounded mb-3"
                style={{ backgroundColor: area.color || "#cbd5e1" }}
              ></div>
              <h3 className="text-lg font-semibold text-slate-900">{area.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
