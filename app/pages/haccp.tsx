"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Haccp() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const checkpointsColumns: DataTableColumn[] = [
    { key: "checkpoint", label: "Checkpoint", width: "25%" },
    { key: "parameter", label: "Parâmetro", width: "20%" },
    { key: "value", label: "Valor", width: "15%", align: "right" as const },
    { key: "limit", label: "Limite Crítico", width: "18%", align: "right" as const },
    { key: "status", label: "Status", width: "22%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Conformidade HACCP",
      value: "100%",
      color: "sage" as const,
      status: "above" as const,
      target: 100,
    },
    {
      id: 2,
      label: "Controlos Realizados",
      value: "24/24",
      color: "sky" as const,
      status: "above" as const,
      target: 24,
    },
    {
      id: 3,
      label: "Desvios",
      value: "0",
      color: "sage" as const,
      status: "above" as const,
      target: 0,
    },
    {
      id: 4,
      label: "Ações Corretivas",
      value: "0",
      color: "sky" as const,
      status: "on_target" as const,
      target: 0,
    },
  ];

  const mockCheckpoints = [
    {
      checkpoint: "Receção",
      parameter: "Temperatura",
      value: "4°C",
      limit: "< 5°C",
      status: "✅ OK",
    },
    {
      checkpoint: "Armazém",
      parameter: "Humidade",
      value: "65%",
      limit: "40-70%",
      status: "✅ OK",
    },
    {
      checkpoint: "Preparação",
      parameter: "Temperatura",
      value: "18°C",
      limit: "< 20°C",
      status: "✅ OK",
    },
    {
      checkpoint: "Cozinha",
      parameter: "Temperatura Núcleo",
      value: "75°C",
      limit: "> 63°C",
      status: "✅ OK",
    },
    {
      checkpoint: "Arrefecimento",
      parameter: "Tempo Arrefecimento",
      value: "45 min",
      limit: "< 90 min",
      status: "✅ OK",
    },
    {
      checkpoint: "Serviço",
      parameter: "Temperatura Mantida",
      value: "65°C",
      limit: "> 60°C",
      status: "✅ OK",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "checkpoint",
      label: "Checkpoint",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "receiving", label: "Receção" },
        { value: "storage", label: "Armazém" },
        { value: "prep", label: "Preparação" },
        { value: "cooking", label: "Cozinha" },
      ],
    },
    {
      key: "period",
      label: "Período",
      type: "select",
      options: [
        { value: "today", label: "Hoje" },
        { value: "week", label: "Esta Semana" },
        { value: "month", label: "Este Mês" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">HACCP</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestão de Segurança Alimentar: Controlos, Desvios, Conformidade
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Controlos de Checkpoints</h2>
        <DataTable columns={checkpointsColumns} rows={mockCheckpoints} />
      </div>
    </div>
  );
}

export default Haccp;
