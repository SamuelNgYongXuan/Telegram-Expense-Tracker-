"use client";

import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { DailySpending, MonthlySpending } from "@/lib/types";

interface Props {
  dailyData: DailySpending[];
  monthlyData: MonthlySpending[];
  viewYear: number;
  currentSGYear: number;
}

const CustomDailyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1.5">Day {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500">{entry.name === "current" ? "This month" : "Last month"}:</span>
          <span className="font-semibold text-gray-800">${Number(entry.value).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
};

const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-indigo-600 font-semibold">${Number(payload[0]?.value ?? 0).toFixed(2)}</p>
    </div>
  );
};

type View = "daily" | "yearly";

export default function SpendingLineChart({ dailyData, monthlyData, viewYear, currentSGYear }: Props) {
  const [view, setView] = useState<View>("daily");

  const tickFormatter = (value: number) =>
    value % 5 === 0 || value === 1 ? `${value}` : "";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {view === "daily" ? "Monthly Trend" : `${viewYear} Overview`}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {view === "daily" ? "Daily spending vs last month" : "Month-by-month spending"}
          </p>
        </div>

        {/* Toggle pill */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[32px] ${
              view === "daily"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("yearly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[32px] ${
              view === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* ── Daily line chart ── */}
      {view === "daily" && (
        <>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1.5">
              <span className="block w-4 h-0.5 bg-indigo-500 rounded" />
              This month
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="block w-4 h-0.5 rounded"
                style={{
                  background:
                    "repeating-linear-gradient(to right,#d1d5db 0,#d1d5db 3px,transparent 3px,transparent 6px)",
                }}
              />
              Last month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={tickFormatter}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomDailyTooltip />} />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#d1d5db"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ── Yearly bar chart ── */}
      {view === "yearly" && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomMonthlyTooltip />} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.amount > 0 ? "#6366f1" : "#e5e7eb"}
                  opacity={entry.amount > 0 ? 1 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
