"use client";

import React from "react";

export interface TrendIndicatorProps {
  trend: "up" | "down" | "stable";
  value?: string | number;
  label?: string;
  color?: string;
}

export function TrendIndicator({ trend, value, label, color }: TrendIndicatorProps) {
  const trendColors = {
    up: "text-[var(--sage)]",
    down: "text-[var(--rose)]",
    stable: "text-[var(--sky)]",
  };

  const trendEmoji = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <div className="inline-flex items-center gap-1">
      <span className={`text-lg font-bold ${color || trendColors[trend]}`}>
        {trendEmoji[trend]}
      </span>
      {value !== undefined && (
        <span className={`text-sm font-semibold ${color || trendColors[trend]}`}>
          {value}
        </span>
      )}
      {label && (
        <span className="text-xs text-[var(--muted)] ml-1">{label}</span>
      )}
    </div>
  );
}
