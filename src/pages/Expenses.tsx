import { useState, useMemo } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrency } from '@/context/CurrencyContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2, Receipt } from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseFormData } from '@/types/expense';

export default function Expenses() {
  const { formatAmount } = useCurrency();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterOptions = useMemo(() => ({
    category,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  }), [category, startDate, endDate]);

  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses(filterOptions);

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    if (editingExpense) {
      return updateExpense(editingExpense.id, data);
    }
    return addExpense(data);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteExpense(deleteId);
      setDeleteId(null);
    }
  };

  const handleClearFilters = () => {
    setCategory('all');
    setStartDate('');
    setEndDate('');
  };

  const totalFiltered = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your expenses</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        <ExpenseFilters
          category={category}
          startDate={startDate}
          endDate={endDate}
          onCategoryChange={setCategory}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={handleClearFilters}
        />

        {expenses.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} found
            </p>
            <p className="font-medium text-foreground">
              Total: {formatAmount(totalFiltered)}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {category !== 'all' || startDate || endDate
                ? 'No expenses match your current filters. Try adjusting them.'
                : 'Start tracking your spending by adding your first expense.'}
            </p>
            {category === 'all' && !startDate && !endDate && (
              <Button onClick={() => handleOpenForm()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Expense
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleOpenForm}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
