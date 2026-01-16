import { useMemo } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useCurrency } from "@/context/useCurrency";
import { useExpenses } from "@/hooks/useExpenses";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useBudget } from "@/context/BudgetContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useBudgetWarning } from "@/hooks/useBudgetWarning";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  TrendingUp,
  Receipt,
  Loader2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { ExpenseCategory } from "@/types/expense";

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const { monthlyBudget, getPercentageUsed, getBudgetStatus } = useBudget();
  const { showTrendChart } = usePreferences();
  useBudgetWarning(); // Hook triggers notifications

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

  const budgetStatus = getBudgetStatus(stats.total);
  const percentageUsed = getPercentageUsed(stats.total);
  const isWarning = budgetStatus === "warning";
  const isExceeded = budgetStatus === "exceeded";

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
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your spending at a glance
          </p>
        </div>

        {/* Budget Warning/Exceeded Alert */}
        {monthlyBudget > 0 && (isWarning || isExceeded) && (
          <Alert
            className={`animate-slide-up border-l-4 ${
              isExceeded
                ? "border-l-destructive bg-destructive/5"
                : "border-l-yellow-500 bg-yellow-500/5"
            }`}
          >
            <div className="flex gap-4">
              {isExceeded ? (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertTitle
                  className={
                    isExceeded ? "text-destructive" : "text-yellow-700"
                  }
                >
                  {isExceeded ? "Budget Exceeded!" : "Budget Warning"}
                </AlertTitle>
                <AlertDescription
                  className={
                    isExceeded ? "text-destructive/80" : "text-yellow-600/80"
                  }
                >
                  {isExceeded ? (
                    <>
                      You have exceeded your monthly budget of{" "}
                      {formatAmount(monthlyBudget)}. Current spending:{" "}
                      {formatAmount(stats.total)}
                    </>
                  ) : (
                    <>
                      You've used {percentageUsed.toFixed(1)}% of your{" "}
                      {formatAmount(monthlyBudget)} budget. Only{" "}
                      {formatAmount(monthlyBudget - stats.total)} remaining.
                    </>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyBudget > 0 && (
            <Card
              className={`sm:col-span-2 lg:col-span-3 transition-all duration-300 hover:shadow-lg animate-fade-in ${
                isExceeded
                  ? "border-destructive/50 bg-destructive/5"
                  : isWarning
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : ""
              }`}
            >
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
                  <Progress value={percentageUsed} className="h-2" />
                  <p
                    className={`text-xs text-right font-medium ${
                      isExceeded
                        ? "text-destructive"
                        : isWarning
                        ? "text-yellow-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {percentageUsed.toFixed(1)}% used
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
