import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type BudgetStatus = 'safe' | 'warning' | 'exceeded';

interface BudgetContextType {
    monthlyBudget: number;
    setMonthlyBudget: (amount: number) => void;
    getPercentageUsed: (currentExpenses: number) => number;
    getBudgetStatus: (currentExpenses: number) => BudgetStatus;
    shouldShowWarning: (currentExpenses: number) => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'spendwise_monthly_budget';
const WARNING_THRESHOLD = 80; // Show warning at 80% of budget

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

    const getBudgetStatus = (currentExpenses: number): BudgetStatus => {
        if (monthlyBudget === 0) return 'safe';
        const percentage = getPercentageUsed(currentExpenses);
        if (percentage >= 100) return 'exceeded';
        if (percentage >= WARNING_THRESHOLD) return 'warning';
        return 'safe';
    };

    const shouldShowWarning = (currentExpenses: number) => {
        return getBudgetStatus(currentExpenses) !== 'safe';
    };

    return (
        <BudgetContext.Provider value={{ monthlyBudget, setMonthlyBudget, getPercentageUsed, getBudgetStatus, shouldShowWarning }}>
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
