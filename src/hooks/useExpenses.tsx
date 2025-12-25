import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Expense, ExpenseFormData, ExpenseCategory } from "@/types/expense";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface UseExpensesOptions {
  category?: ExpenseCategory | "all";
  startDate?: Date;
  endDate?: Date;
}

const LOCAL_STORAGE_KEY = "spendwise_local_expenses";

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Dynamic Local Storage Key based on User ID
  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `spendwise_expenses_${user.id}`;
  }, [user]);

  const getLocalExpenses = useCallback((): Expense[] => {
    const key = getStorageKey();
    if (!key) return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse local expenses", e);
      return [];
    }
  }, [getStorageKey]);

  const saveLocalExpenses = useCallback((newExpenses: Expense[]) => {
    const key = getStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(newExpenses));
    }
  }, [getStorageKey]);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Hybrid Strategy: Always load from Local Storage keyed by User ID
    // This provides "Individual Accounts" + "Offline Capabilities"
    let data = getLocalExpenses();

    if (options.category && options.category !== "all") {
      data = data.filter((item) => item.category === options.category);
    }

    if (options.startDate) {
      const start = options.startDate.toISOString().split("T")[0];
      data = data.filter((item) => item.expense_date >= start);
    }

    if (options.endDate) {
      const end = options.endDate.toISOString().split("T")[0];
      data = data.filter((item) => item.expense_date <= end);
    }

    // Sort descending
    data.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());

    setExpenses(data);
    setLoading(false);
  }, [user, options.category, options.startDate, options.endDate, getLocalExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (data: ExpenseFormData) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        expense_date: data.expense_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const current = getLocalExpenses();
      // saveLocalExpenses is a callback so we need to be careful, but it's fine here.
      // Actually getLocalExpenses returns the array.
      const key = getStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify([newExpense, ...current]));
      }

      toast({
        title: "Expense added",
        description: "Your expense has been recorded.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const updateExpense = async (id: string, data: Partial<ExpenseFormData>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const current = getLocalExpenses();
      const index = current.findIndex(e => e.id === id);

      if (index === -1) throw new Error("Expense not found");

      const updated = { ...current[index], ...data, updated_at: new Date().toISOString() };
      if (data.description === undefined && current[index].description === null) {
        updated.description = null;
      }

      current[index] = updated as Expense;

      const key = getStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify(current));
      }

      toast({
        title: "Expense updated",
        description: "Your expense has been updated.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const current = getLocalExpenses();
      const filtered = current.filter(e => e.id !== id);

      const key = getStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify(filtered));
      }

      toast({
        title: "Expense deleted",
        description: "Your expense has been removed.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (e) {
      return { error: e };
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
