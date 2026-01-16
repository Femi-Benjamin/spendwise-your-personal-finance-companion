import { useEffect, useRef } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { useExpenses } from './useExpenses';
import { startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export function useBudgetWarning() {
  const { monthlyBudget, getBudgetStatus } = useBudget();
  const lastStatusRef = useRef<string | null>(null);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { expenses } = useExpenses({
    startDate: monthStart,
    endDate: monthEnd,
  });

  useEffect(() => {
    if (monthlyBudget === 0) return;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const status = getBudgetStatus(totalExpenses);

    // Only show notification if status changed
    if (lastStatusRef.current !== status) {
      if (status === 'exceeded') {
        toast.error('Budget Exceeded!', {
          description: `You have exceeded your monthly budget. Please review your expenses.`,
          duration: 6000,
        });
      } else if (status === 'warning') {
        const percentage = (totalExpenses / monthlyBudget) * 100;
        const remaining = monthlyBudget - totalExpenses;
        
        toast.warning('Budget Warning', {
          description: `You've used ${percentage.toFixed(1)}% of your budget. Only ₦${remaining.toFixed(2)} remaining.`,
          duration: 5000,
        });
      }
      lastStatusRef.current = status;
    }
  }, [expenses, monthlyBudget, getBudgetStatus]);
}
