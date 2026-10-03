"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Operacoes() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const operationsColumns: DataTableColumn[] = [
    { key: "metric", label: "Métrica", width: "30%" },
    { key: "value", label: "Valor", width: "25%", align: "right" as const },
    { key: "target", label: "Target", width: "20%", align: "right" as const },
    { key: "status", label: "Status", width: "25%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "R2P (Resultado)",
      value: "82%",
      color: "sky" as const,
      status: "below" as const,
      target: 85,
    },
    {
      id: 2,
      label: "Vendas Totais",
      value: "€4.250",
      color: "sage" as const,
      status: "above" as const,
      target: 4000,
    },
    {
      id: 3,
      label: "Gestão de Custos",
      value: "94%",
      color: "gold" as const,
      status: "on_target" as const,
      target: 95,
    },
    {
      id: 4,
      label: "Produtividade",
      value: "78%",
      color: "rose" as const,
      status: "below" as const,
      target: 80,
    },
  ];

  const mockOperations = [
    { metric: "Refeições Servidas", value: "247", target: "260", status: "⚠️ Abaixo" },
    { metric: "Ticket Médio", value: "€17.20", target: "€17.00", status: "✅ Acima" },
    { metric: "Ocupação Média", value: "78%", target: "80%", status: "⚠️ Abaixo" },
    { metric: "Eficiência Cozinha", value: "89%", target: "90%", status: "⚠️ Abaixo" },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
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
    {
      key: "shift",
      label: "Turno",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "morning", label: "Manhã" },
        { value: "afternoon", label: "Tarde" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Operações</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestão operacional: R2P, Vendas, GCs, Produtividade
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Detalhes Operacionais</h2>
        <DataTable columns={operationsColumns} rows={mockOperations} />
      </div>
    </div>
  );
}

export default Operacoes;
