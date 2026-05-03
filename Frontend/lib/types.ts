export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

export interface User {
  id: string;
  telegram_user_id: string;
  custom_categories: string[] | null;
}

export interface AuthToken {
  telegram_user_id: string;
  token: string;
  expires_at: string;
}

export interface CategorySummary {
  name: string;
  amount: number;
  color: string;
  percent: number;
}

export interface DailySpending {
  day: number;
  current: number;
  previous: number;
}

export interface MonthlySpending {
  month: string;    // "Jan", "Feb" …
  monthNum: number; // 1-12
  amount: number;
}

export interface DashboardData {
  totalSpending: number;
  previousMonthSpending: number;
  changePercent: number;
  dailySpending: DailySpending[];
  monthlySpending: MonthlySpending[];
  categories: CategorySummary[];
  transactions: Expense[];
}
