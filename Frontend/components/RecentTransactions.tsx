"use client";

import React from "react";
import type { Expense } from "@/lib/types";

interface RecentTransactionsProps {
  transactions: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "🍔 Food & Drinks": "#6366f1",
  "🚗 Transport":     "#3b82f6",
  "🎬 Entertainment": "#f59e0b",
  "🛒 Shopping":      "#f97316",
  "👔 Apparals":      "#ec4899",
  "💊 Healthcare":    "#10b981",
  "💰 Other":         "#f43f5e",
};

const CATEGORY_ICONS: Record<string, string> = {
  "🍔 Food & Drinks": "🍔",
  "🚗 Transport":     "🚗",
  "🎬 Entertainment": "🎬",
  "🛒 Shopping":      "🛒",
  "👔 Apparals":      "👔",
  "💊 Healthcare":    "💊",
  "💰 Other":         "💰",
};

const FALLBACK_COLORS = [
  "#6366f1","#3b82f6","#f59e0b","#10b981","#f43f5e","#f97316","#ec4899","#8b5cf6",
];

const SG_OFFSET_MS = 8 * 60 * 60 * 1000;

function formatSGDate(isoString: string): string {
  const utc = new Date(isoString);
  const sg = new Date(utc.getTime() + SG_OFFSET_MS);
  return sg.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatSGTime(isoString: string): string {
  const utc = new Date(isoString);
  const sg = new Date(utc.getTime() + SG_OFFSET_MS);
  return sg.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

let colorIdx = 0;
const resolvedColors: Record<string, string> = {};
function getCategoryColor(cat: string): string {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  if (!resolvedColors[cat]) {
    resolvedColors[cat] = FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];
  }
  return resolvedColors[cat];
}

function getCategoryIcon(cat: string): string {
  if (CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat];
  // Try to extract first emoji from category string
  const match = cat.match(/^\p{Emoji}/u);
  return match ? match[0] : "💸";
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-base font-semibold text-gray-900">Transactions</h2>
        <p className="text-xs text-gray-400 mt-0.5">{transactions.length} this month · showing latest 6</p>
      </div>

      <div className="divide-y divide-gray-50">
          {transactions.slice(0, 6).map((tx) => {
          const color = getCategoryColor(tx.category);
          const icon  = getCategoryIcon(tx.category);

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-5 py-3.5 min-h-[56px] hover:bg-gray-50 transition-colors"
            >
              {/* Icon bubble */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: color + "18" }}
              >
                {icon}
              </div>

              {/* Name + time */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color }}>
                  {tx.category}
                </p>
              </div>

              {/* Amount + date */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  -${Number(tx.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatSGDate(tx.created_at)} · {formatSGTime(tx.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
