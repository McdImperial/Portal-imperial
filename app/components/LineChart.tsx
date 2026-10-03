"use client";

import React from "react";

export interface LineChartDataPoint {
  label: string;
  value: number;
  target?: number;
}

export interface LineChartProps {
  title?: string;
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
}

export function LineChart({
  title,
  data,
  height = 200,
  color = "var(--sky)",
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-[var(--muted)]">
        Sem dados para exibir
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.target || 0)));
  const minValue = 0;
  const range = maxValue - minValue;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return { x, y, ...d };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">{title}</h3>
      )}

      <div style={{ height: `${height}px` }} className="w-full relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="var(--line)" strokeWidth="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="var(--line)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="var(--line)" strokeWidth="0.5" />

          {/* Line */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={color}
            />
          ))}
        </svg>
      </div>

      {/* Labels */}
      <div className="mt-4 flex justify-between text-xs text-[var(--muted)]">
        <div className="text-left">{data[0]?.label}</div>
        <div className="text-center">Média: {(range / 2 + minValue).toFixed(1)}</div>
        <div className="text-right">{data[data.length - 1]?.label}</div>
      </div>
    </div>
  );
}
