"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Delivery() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const deliveryColumns: DataTableColumn[] = [
    { key: "platform", label: "Plataforma", width: "20%" },
    { key: "orders", label: "Pedidos", width: "15%", align: "right" as const },
    { key: "avgTime", label: "Tempo Médio", width: "20%", align: "right" as const },
    { key: "csat", label: "CSAT", width: "15%", align: "center" as const },
    { key: "status", label: "Status", width: "30%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Pedidos Entregues",
      value: "47",
      color: "sage" as const,
      status: "above" as const,
      target: 40,
    },
    {
      id: 2,
      label: "Tempo Médio Entrega",
      value: "28 min",
      color: "sky" as const,
      status: "on_target" as const,
      target: 30,
    },
    {
      id: 3,
      label: "CSAT Delivery",
      value: "4.2/5.0",
      color: "gold" as const,
      status: "above" as const,
      target: 4.0,
    },
    {
      id: 4,
      label: "Taxa de Erro",
      value: "2.1%",
      color: "rose" as const,
      status: "below" as const,
      target: 1.5,
    },
  ];

  const mockDelivery = [
    {
      platform: "Uber Eats",
      orders: "18",
      avgTime: "26 min",
      csat: "4.3/5",
      status: "✅ Bom",
    },
    {
      platform: "Deliveroo",
      orders: "16",
      avgTime: "29 min",
      csat: "4.1/5",
      status: "✅ Bom",
    },
    {
      platform: "Glovo",
      orders: "8",
      avgTime: "31 min",
      csat: "4.0/5",
      status: "⚠️ Atenção",
    },
    {
      platform: "Wolt",
      orders: "5",
      avgTime: "32 min",
      csat: "3.8/5",
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
      key: "platform",
      label: "Plataforma",
      type: "select",
      options: [
        { value: "all", label: "Todas" },
        { value: "ubereats", label: "Uber Eats" },
        { value: "deliveroo", label: "Deliveroo" },
        { value: "glovo", label: "Glovo" },
      ],
    },
    {
      key: "period",
      label: "Período",
      type: "select",
      options: [
        { value: "today", label: "Hoje" },
        { value: "week", label: "Esta Semana" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Delivery</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Performance de entregas: Pedidos, Tempos, Plataformas, CSAT
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Performance por Plataforma</h2>
        <DataTable columns={deliveryColumns} rows={mockDelivery} />
      </div>
    </div>
  );
}

export default Delivery;
