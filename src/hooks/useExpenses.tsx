import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, ExpenseFormData, ExpenseCategory } from '@/types/expense';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface UseExpensesOptions {
  category?: ExpenseCategory | 'all';
  startDate?: Date;
  endDate?: Date;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false });

      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }

      if (options.startDate) {
        query = query.gte('expense_date', options.startDate.toISOString().split('T')[0]);
      }

      if (options.endDate) {
        query = query.lte('expense_date', options.endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Expense type
      const transformedData: Expense[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        amount: Number(item.amount),
        category: item.category as ExpenseCategory,
        description: item.description,
        expense_date: item.expense_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setExpenses(transformedData);
    } catch (error: any) {
      toast({
        title: 'Error fetching expenses',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, options.category, options.startDate, options.endDate, toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (data: ExpenseFormData) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase.from('expenses').insert({
        user_id: user.id,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        expense_date: data.expense_date,
      });

      if (error) throw error;

      toast({
        title: 'Expense added',
        description: 'Your expense has been recorded successfully.',
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error adding expense',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updateExpense = async (id: string, data: Partial<ExpenseFormData>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          ...data,
          description: data.description || null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Expense updated',
        description: 'Your expense has been updated successfully.',
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error updating expense',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Expense deleted',
        description: 'Your expense has been removed.',
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error deleting expense',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
