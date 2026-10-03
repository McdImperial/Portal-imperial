"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Formacao() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const trainingColumns: DataTableColumn[] = [
    { key: "course", label: "Curso", width: "25%" },
    { key: "participants", label: "Participantes", width: "15%", align: "right" as const },
    { key: "completion", label: "Conclusão", width: "20%", align: "right" as const },
    { key: "status", label: "Status", width: "20%", align: "center" as const },
    { key: "nextDate", label: "Próx. Sessão", width: "20%" },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Cursos Disponíveis",
      value: "8",
      color: "sky" as const,
      status: "above" as const,
      target: 6,
    },
    {
      id: 2,
      label: "Em Progresso",
      value: "12",
      color: "sage" as const,
      status: "above" as const,
      target: 10,
    },
    {
      id: 3,
      label: "Conclusões Mês",
      value: "5",
      color: "gold" as const,
      status: "on_target" as const,
      target: 5,
    },
    {
      id: 4,
      label: "Compliance",
      value: "94%",
      color: "sage" as const,
      status: "above" as const,
      target: 90,
    },
  ];

  const mockTraining = [
    {
      course: "HACCP - Segurança Alimentar",
      participants: "4/5",
      completion: "80%",
      status: "🟢 Ativo",
      nextDate: "2026-10-10",
    },
    {
      course: "Atendimento ao Cliente",
      participants: "6/8",
      completion: "75%",
      status: "🟢 Ativo",
      nextDate: "2026-10-08",
    },
    {
      course: "Liderança de Equipa",
      participants: "2/2",
      completion: "100%",
      status: "✅ Completo",
      nextDate: "2026-11-15",
    },
    {
      course: "Higiene Pessoal",
      participants: "8/10",
      completion: "80%",
      status: "🟢 Ativo",
      nextDate: "2026-10-05",
    },
    {
      course: "Técnicas de Cozinha",
      participants: "3/4",
      completion: "75%",
      status: "🟢 Ativo",
      nextDate: "2026-10-12",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "category",
      label: "Categoria",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "safety", label: "Segurança" },
        { value: "service", label: "Serviço" },
        { value: "management", label: "Gestão" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "active", label: "Ativos" },
        { value: "completed", label: "Completos" },
        { value: "pending", label: "Pendentes" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Formação</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Programas de treinamento: Cursos, Progresso, Certificações, Compliance
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Programas de Treinamento</h2>
        <DataTable columns={trainingColumns} rows={mockTraining} />
      </div>
    </div>
  );
}

export default Formacao;
