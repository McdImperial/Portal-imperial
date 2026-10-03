"use client";

import React, { useEffect, useState } from "react";
import {
  MetricCard,
  AlertCard,
  FilterBar,
  DataTable,
  type DataTableColumn,
  type FilterOption,
} from "@/app/components";

export interface VisaoGeralProps {
  onRefresh?: () => void;
}

export function VisaoGeral({ onRefresh }: VisaoGeralProps) {
  const [filters, setFilters] = useState<Record<string, string>>({
    period: "today",
    shift: "all",
  });

  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockMetrics = [
    { id: 1, label: "R2P", value: "82%", target: 85, status: "below" as const, color: "sky" as const },
    { id: 2, label: "Vendas", value: "€4.250", target: 4000, status: "above" as const, color: "sage" as const },
    { id: 3, label: "GCs", value: "94", target: 100, status: "on_target" as const, color: "sky" as const },
    { id: 4, label: "Produtividade", value: "78%", target: 80, status: "below" as const, color: "rose" as const },
    { id: 5, label: "Delivery CSAT", value: "4.2/5", target: 4.5, status: "on_target" as const, color: "gold" as const },
    { id: 6, label: "HACCP OK", value: "100%", target: 100, status: "above" as const, color: "sage" as const },
  ];

  const mockAlerts = [
    {
      id: 1,
      title: "R2P abaixo do objetivo",
      message: "Resultado R2P 82% está 3% abaixo da meta. Revisar operações.",
      severity: "high" as const,
    },
    {
      id: 2,
      title: "Produtividade em risco",
      message: "Produtividade 78% se mantém abaixo da meta.",
      severity: "medium" as const,
    },
    {
      id: 3,
      title: "Ação PAC - Formação",
      message: "PAC sobre formação de atendimento vence amanhã.",
      severity: "high" as const,
    },
  ];

  const opportunitiesColumns: DataTableColumn[] = [
    { key: "description", label: "Constatação", width: "50%" },
    { key: "severity", label: "Severidade", width: "25%", align: "center" as const },
    { key: "dueDate", label: "Prazo", width: "25%", align: "right" as const },
  ];

  const mockOpportunities = [
    {
      id: 1,
      description: "Qualidade de atendimento - Empatia",
      severity: "ALTA",
      dueDate: "2026-10-10",
    },
    {
      id: 2,
      description: "Higiene zona de preparação",
      severity: "MÉDIA",
      dueDate: "2026-10-15",
    },
    {
      id: 3,
      description: "Documentação HACCP incompleta",
      severity: "BAIXA",
      dueDate: "2026-10-20",
    },
  ];

  const pacColumns: DataTableColumn[] = [
    { key: "description", label: "Ação Corretiva", width: "45%" },
    { key: "priority", label: "Prioridade", width: "15%", align: "center" as const },
    { key: "status", label: "Status", width: "20%", align: "center" as const },
    { key: "progress", label: "Progresso", width: "20%", align: "right" as const,
      render: (value: number) => `${value}%` },
  ];

  const mockPacActions = [
    {
      id: 1,
      description: "Implementar novo protocolo de atendimento",
      priority: 1,
      status: "IN_PROGRESS",
      progress: 65,
    },
    {
      id: 2,
      description: "Formação staff em food safety",
      priority: 2,
      status: "IN_PROGRESS",
      progress: 40,
    },
    {
      id: 3,
      description: "Revisão de equipamentos cozinha",
      priority: 3,
      status: "PENDING",
      progress: 0,
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select" | "text";
    options?: FilterOption[];
    value?: string;
  }> = [
    {
      key: "period",
      label: "Período",
      type: "select",
      value: "today",
      options: [
        { value: "today", label: "Hoje" },
        { value: "week", label: "Esta Semana" },
        { value: "month", label: "Este Mês" },
        { value: "year", label: "Este Ano" },
      ],
    },
    {
      key: "shift",
      label: "Turno",
      type: "select",
      value: "all",
      options: [
        { value: "all", label: "Todos" },
        { value: "morning", label: "Manhã" },
        { value: "afternoon", label: "Tarde" },
        { value: "night", label: "Noite" },
      ],
    },
    {
      key: "date",
      label: "Data Específica",
      type: "date",
    },
  ];

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    // Trigger API call with new filters
    console.log("Filters changed:", newFilters);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, fetch from /api/restaurant/* endpoints
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--ink)]">
            Visão Geral - Restaurante Imperial
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Dashboard de gestão operacional e performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-6 py-3 bg-[var(--teal)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "🔄 Atualizando..." : "🔄 Atualizar Portal"}
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
      />

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            target={metric.target}
            status={metric.status}
            color={metric.color}
            trend={metric.status === "above" ? "up" : metric.status === "below" ? "down" : "stable"}
          />
        ))}
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
          🔔 Alertas & Desvios
        </h2>
        <div className="grid grid-cols-1 gap-3 max-w-2xl">
          {mockAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={alert.title}
              message={alert.message}
              severity={alert.severity}
              actionLabel="Ver Detalhes"
              onAction={() => console.log("View alert:", alert.id)}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Opportunities */}
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
            📋 Constatações de Auditoria
          </h2>
          <DataTable
            columns={opportunitiesColumns}
            rows={mockOpportunities}
            emptyMessage="Sem constatações pendentes"
            onRowClick={(row) => console.log("View opportunity:", row.id)}
          />
        </div>

        {/* PAC Actions */}
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
            ✅ Plano de Ações Corretivas (PAC)
          </h2>
          <DataTable
            columns={pacColumns}
            rows={mockPacActions}
            emptyMessage="Sem ações corretivas pendentes"
            onRowClick={(row) => console.log("View PAC action:", row.id)}
          />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-[var(--cream)] rounded-lg p-4 border-l-4 border-l-[var(--teal)] text-sm text-[var(--muted)]">
        <p>
          ℹ️ <strong>Última atualização:</strong> {new Date().toLocaleString("pt-PT")}
        </p>
        <p className="mt-1">
          💡 <strong>Dica:</strong> Use os filtros acima para refinar a visualização por período, turno ou data específica.
        </p>
      </div>
    </div>
  );
}

export default VisaoGeral;
