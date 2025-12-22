import { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useExpenses } from '@/hooks/useExpenses';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';
import { Wallet, TrendingUp, Receipt, Loader2 } from 'lucide-react';
import { ExpenseCategory } from '@/types/expense';

export default function Dashboard() {
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your spending at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total This Month"
            value={`₦${stats.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            subtitle={`${stats.count} transactions`}
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Average Expense"
            value={`₦${stats.average.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
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
          <CategoryChart data={stats.categoryData} />
          <RecentExpenses expenses={expenses} />
        </div>
      </div>
    </AppLayout>
  );
}
