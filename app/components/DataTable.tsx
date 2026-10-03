"use client";

import React from "react";

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  rows,
  onRowClick,
  loading = false,
  emptyMessage = "Sem dados disponíveis",
}: DataTableProps) {
  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-[var(--muted)]">
        Carregando dados...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="w-full p-8 text-center text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--cream)] border-b border-[var(--line)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-xs font-semibold text-[var(--muted)]
                  uppercase tracking-wide ${alignMap[col.align || "left"]}
                `}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-[var(--line)]
                ${idx % 2 === 0 ? "bg-white" : "bg-[var(--cream)]/30"}
                hover:bg-[var(--cream)] transition-colors
                ${onRowClick ? "cursor-pointer" : ""}
              `}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-[var(--ink)] ${alignMap[col.align || "left"]}`}
                  style={{ width: col.width }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
