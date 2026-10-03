"use client";

import React from "react";

export interface ProgressBarProps {
  value: number;
  target: number;
  label?: string;
  color?: "sage" | "rose" | "sky" | "gold";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  target,
  label,
  color = "sky",
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / target) * 100, 100);

  const colorMap = {
    sage: "bg-[var(--sage)]",
    rose: "bg-[var(--rose)]",
    sky: "bg-[var(--sky)]",
    gold: "bg-[var(--gold)]",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          {label && <p className="text-sm font-medium text-[var(--ink)]">{label}</p>}
          <span className="text-xs text-[var(--muted)]">
            {value} / {target}
          </span>
        </div>
      )}

      <div className="w-full h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
