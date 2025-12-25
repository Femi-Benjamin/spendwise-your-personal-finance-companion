import { format } from 'date-fns';
import { Expense, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const { formatAmount } = useCurrency();
  const categoryColor = CATEGORY_COLORS[expense.category];

  return (
    <Card className="group p-4 hover:shadow-md transition-all duration-200 border border-border">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          {CATEGORY_ICONS[expense.category]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-lg">
                {formatAmount(expense.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                {CATEGORY_LABELS[expense.category]}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                {format(new Date(expense.expense_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {expense.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {expense.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(expense)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(expense.id)}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
