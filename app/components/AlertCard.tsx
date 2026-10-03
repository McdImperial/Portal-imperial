"use client";

import React from "react";

export interface AlertCardProps {
  title: string;
  message: string;
  severity?: "low" | "medium" | "high";
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertCard({
  title,
  message,
  severity = "medium",
  icon,
  actionLabel,
  onAction,
}: AlertCardProps) {
  const severityStyles = {
    low: {
      bg: "bg-[var(--sky)]/10",
      border: "border-l-4 border-l-[var(--sky)]",
      text: "text-[var(--sky)]",
      badge: "bg-[var(--sky)]/20",
    },
    medium: {
      bg: "bg-[var(--gold)]/10",
      border: "border-l-4 border-l-[var(--gold)]",
      text: "text-[var(--gold)]",
      badge: "bg-[var(--gold)]/20",
    },
    high: {
      bg: "bg-[var(--rose)]/10",
      border: "border-l-4 border-l-[var(--rose)]",
      text: "text-[var(--rose)]",
      badge: "bg-[var(--rose)]/20",
    },
  };

  const style = severityStyles[severity];

  return (
    <div className={`
      rounded-lg p-4 ${style.bg} ${style.border}
      flex gap-4 items-start
      transition-all duration-200 hover:shadow-md
    `}>
      {icon && (
        <div className={`flex-shrink-0 text-xl ${style.text}`}>
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm mb-1 ${style.text}`}>
          {title}
        </h3>
        <p className="text-sm text-[var(--muted)] line-clamp-2">
          {message}
        </p>
        {actionLabel && (
          <button
            onClick={onAction}
            className={`
              mt-2 text-xs font-medium px-3 py-1 rounded
              ${style.badge} ${style.text}
              hover:opacity-80 transition-opacity
            `}
          >
            {actionLabel}
          </button>
        )}
      </div>

      <span className={`
        flex-shrink-0 px-2 py-1 rounded text-xs font-medium
        ${style.badge} ${style.text}
      `}>
        {severity.toUpperCase()}
      </span>
    </div>
  );
}
