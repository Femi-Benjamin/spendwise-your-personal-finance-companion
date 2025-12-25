import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BudgetContextType {
    monthlyBudget: number;
    setMonthlyBudget: (amount: number) => void;
    getPercentageUsed: (currentExpenses: number) => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'spendwise_monthly_budget';

export function BudgetProvider({ children }: { children: ReactNode }) {
    const [monthlyBudget, setMonthlyBudgetState] = useState<number>(0);

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            setMonthlyBudgetState(Number(stored));
        }
    }, []);

    const setMonthlyBudget = (amount: number) => {
        setMonthlyBudgetState(amount);
        localStorage.setItem(LOCAL_STORAGE_KEY, amount.toString());
    };

    const getPercentageUsed = (currentExpenses: number) => {
        if (monthlyBudget === 0) return 0;
        return Math.min((currentExpenses / monthlyBudget) * 100, 100);
    };

    return (
        <BudgetContext.Provider value={{ monthlyBudget, setMonthlyBudget, getPercentageUsed }}>
            {children}
        </BudgetContext.Provider>
    );
}

export function useBudget() {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
}
