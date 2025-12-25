import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Expense, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/expense';
import { useCurrency } from '@/context/CurrencyContext';

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const { formatAmount } = useCurrency();
  const recentExpenses = expenses.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Expenses</CardTitle>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentExpenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No expenses yet. Start tracking!
          </p>
        ) : (
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 py-2"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20` }}
                >
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {expense.description || CATEGORY_LABELS[expense.category]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expense.expense_date), 'MMM d')}
                  </p>
                </div>
                <p className="font-semibold text-foreground flex-shrink-0">
                  {formatAmount(expense.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
