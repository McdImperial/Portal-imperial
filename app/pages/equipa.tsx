"use client";

import React, { useState } from "react";
import { MetricCard, DataTable, FilterBar, type DataTableColumn, type FilterOption } from "@/app/components";

export function Equipa() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const staffColumns: DataTableColumn[] = [
    { key: "name", label: "Nome", width: "25%" },
    { key: "role", label: "Função", width: "20%" },
    { key: "department", label: "Departamento", width: "20%" },
    { key: "certifications", label: "Certificações", width: "20%" },
    { key: "status", label: "Status", width: "15%", align: "center" as const },
  ];

  const mockMetrics = [
    {
      id: 1,
      label: "Total Equipa",
      value: "24",
      color: "sky" as const,
      status: "above" as const,
      target: 20,
    },
    {
      id: 2,
      label: "Ativos",
      value: "22",
      color: "sage" as const,
      status: "above" as const,
      target: 22,
    },
    {
      id: 3,
      label: "Certificações Válidas",
      value: "19/24",
      color: "gold" as const,
      status: "on_target" as const,
      target: 24,
    },
    {
      id: 4,
      label: "Formação Pendente",
      value: "3",
      color: "rose" as const,
      status: "below" as const,
      target: 0,
    },
  ];

  const mockStaff = [
    {
      name: "João Silva",
      role: "Chef",
      department: "Cozinha",
      certifications: "HACCP ✓",
      status: "✅ Ativo",
    },
    {
      name: "Maria Santos",
      role: "Supervisora",
      department: "Serviço",
      certifications: "HACCP ✓ Atendimento ✓",
      status: "✅ Ativo",
    },
    {
      name: "Pedro Costa",
      role: "Cozinheiro",
      department: "Cozinha",
      certifications: "HACCP ⏳",
      status: "⚠️ Atenção",
    },
    {
      name: "Ana Oliveira",
      role: "Garçom",
      department: "Serviço",
      certifications: "Atendimento ✓",
      status: "✅ Ativo",
    },
    {
      name: "Carlos Mendes",
      role: "Gestor",
      department: "Gestão",
      certifications: "HACCP ✓ Liderança ✓",
      status: "✅ Ativo",
    },
  ];

  const filterOptions: Array<{
    key: string;
    label: string;
    type: "date" | "select";
    options?: FilterOption[];
  }> = [
    {
      key: "department",
      label: "Departamento",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "kitchen", label: "Cozinha" },
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
        { value: "inactive", label: "Inativos" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--ink)]">Equipa</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gestão de pessoal: Colaboradores, Certificações, Departamentos, Formação
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
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Lista de Colaboradores</h2>
        <DataTable columns={staffColumns} rows={mockStaff} />
      </div>
    </div>
  );
}

export default Equipa;
