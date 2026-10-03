"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Auditorias() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const auditColumns: DataTableColumn[] = [
    { key: "auditDate", label: "Data Auditoria", width: "15%" },
    { key: "type", label: "Tipo", width: "20%" },
    { key: "score", label: "Resultado", width: "15%", align: "right" as const },
    { key: "category", label: "Categoria", width: "20%" },
    { key: "status", label: "Status", width: "30%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Auditorias Realizadas",
      value: "12",
      color: "sky" as const,
      status: "above" as const,
      target: 10,
    },
    {
      id: 2,
      label: "Score Médio",
      value: "87%",
      color: "sage" as const,
      status: "above" as const,
      target: 85,
    },
    {
      id: 3,
      label: "Constatações",
      value: "23",
      color: "rose" as const,
      status: "below" as const,
      target: 15,
    },
    {
      id: 4,
      label: "Conformidade",
      value: "89%",
      color: "gold" as const,
      status: "on_target" as const,
      target: 90,
    },
  ];

  const mockAudits = [
    {
      auditDate: "2026-10-02",
      type: "Interna",
      score: "92%",
      category: "HACCP",
      status: "✅ Completo",
    },
    {
      auditDate: "2026-10-01",
      type: "Interna",
      score: "85%",
      category: "Higiene",
      status: "✅ Completo",
    },
    {
      auditDate: "2026-09-28",
      type: "Externa",
      score: "88%",
      category: "Operações",
      status: "✅ Completo",
    },
    {
      auditDate: "2026-09-25",
      type: "Interna",
      score: "84%",
      category: "Gestão de Custos",
      status: "✅ Completo",
    },
    {
      auditDate: "2026-09-20",
      type: "Interna",
      score: "79%",
      category: "Segurança",
      status: "⚠️ Atenção",
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
      label: "Tipo Auditoria",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "internal", label: "Interna" },
        { value: "external", label: "Externa" },
      ],
    },
    {
      key: "category",
      label: "Categoria",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "haccp", label: "HACCP" },
        { value: "hygiene", label: "Higiene" },
        { value: "operations", label: "Operações" },
      ],
    },
    {
      key: "period",
      label: "Período",
      type: "select",
      options: [
        { value: "month", label: "Este Mês" },
        { value: "quarter", label: "Este Trimestre" },
        { value: "year", label: "Este Ano" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Auditorias</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Resultados de auditorias: Internas, Externas, Conformidade, Pontuação
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Histórico de Auditorias</h2>
        <DataTable columns={auditColumns} rows={mockAudits} />
      </div>
    </div>
  );
}

export default Auditorias;
