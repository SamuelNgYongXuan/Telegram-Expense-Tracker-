import { supabase } from "./supabase";
import type {
  Expense,
  CategorySummary,
  DailySpending,
  MonthlySpending,
  DashboardData,
} from "./types";

const SG_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8

const CATEGORY_COLORS: Record<string, string> = {
  "🍔 Food & Drinks": "#6366f1",
  "🚗 Transport": "#3b82f6",
  "🎬 Entertainment": "#f59e0b",
  "🛒 Shopping": "#f97316",
  "👔 Apparals": "#ec4899",
  "💊 Healthcare": "#10b981",
  "💰 Other": "#f43f5e",
};

const FALLBACK_COLORS = [
  "#6366f1","#3b82f6","#f59e0b","#10b981","#f43f5e","#f97316","#ec4899","#8b5cf6","#14b8a6",
];

function toSGTime(date: Date): Date {
  return new Date(date.getTime() + SG_OFFSET_MS);
}

/** Returns UTC boundaries for a given SG year/month (0-indexed month) */
function sgMonthBounds(year: number, month: number): { start: Date; end: Date } {
  // Start: midnight SG on 1st of month = UTC 1st minus 8h
  const startSG = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const start = new Date(startSG.getTime() - SG_OFFSET_MS);

  // End: midnight SG on 1st of NEXT month
  const endSG = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  const end = new Date(endSG.getTime() - SG_OFFSET_MS);

  return { start, end };
}

/** Resolve telegram_user_id from a login token */
export async function getUserIdFromToken(
  token: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("auth_tokens")
    .select("telegram_user_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return data.telegram_user_id;
}

/** Resolve internal user row id from telegram_user_id */
export async function getInternalUserId(
  telegramUserId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("telegram_user_id", telegramUserId)
    .single();

  if (error || !data) return null;
  return data.id;
}

/** Fetch all dashboard data for a given SG month */
export async function fetchDashboardData(
  userId: string,
  sgYear: number,
  sgMonth: number // 0-indexed
): Promise<DashboardData> {
  const { start: curStart, end: curEnd } = sgMonthBounds(sgYear, sgMonth);

  // Previous month
  const prevMonth = sgMonth === 0 ? 11 : sgMonth - 1;
  const prevYear = sgMonth === 0 ? sgYear - 1 : sgYear;
  const { start: prevStart, end: prevEnd } = sgMonthBounds(prevYear, prevMonth);

  // Fetch current month expenses
  const { data: currentExpenses } = await supabase
    .from("expense")
    .select("id, amount, category, description, created_at")
    .eq("user_id", userId)
    .gte("created_at", curStart.toISOString())
    .lt("created_at", curEnd.toISOString())
    .order("created_at", { ascending: false });

  // Fetch previous month expenses
  const { data: previousExpenses } = await supabase
    .from("expense")
    .select("amount, created_at")
    .eq("user_id", userId)
    .gte("created_at", prevStart.toISOString())
    .lt("created_at", prevEnd.toISOString());

  // Fetch full year expenses (Jan 1 to Dec 31 of sgYear)
  const { start: yearStart } = sgMonthBounds(sgYear, 0);
  const { end: yearEnd } = sgMonthBounds(sgYear, 11);

  const { data: yearExpenses } = await supabase
    .from("expense")
    .select("amount, created_at")
    .eq("user_id", userId)
    .gte("created_at", yearStart.toISOString())
    .lt("created_at", yearEnd.toISOString());

  const cur = (currentExpenses ?? []) as Expense[];
  const prev = (previousExpenses ?? []) as { amount: number; created_at: string }[];
  const yearly = (yearExpenses ?? []) as { amount: number; created_at: string }[];

  // ── Totals ──
  const totalSpending = cur.reduce((s, e) => s + Number(e.amount), 0);
  const previousMonthSpending = prev.reduce((s, e) => s + Number(e.amount), 0);
  const changePercent =
    previousMonthSpending === 0
      ? 0
      : ((totalSpending - previousMonthSpending) / previousMonthSpending) * 100;

  // ── Daily spending (current month) ──
  // Map day-of-month → amount
  const curByDay: Record<number, number> = {};
  cur.forEach((e) => {
    const sgDay = toSGTime(new Date(e.created_at)).getUTCDate();
    curByDay[sgDay] = (curByDay[sgDay] ?? 0) + Number(e.amount);
  });

  const prevByDay: Record<number, number> = {};
  prev.forEach((e) => {
    const sgDay = toSGTime(new Date(e.created_at)).getUTCDate();
    prevByDay[sgDay] = (prevByDay[sgDay] ?? 0) + Number(e.amount);
  });

  const daysInCurMonth = new Date(sgYear, sgMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const maxDays = Math.max(daysInCurMonth, daysInPrevMonth);

  const dailySpending: DailySpending[] = Array.from({ length: maxDays }, (_, i) => ({
    day: i + 1,
    current: curByDay[i + 1] ?? 0,
    previous: prevByDay[i + 1] ?? 0,
  }));

  // ── Monthly spending (current year) ──
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const amtByMonth: Record<number, number> = {};
  yearly.forEach((e) => {
    const sgMonthNum = toSGTime(new Date(e.created_at)).getUTCMonth(); // 0-indexed
    amtByMonth[sgMonthNum] = (amtByMonth[sgMonthNum] ?? 0) + Number(e.amount);
  });

  const monthlySpending: MonthlySpending[] = MONTH_NAMES.map((name, i) => ({
    month: name,
    monthNum: i + 1,
    amount: amtByMonth[i] ?? 0,
  }));

  // ── Category breakdown ──
  const catTotals: Record<string, number> = {};
  cur.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + Number(e.amount);
  });

  let colorIdx = 0;
  const categories: CategorySummary[] = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => {
      const color =
        CATEGORY_COLORS[name] ?? FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];
      return {
        name,
        amount,
        color,
        percent: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      };
    });

  return {
    totalSpending,
    previousMonthSpending,
    changePercent,
    dailySpending,
    monthlySpending,
    categories,
    transactions: cur,
  };
}
