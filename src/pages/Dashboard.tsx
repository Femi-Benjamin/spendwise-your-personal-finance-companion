import { useMemo } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { useExpenses } from "@/hooks/useExpenses";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useBudget } from "@/context/BudgetContext";
import { usePreferences } from "@/context/PreferencesContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Receipt, Loader2 } from "lucide-react";
import { ExpenseCategory } from "@/types/expense";

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const { monthlyBudget, getPercentageUsed } = useBudget();
  const { showTrendChart } = usePreferences();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { expenses, loading } = useExpenses({
    startDate: monthStart,
    endDate: monthEnd,
  });

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;
    const byCategory = expenses.reduce((acc, e) => {
      const cat = e.category as ExpenseCategory;
      acc[cat] = (acc[cat] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categoryData = Object.entries(byCategory)
      .map(([category, total]) => ({
        category: category as ExpenseCategory,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    return { total, count, average, categoryData };
  }, [expenses]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your spending at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyBudget > 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Monthly Budget Goal</span>
                  <span className="text-muted-foreground">
                    {formatAmount(stats.total)} / {formatAmount(monthlyBudget)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress
                    value={getPercentageUsed(stats.total)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {getPercentageUsed(stats.total).toFixed(1)}% used
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <StatCard
            title="Total This Month"
            value={formatAmount(stats.total)}
            subtitle={`${stats.count} transactions`}
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Average Expense"
            value={formatAmount(stats.average)}
            subtitle="Per transaction"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatCard
            title="Categories Used"
            value={stats.categoryData.length.toString()}
            subtitle="Different categories"
            icon={<Receipt className="w-6 h-6" />}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showTrendChart && <TrendChart expenses={expenses} />}
          <CategoryChart data={stats.categoryData} />
          <RecentExpenses expenses={expenses} />
        </div>
      </div>
    </AppLayout>
  );
}
// Project: SpendWise - Your Personal Finance Companion
// SpendWise is a modern, responsive React application designed to help users track their personal expenses and visualize their spending habits.

// Core Features
// Dashboard: A visual overview of your finances, including total spending for the month, average transaction size, and category breakdowns.
// Expense Tracking: Users can add, edit, and delete expense entries with details like amount, date, category, and description.
// Data Visualization: Uses charts (Pie charts, etc.) to show spending distribution across categories (Food, Transport, Utilities, etc.).
// Local Offline Mode: Recently modified to run entirely offline. It bypasses the need for a server login and saves all your data securely to your device's Local Storage, effectively acting as a private, standalone app.
// Tech Stack
// Frontend: React (with TypeScript) for a robust and type-safe UI.
// Build Tool: Vite for lightning-fast development and building.
// Styling: Tailwind CSS combined with shadcn/ui components for a premium, accessible, and clean design.
// State Management: TanStack Query (React Query) for efficient data handling.
// storage: LocalStorage (previously Supabase) for persisting user data.
// In essence, it is a sleek, "local-first" financial tracker that helps you stay on top of your budget without needing an account or internet connection.