"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Manutencao() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const maintenanceColumns: DataTableColumn[] = [
    { key: "equipment", label: "Equipamento", width: "20%" },
    { key: "type", label: "Tipo Manutenção", width: "18%" },
    { key: "lastDate", label: "Última Manutenção", width: "18%" },
    { key: "nextDate", label: "Próxima Prevista", width: "18%" },
    { key: "status", label: "Status", width: "26%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Equipamentos",
      value: "18",
      color: "sky" as const,
      status: "above" as const,
      target: 15,
    },
    {
      id: 2,
      label: "Operacionais",
      value: "16/18",
      color: "sage" as const,
      status: "above" as const,
      target: 18,
    },
    {
      id: 3,
      label: "Manutenções Mês",
      value: "6",
      color: "gold" as const,
      status: "on_target" as const,
      target: 6,
    },
    {
      id: 4,
      label: "Planejadas",
      value: "4",
      color: "sky" as const,
      status: "on_target" as const,
      target: 4,
    },
  ];

  const mockMaintenance = [
    {
      equipment: "Forno Principal",
      type: "Preventiva",
      lastDate: "2026-09-15",
      nextDate: "2026-10-15",
      status: "✅ Operacional",
    },
    {
      equipment: "Frigorífico Câmara",
      type: "Preventiva",
      lastDate: "2026-08-20",
      nextDate: "2026-10-20",
      status: "✅ Operacional",
    },
    {
      equipment: "Máquina Lava-louça",
      type: "Corretiva",
      lastDate: "2026-09-25",
      nextDate: "2026-10-25",
      status: "⚠️ Monitorar",
    },
    {
      equipment: "Ar Condicionado",
      type: "Preventiva",
      lastDate: "2026-07-10",
      nextDate: "2026-10-10",
      status: "✅ Operacional",
    },
    {
      equipment: "Exaustor Cozinha",
      type: "Inspeção",
      lastDate: "2026-09-28",
      nextDate: "2026-10-28",
      status: "✅ Operacional",
    },
    {
      equipment: "Fogão Industrial",
      type: "Preventiva",
      lastDate: "2026-09-01",
      nextDate: "2026-11-01",
      status: "✅ Operacional",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "type",
      label: "Tipo Manutenção",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "preventive", label: "Preventiva" },
        { value: "corrective", label: "Corretiva" },
        { value: "inspection", label: "Inspeção" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "operational", label: "Operacional" },
        { value: "scheduled", label: "Agendado" },
        { value: "urgent", label: "Urgente" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Manutenção</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Manutenção de equipamentos: Preventiva, Corretiva, Agendamentos, Histórico
        </p>
      </div>

      <FilterBar
        filters={filterOptions}
        onFilterChange={setFilters}
        onRefresh={() => console.log("Refresh")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            status={metric.status}
            color={metric.color}
            target={metric.target}
          />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Histórico de Manutenção</h2>
        <DataTable columns={maintenanceColumns} rows={mockMaintenance} />
      </div>
    </div>
  );
}

export default Manutencao;
