import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Expense, ExpenseFormData, CATEGORY_LABELS, CATEGORY_ICONS, ExpenseCategory } from '@/types/expense';

import { useCurrency } from '@/context/useCurrency';

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.enum(['food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'education', 'housing', 'other'] as const),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  expense_date: z.string().min(1, 'Date is required'),
});

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  onSubmit: (data: ExpenseFormData) => Promise<{ error: Error | null }>;
}

export function ExpenseForm({ open, onOpenChange, expense, onSubmit }: ExpenseFormProps) {
  const { symbol, convertToBeSaved, convertToDisplay } = useCurrency();
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: 'other',
      description: '',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    if (expense) {
      // expense.amount is stored in NGN (Base), we need to show it in Selected Currency
      setValue('amount', convertToDisplay(expense.amount));
      setValue('category', expense.category);
      setValue('description', expense.description || '');
      setValue('expense_date', expense.expense_date);
    } else {
      reset({
        amount: 0,
        category: 'other',
        description: '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [expense, setValue, reset]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    // If editing, amount might be unchanged, but if we are editing, we assume user is seeing the DISPLAY amount.
    // Actually when editing, we load the stored amount (NGN) into the form.
    // Wait, if we load NGN into the form, it will show NGN amount even if currency is USD.
    // We need to Convert To Display when loading existing expense too!

    // For now, let's fix submission first. User enters amount in current currency.
    const amountInBase = convertToBeSaved(data.amount);

    const { error } = await onSubmit({
      ...data,
      amount: amountInBase
    });

    if (!error) {
      onOpenChange(false);
      reset();
    }
  };

  const categories = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your expense.'
              : 'Record a new expense to track your spending.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                className="pl-8 h-12"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch('category')}
              onValueChange={(value: ExpenseCategory) => setValue('category', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[value]}</span>
                      <span>{label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input
              id="expense_date"
              type="date"
              {...register('expense_date')}
              className="h-12"
            />
            {errors.expense_date && (
              <p className="text-sm text-destructive">{errors.expense_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              {...register('description')}
              className="resize-none"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : isEditing ? (
                'Update Expense'
              ) : (
                'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
