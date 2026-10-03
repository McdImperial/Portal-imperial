"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function PlanosAcao() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const pacColumns: DataTableColumn[] = [
    { key: "id", label: "ID PAC", width: "12%" },
    { key: "title", label: "Título", width: "25%" },
    { key: "priority", label: "Prioridade", width: "15%" },
    { key: "progress", label: "Progresso", width: "20%", align: "right" as const },
    { key: "status", label: "Status", width: "28%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Total PAC",
      value: "18",
      color: "sky" as const,
      status: "above" as const,
      target: 15,
    },
    {
      id: 2,
      label: "Concluídas",
      value: "7",
      color: "sage" as const,
      status: "above" as const,
      target: 6,
    },
    {
      id: 3,
      label: "Em Andamento",
      value: "8",
      color: "gold" as const,
      status: "on_target" as const,
      target: 8,
    },
    {
      id: 4,
      label: "Atrasadas",
      value: "3",
      color: "rose" as const,
      status: "below" as const,
      target: 0,
    },
  ];

  const mockPAC = [
    {
      id: "PAC-001",
      title: "Implementar sistema de rastreabilidade",
      priority: "🔴 Crítica",
      progress: "75%",
      status: "🟡 Em Andamento",
    },
    {
      id: "PAC-002",
      title: "Treinar staff em novos procedimentos",
      priority: "🟠 Alta",
      progress: "100%",
      status: "✅ Concluído",
    },
    {
      id: "PAC-003",
      title: "Reduzir taxa de erro delivery",
      priority: "🟠 Alta",
      progress: "60%",
      status: "🟡 Em Andamento",
    },
    {
      id: "PAC-004",
      title: "Otimizar fluxo de cozinha",
      priority: "🟡 Média",
      progress: "40%",
      status: "🟡 Em Andamento",
    },
    {
      id: "PAC-005",
      title: "Implementar dark mode",
      priority: "🟡 Média",
      progress: "100%",
      status: "✅ Concluído",
    },
    {
      id: "PAC-006",
      title: "Corrigir conformidade HACCP",
      priority: "🔴 Crítica",
      progress: "20%",
      status: "🔴 Atrasado",
    },
    {
      id: "PAC-007",
      title: "Reduzir custos de alimentos",
      priority: "🟠 Alta",
      progress: "50%",
      status: "🟡 Em Andamento",
    },
    {
      id: "PAC-008",
      title: "Melhorar CSAT clientes",
      priority: "🟡 Média",
      progress: "85%",
      status: "🟡 Em Andamento",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "priority",
      label: "Prioridade",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "critical", label: "Crítica" },
        { value: "high", label: "Alta" },
        { value: "medium", label: "Média" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "completed", label: "Concluído" },
        { value: "in_progress", label: "Em Andamento" },
        { value: "delayed", label: "Atrasado" },
        { value: "pending", label: "Pendente" },
      ],
    },
    {
      key: "dueDate",
      label: "Vencimento",
      type: "select",
      options: [
        { value: "overdue", label: "Vencidos" },
        { value: "this_week", label: "Esta Semana" },
        { value: "this_month", label: "Este Mês" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Planos de Ação</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestão de PAC: Ações Corretivas, Progresso, Prioridades, Prazos
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Planos de Ação Corretiva (PAC)</h2>
        <DataTable columns={pacColumns} rows={mockPAC} />
      </div>
    </div>
  );
}

export default PlanosAcao;
