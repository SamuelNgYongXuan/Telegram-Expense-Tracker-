# Expense Dashboard

A mobile-first expense dashboard built with **Next.js 14**, **Tailwind CSS**, and **Recharts** — connected live to the same Supabase database as your Telegram expense bot.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in your Supabase project URL and anon key (found in **Supabase → Project Settings → API**).

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run locally
```bash
npm run dev
# → http://localhost:3000
```

## Authentication

The dashboard uses the same token system as your Telegram bot.

1. Send `/login` to your bot — it generates a 30-day token link.
2. Open the link — you'll be redirected to the dashboard and signed in automatically.
3. Your session is stored in `localStorage`. Bookmark the dashboard URL.

If you visit the dashboard without a token, you'll see a "Not signed in" screen with instructions.

## Features

- 📅 **Month navigation** — browse any past month with ‹ › arrows in the header
- 📈 **Dual chart view** — toggle between daily (vs last month) and yearly (month-by-month bar chart)
- 🍩 **Category donut** — interactive, tap any segment or list row to highlight
- 🧾 **All transactions** — for the selected month, with SG timestamps
- 🔄 **Live data** — pulls directly from Supabase, no hardcoded values

## Project Structure

```
expense-dashboard/
├── app/
│   ├── auth/page.tsx         # Token ingestion redirect
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main dashboard (client component)
├── components/
│   ├── SummaryCard.tsx
│   ├── SpendingLineChart.tsx  # Daily/yearly toggle
│   ├── CategoryChart.tsx
│   └── RecentTransactions.tsx
└── lib/
    ├── supabase.ts            # Supabase client
    ├── fetchData.ts           # All data-fetching logic (SG timezone aware)
    └── types.ts               # Shared TypeScript types
```

## Deploying to Vercel

1. Push to GitHub
2. Import in Vercel, add your two `NEXT_PUBLIC_*` env vars
3. Deploy — update your Telegram bot's `dashboardUrl` to the Vercel URL
