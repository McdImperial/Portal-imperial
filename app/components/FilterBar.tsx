"use client";

import React, { useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  filters: Array<{
    key: string;
    label: string;
    type: "date" | "select" | "text";
    options?: FilterOption[];
    value?: string;
  }>;
  onFilterChange: (filters: Record<string, string>) => void;
  onRefresh?: () => void;
}

export function FilterBar({ filters, onFilterChange, onRefresh }: FilterBarProps) {
  const [values, setValues] = useState<Record<string, string>>(
    filters.reduce((acc, f) => ({ ...acc, [f.key]: f.value || "" }), {})
  );

  const handleChange = (key: string, value: string) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onFilterChange(newValues);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[var(--line)] p-4 flex gap-4 items-end flex-wrap">
      {filters.map((filter) => (
        <div key={filter.key} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--muted)] uppercase">
            {filter.label}
          </label>

          {filter.type === "date" && (
            <input
              type="date"
              value={values[filter.key] || ""}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-[var(--line)] rounded text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
            />
          )}

          {filter.type === "select" && (
            <select
              value={values[filter.key] || ""}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-[var(--line)] rounded text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
            >
              <option value="">Todos</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {filter.type === "text" && (
            <input
              type="text"
              placeholder="Pesquisar..."
              value={values[filter.key] || ""}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-[var(--line)] rounded text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
            />
          )}
        </div>
      ))}

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-[var(--teal)] text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          🔄 Atualizar
        </button>
      )}
    </div>
  );
}
