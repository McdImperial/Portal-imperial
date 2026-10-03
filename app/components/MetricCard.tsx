"use client";

import React from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  target?: number;
  status?: "above" | "on_target" | "below";
  color?: "sage" | "rose" | "sky" | "gold";
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  footer?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  target,
  status = "on_target",
  color = "sky",
  trend,
  trendValue,
  footer,
}: MetricCardProps) {
  const colorMap = {
    sage: "border-l-4 border-l-[var(--sage)]",
    rose: "border-l-4 border-l-[var(--rose)]",
    sky: "border-l-4 border-l-[var(--sky)]",
    gold: "border-l-4 border-l-[var(--gold)]",
  };

  const statusIndicator = {
    above: "bg-[var(--sage)]/10",
    on_target: "bg-[var(--sky)]/10",
    below: "bg-[var(--rose)]/10",
  };

  return (
    <div
      className={`
        bg-[var(--cream)] rounded-lg p-4 w-64 h-32
        ${colorMap[color]} ${statusIndicator[status]}
        flex flex-col justify-between
        transition-all duration-200 hover:shadow-md
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs uppercase font-medium text-[var(--muted)]">
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-[var(--ink)]">
              {value}
            </p>
            {unit && (
              <p className="text-sm text-[var(--muted)]">{unit}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${
            trend === "up" ? "text-[var(--sage)]" :
            trend === "down" ? "text-[var(--rose)]" :
            "text-[var(--sky)]"
          }`}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "stable" && "→"}
            {trendValue && ` ${trendValue}`}
          </div>
        )}
      </div>

      {target !== undefined && (
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>Target: {target}</span>
          {status !== "on_target" && (
            <span className={status === "above" ? "text-[var(--sage)]" : "text-[var(--rose)]"}>
              {status === "above" ? "✓ Above" : "↓ Below"}
            </span>
          )}
        </div>
      )}

      {footer && (
        <p className="text-xs text-[var(--muted)] truncate">{footer}</p>
      )}
    </div>
  );
}
