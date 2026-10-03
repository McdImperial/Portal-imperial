"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Custos() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const costsColumns: DataTableColumn[] = [
    { key: "category", label: "Categoria", width: "25%" },
    { key: "budget", label: "Orçamento", width: "18%", align: "right" as const },
    { key: "actual", label: "Realizado", width: "18%", align: "right" as const },
    { key: "variance", label: "Variância", width: "18%", align: "right" as const },
    { key: "status", label: "Status", width: "21%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Orçamento Mês",
      value: "€12.500",
      color: "sky" as const,
      status: "on_target" as const,
      target: 12500,
    },
    {
      id: 2,
      label: "Gasto Atual",
      value: "€11.850",
      color: "sage" as const,
      status: "below" as const,
      target: 12500,
    },
    {
      id: 3,
      label: "Economias",
      value: "€650",
      color: "gold" as const,
      status: "above" as const,
      target: 500,
    },
    {
      id: 4,
      label: "Taxa de Uso",
      value: "94.8%",
      color: "sky" as const,
      status: "on_target" as const,
      target: 95,
    },
  ];

  const mockCosts = [
    {
      category: "Alimentos & Bebidas",
      budget: "€5.500",
      actual: "€5.120",
      variance: "-€380 (-6.9%)",
      status: "✅ Dentro",
    },
    {
      category: "Recursos Humanos",
      budget: "€4.200",
      actual: "€4.350",
      variance: "+€150 (+3.6%)",
      status: "⚠️ Acima",
    },
    {
      category: "Utilitários",
      budget: "€1.200",
      actual: "€1.185",
      variance: "-€15 (-1.3%)",
      status: "✅ Dentro",
    },
    {
      category: "Manutenção",
      budget: "€800",
      actual: "€645",
      variance: "-€155 (-19.4%)",
      status: "✅ Dentro",
    },
    {
      category: "Marketing",
      budget: "€600",
      actual: "€550",
      variance: "-€50 (-8.3%)",
      status: "✅ Dentro",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "month",
      label: "Mês",
      type: "select",
      options: [
        { value: "current", label: "Este Mês" },
        { value: "previous", label: "Mês Anterior" },
        { value: "ytd", label: "Ano até Agora" },
      ],
    },
    {
      key: "department",
      label: "Departamento",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "food", label: "Alimentos" },
        { value: "staff", label: "Pessoal" },
        { value: "operations", label: "Operações" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Custos</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestão financeira: Orçamento, Gastos Reais, Variâncias, Análise
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Análise de Custos por Categoria</h2>
        <DataTable columns={costsColumns} rows={mockCosts} />
      </div>
    </div>
  );
}

export default Custos;
