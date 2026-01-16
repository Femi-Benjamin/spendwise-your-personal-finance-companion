import { createContext, useEffect, useState, ReactNode } from "react";
import {
  fetchExchangeRates,
  DEFAULT_EXCHANGE_RATES,
  CACHE_DURATION,
  type Currency,
} from "@/lib/exchangeRates";

export type { Currency };

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatAmount: (amount: number) => string;
  convertToBeSaved: (amount: number) => number;
  convertToDisplay: (amount: number) => number;
  symbol: string;
  exchangeRates: Record<Currency, number>;
  ratesLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export { CurrencyContext };

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const LOCAL_STORAGE_KEY = "spendwise_currency";
const RATES_CACHE_KEY = "spendwise_exchange_rates";
const RATES_CACHE_TIMESTAMP_KEY = "spendwise_rates_timestamp";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("NGN");
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(
    DEFAULT_EXCHANGE_RATES
  );
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as Currency;
    if (stored && CURRENCY_SYMBOLS[stored]) {
      setCurrencyState(stored);
    }
  }, []);

  // Fetch exchange rates on mount and periodically
  useEffect(() => {
    const loadRates = async () => {
      setRatesLoading(true);

      // Check if we have cached rates and they're still fresh
      const cachedTimestamp = localStorage.getItem(RATES_CACHE_TIMESTAMP_KEY);
      if (cachedTimestamp) {
        const cacheAge = Date.now() - Number(cachedTimestamp);
        if (cacheAge < CACHE_DURATION) {
          // Use cached rates
          const cachedRates = localStorage.getItem(RATES_CACHE_KEY);
          if (cachedRates) {
            try {
              setExchangeRates(JSON.parse(cachedRates));
              setRatesLoading(false);
              return;
            } catch {
              // Fall through to fetch new rates
            }
          }
        }
      }

      // Fetch new rates
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
      setRatesLoading(false);
    };

    loadRates();

    // Refresh rates every hour
    const interval = setInterval(loadRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(LOCAL_STORAGE_KEY, c);
  };

  // Convert from Base (NGN) to Selected Currency for Display
  const convertToDisplay = (amount: number) => {
    if (currency === "NGN") return amount;
    return amount / exchangeRates[currency];
  };

  // Convert from Selected Currency to Base (NGN) for Saving
  const convertToBeSaved = (amount: number) => {
    if (currency === "NGN") return amount;
    return amount * exchangeRates[currency];
  };

  const formatAmount = (amount: number) => {
    const converted = convertToDisplay(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      currencyDisplay: "narrowSymbol",
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertToBeSaved,
        convertToDisplay,
        symbol: CURRENCY_SYMBOLS[currency],
        exchangeRates,
        ratesLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
