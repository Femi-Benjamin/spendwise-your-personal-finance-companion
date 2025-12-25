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

  const getLocalExpenses = (): Expense[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse local expenses", e);
      return [];
    }
  };

  const saveLocalExpenses = (newExpenses: Expense[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newExpenses));
  };

  const fetchExpenses = useCallback(async () => {
    const isLocalUser = user?.id === "local-user";

    // Allow fetching if it's a local user OR a valid UUID
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!user || (!isLocalUser && !isValidUUID(user.id))) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isLocalUser) {
      // Local Storage Mode
      let data = getLocalExpenses();

      // Filter by user_id check (implicitly all local expenses belong to local-user)
      data = data.filter(item => item.user_id === 'local-user');

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
      return;
    }

    // Remote (Supabase) Mode
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });

      if (options.category && options.category !== "all") {
        query = query.eq("category", options.category);
      }

      if (options.startDate) {
        query = query.gte(
          "expense_date",
          options.startDate.toISOString().split("T")[0]
        );
      }

      if (options.endDate) {
        query = query.lte(
          "expense_date",
          options.endDate.toISOString().split("T")[0]
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData: Expense[] = (data || []).map((item) => ({
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
    } catch (error: unknown) {
      toast({
        title: "Error fetching expenses",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, options.category, options.startDate, options.endDate, toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (data: ExpenseFormData) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (user.id === "local-user") {
      try {
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          user_id: "local-user",
          amount: data.amount,
          category: data.category,
          description: data.description || null,
          expense_date: data.expense_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const current = getLocalExpenses();
        saveLocalExpenses([newExpense, ...current]);

        toast({
          title: "Expense added",
          description: "Your expense has been recorded locally.",
        });

        await fetchExpenses();
        return { error: null };
      } catch (e) {
        return { error: e };
      }
    }

    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        expense_date: data.expense_date,
      });

      if (error) throw error;

      toast({
        title: "Expense added",
        description: "Your expense has been recorded successfully.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: unknown) {
      toast({
        title: "Error adding expense",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateExpense = async (id: string, data: Partial<ExpenseFormData>) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (user.id === "local-user") {
      try {
        const current = getLocalExpenses();
        const index = current.findIndex(e => e.id === id);

        if (index === -1) throw new Error("Expense not found");

        const updated = { ...current[index], ...data, updated_at: new Date().toISOString() };
        // Ensure description is string | null
        if (data.description === undefined && current[index].description === null) {
          updated.description = null;
        }

        current[index] = updated as Expense;
        saveLocalExpenses(current);

        toast({
          title: "Expense updated",
          description: "Your expense has been updated locally.",
        });

        await fetchExpenses();
        return { error: null };
      } catch (e) {
        return { error: e };
      }
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          ...data,
          description: data.description || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: unknown) {
      toast({
        title: "Error updating expense",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (user.id === "local-user") {
      try {
        const current = getLocalExpenses();
        const filtered = current.filter(e => e.id !== id);
        saveLocalExpenses(filtered);

        toast({
          title: "Expense deleted",
          description: "Your expense has been removed locally.",
        });

        await fetchExpenses();
        return { error: null };
      } catch (e) {
        return { error: e };
      }
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Expense deleted",
        description: "Your expense has been removed.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (error: unknown) {
      toast({
        title: "Error deleting expense",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
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
