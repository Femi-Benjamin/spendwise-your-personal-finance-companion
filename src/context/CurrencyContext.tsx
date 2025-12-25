import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatAmount: (amount: number) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
};

const LOCAL_STORAGE_KEY = 'spendwise_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('NGN');

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as Currency;
        if (stored && CURRENCY_SYMBOLS[stored]) {
            setCurrencyState(stored);
        }
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem(LOCAL_STORAGE_KEY, c);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'narrowSymbol',
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, symbol: CURRENCY_SYMBOLS[currency] }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
