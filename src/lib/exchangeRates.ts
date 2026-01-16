export type Currency = "NGN" | "USD" | "EUR" | "GBP";

// Default exchange rates (fallback if API fails)
export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 1500,
  EUR: 1650,
  GBP: 1900,
};

const RATES_CACHE_KEY = "spendwise_exchange_rates";
const RATES_CACHE_TIMESTAMP_KEY = "spendwise_rates_timestamp";
export const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Fetch real-time exchange rates from exchangerate-api.com
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  try {
    // Using Open Exchange Rates API (free tier available)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/NGN"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();
    const rates = {
      NGN: 1,
      USD: 1 / data.rates.USD,
      EUR: 1 / data.rates.EUR,
      GBP: 1 / data.rates.GBP,
    };

    // Cache the rates
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(RATES_CACHE_TIMESTAMP_KEY, Date.now().toString());

    return rates;
  } catch (error) {
    console.warn(
      "Failed to fetch live exchange rates, using cached or default rates",
      error
    );

    // Try to use cached rates if available
    const cachedRates = localStorage.getItem(RATES_CACHE_KEY);
    if (cachedRates) {
      try {
        return JSON.parse(cachedRates);
      } catch {
        return DEFAULT_EXCHANGE_RATES;
      }
    }

    return DEFAULT_EXCHANGE_RATES;
  }
}
