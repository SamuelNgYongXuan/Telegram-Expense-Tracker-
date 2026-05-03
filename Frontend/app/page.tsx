"use client";

import { useEffect, useState, useCallback } from "react";
import SummaryCard from "../components/SummaryCard";
import SpendingLineChart from "../components/SpendingLineChart";
import CategoryChart from "../components/CategoryChart";
import RecentTransactions from "../components/RecentTransactions";
import { getUserIdFromToken, getInternalUserId, fetchDashboardData } from "../lib/fetchData";
import type { DashboardData } from "../lib/types";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getSGNow() {
  const now = new Date();
  const sg = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return { year: sg.getUTCFullYear(), month: sg.getUTCMonth() };
}

export default function DashboardPage() {
  const sgNow = getSGNow();

  const [viewYear, setViewYear]   = useState(sgNow.year);
  const [viewMonth, setViewMonth] = useState(sgNow.month); // 0-indexed

  const [userId, setUserId]       = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);

  // ── Resolve auth token → internal user id ──
  useEffect(() => {
    async function resolveUser() {
    // Check URL param first (coming from /auth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    const token = urlToken || localStorage.getItem("expense_auth_token");
    if (!token) { setAuthError(true); setLoading(false); return; }

    // Save it for future visits
    localStorage.setItem("expense_auth_token", token);

    // Clean the token from the URL without a page reload
    window.history.replaceState({}, "", "/");

    const telegramId = await getUserIdFromToken(token);
    if (!telegramId) { setAuthError(true); setLoading(false); return; }

    const id = await getInternalUserId(telegramId);
    if (!id) { setAuthError(true); setLoading(false); return; }

    setUserId(id);
  }
    resolveUser();
  }, []);

  // ── Fetch dashboard data when userId or month changes ──
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await fetchDashboardData(userId, viewYear, viewMonth);
    setData(result);
    setLoading(false);
  }, [userId, viewYear, viewMonth]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Month navigation ──
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const { year: ny, month: nm } = getSGNow();
    if (viewYear === ny && viewMonth === nm) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const isCurrentMonth = viewYear === sgNow.year && viewMonth === sgNow.month;

  // ── Auth error state ──
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#f8f7f4" }}>
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not signed in</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Use the <span className="font-mono bg-gray-100 px-1 rounded">/login</span> command
            in your Telegram bot to get a personal link to this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f7f4" }}>
      <div className="mx-auto max-w-lg px-4 pb-10">

        {/* ── Header ── */}
        <header className="flex items-center justify-between pt-10 pb-6">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              Expenses
            </h1>

            {/* Month navigator */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors active:scale-95"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="text-sm font-semibold text-gray-700 min-w-[110px] text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors active:scale-95 ${
                  isCurrentMonth
                    ? "text-gray-200 cursor-not-allowed"
                    : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                }`}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          {/* Avatar dot — filled = current month, outline = past */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xl select-none">
            {isCurrentMonth ? "●" : "◌"}
          </div>
        </header>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[140, 260, 340, 280].map((h, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 animate-pulse" style={{ height: h }} />
            ))}
          </div>
        )}

        {/* ── Dashboard sections ── */}
        {!loading && data && (
          <div className="space-y-4">
            <SummaryCard
              totalSpending={data.totalSpending}
              previousMonthSpending={data.previousMonthSpending}
              changePercent={data.changePercent}
            />

            <SpendingLineChart
              dailyData={data.dailySpending}
              monthlyData={data.monthlySpending}
              viewYear={viewYear}
              currentSGYear={sgNow.year}
            />

            {data.categories.length > 0 ? (
              <CategoryChart categories={data.categories} />
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
                No category data for this month.
              </div>
            )}

            {data.transactions.length > 0 ? (
              <RecentTransactions transactions={data.transactions} />
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
                No transactions recorded for this month.
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
