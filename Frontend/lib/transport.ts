import type { Expense } from "./types";

export interface TransportSubcategory {
  name: string;
  amount: number;
  percent: number; // percent of total transport spend
  color: string;
}

const TRANSPORT_COLORS: Record<string, string> = {
  "🚇 Train": "#0ea5e9",
  "🚌 Bus":   "#6366f1",
  "📦 Others": "#94a3b8",
};

const BUCKET_MAP: Record<string, string> = {
  train: "🚇 Train",
  bus:   "🚌 Bus",
};

export function buildTransportSubcategories(
  transportExpenses: Expense[]
): TransportSubcategory[] {
  const totals: Record<string, number> = {};

  for (const e of transportExpenses) {
    const key = e.description?.trim().toLowerCase() ?? "";
    const bucket = BUCKET_MAP[key] ?? "📦 Others";
    totals[bucket] = (totals[bucket] ?? 0) + Number(e.amount);
  }

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
      percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      color: TRANSPORT_COLORS[name] ?? "#94a3b8",
    }));
}