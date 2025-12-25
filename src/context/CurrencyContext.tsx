import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

// Exchange rates relative to NGN (Base Currency)
const EXCHANGE_RATES: Record<Currency, number> = {
    NGN: 1,
    USD: 1500,
    EUR: 1650,
    GBP: 1900,
};

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatAmount: (amount: number) => string;
    convertToBeSaved: (amount: number) => number;
    convertToDisplay: (amount: number) => number;
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

    // Convert from Base (NGN) to Selected Currency for Display
    const convertToDisplay = (amount: number) => {
        if (currency === 'NGN') return amount;
        return amount / EXCHANGE_RATES[currency];
    };

    // Convert from Selected Currency to Base (NGN) for Saving
    const convertToBeSaved = (amount: number) => {
        if (currency === 'NGN') return amount;
        return amount * EXCHANGE_RATES[currency];
    };

    const formatAmount = (amount: number) => {
        const converted = convertToDisplay(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'narrowSymbol',
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatAmount,
            convertToBeSaved,
            convertToDisplay,
            symbol: CURRENCY_SYMBOLS[currency]
        }}>
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
