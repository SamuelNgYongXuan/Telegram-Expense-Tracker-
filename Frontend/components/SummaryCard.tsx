"use client";

import React from "react";

interface SummaryCardProps {
  totalSpending: number;
  previousMonthSpending: number;
  changePercent: number;
}

export default function SummaryCard({
  totalSpending,
  previousMonthSpending,
  changePercent,
}: SummaryCardProps) {
  const isIncrease = changePercent > 0;

  return (
    <div
      className="rounded-2xl p-6 text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="relative z-10">
        <p className="text-sm font-medium text-white/60 tracking-wide uppercase mb-1">
          Total Spending
        </p>

        <div className="flex items-end gap-3 mt-2">
          <span
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            ${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
          {/* Change badge */}
          <span
            className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
              isIncrease
                ? "bg-red-500/20 text-red-300"
                : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            <span>{isIncrease ? "↑" : "↓"}</span>
            {Math.abs(changePercent).toFixed(1)}%
          </span>
          <span className="text-sm text-white/50">
            vs ${previousMonthSpending.toLocaleString("en-US", { minimumFractionDigits: 2 })} last month
          </span>
        </div>
      </div>
    </div>
  );
}
