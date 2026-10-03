"use client";

import React from "react";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusColorMap: Record<string, { bg: string; text: string; indicator: string }> = {
  active: { bg: "bg-[var(--sage)]/10", text: "text-[var(--sage)]", indicator: "bg-[var(--sage)]" },
  inactive: { bg: "bg-[var(--muted)]/10", text: "text-[var(--muted)]", indicator: "bg-[var(--muted)]" },
  pending: { bg: "bg-[var(--gold)]/10", text: "text-[var(--gold)]", indicator: "bg-[var(--gold)]" },
  completed: { bg: "bg-[var(--sage)]/10", text: "text-[var(--sage)]", indicator: "bg-[var(--sage)]" },
  failed: { bg: "bg-[var(--rose)]/10", text: "text-[var(--rose)]", indicator: "bg-[var(--rose)]" },
  warning: { bg: "bg-[var(--rose)]/10", text: "text-[var(--rose)]", indicator: "bg-[var(--rose)]" },
  error: { bg: "bg-[var(--rose)]/10", text: "text-[var(--rose)]", indicator: "bg-[var(--rose)]" },
  info: { bg: "bg-[var(--sky)]/10", text: "text-[var(--sky)]", indicator: "bg-[var(--sky)]" },
  success: { bg: "bg-[var(--sage)]/10", text: "text-[var(--sage)]", indicator: "bg-[var(--sage)]" },
  on_target: { bg: "bg-[var(--sky)]/10", text: "text-[var(--sky)]", indicator: "bg-[var(--sky)]" },
  above: { bg: "bg-[var(--sage)]/10", text: "text-[var(--sage)]", indicator: "bg-[var(--sage)]" },
  below: { bg: "bg-[var(--rose)]/10", text: "text-[var(--rose)]", indicator: "bg-[var(--rose)]" },
};

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const colors = statusColorMap[status] || {
    bg: "bg-[var(--line)]/20",
    text: "text-[var(--muted)]",
    indicator: "bg-[var(--muted)]",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const displayText = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full font-medium
      ${colors.bg} ${colors.text} ${sizeClasses[size]}
      transition-all duration-200
    `}>
      <span className={`inline-block w-2 h-2 rounded-full ${colors.indicator}`}></span>
      {displayText}
    </div>
  );
}
