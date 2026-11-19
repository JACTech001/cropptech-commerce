"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CurrencyContext = createContext(null);
const STORAGE_KEY = "cropptech-currency";
const RATE_CACHE_KEY = "cropptech-fx-rates";
const CURRENCIES = [
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
];

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("NGN");
  const [rates, setRates] = useState({ NGN: 1 });
  const [rateDate, setRateDate] = useState("");
  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(STORAGE_KEY);
      if (CURRENCIES.some((item) => item.code === savedCurrency)) setCurrency(savedCurrency);
      const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || "null");
      if (cached?.rates && cached?.savedAt && Date.now() - cached.savedAt < 12 * 60 * 60 * 1000) {
        setRates(cached.rates);
        setRateDate(cached.date || "");
        setRatesReady(true);
        return;
      }
    } catch {}
    let active = true;
    async function loadRates() {
      try {
        const response = await fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=NGN,GBP,EUR,CAD");
        if (!response.ok) throw new Error("Exchange rates are currently unavailable.");
        const rows = await response.json();
        const usdToNgn = rows.find((row) => row.quote === "NGN")?.rate;
        if (!usdToNgn) throw new Error("NGN reference rate is unavailable.");
        const nextRates = { NGN: 1, USD: 1 / usdToNgn };
        for (const code of ["GBP", "EUR", "CAD"]) {
          const usdRate = rows.find((row) => row.quote === code)?.rate;
          if (usdRate) nextRates[code] = usdRate / usdToNgn;
        }
        if (active) {
          setRates(nextRates);
          setRateDate(rows[0]?.date || "");
          setRatesReady(true);
          try { localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rates: nextRates, date: rows[0]?.date || "", savedAt: Date.now() })); } catch {}
        }
      } catch {
        if (active) setRatesReady(true);
      }
    }
    loadRates();
    return () => { active = false; };
  }, []);

  const chooseCurrency = (nextCurrency) => {
    setCurrency(nextCurrency);
    try { localStorage.setItem(STORAGE_KEY, nextCurrency); } catch {}
  };

  const value = useMemo(() => ({
    currency, chooseCurrency, rates, rateDate, ratesReady, currencies: CURRENCIES,
    formatPrice(amount) {
      if (amount == null) return "Price to be confirmed";
      const converted = currency === "NGN" ? amount : rates[currency] ? amount * rates[currency] : null;
      if (converted == null) return "Rate unavailable";
      return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(converted);
    },
  }), [currency, rates, rateDate, ratesReady]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency must be used inside CurrencyProvider");
  return value;
}

export function CurrencySelector() {
  const { currency, chooseCurrency, currencies, ratesReady, rates } = useCurrency();
  return (
    <label className="currency-selector" aria-label="Display currency">
      <span>DISPLAY</span>
      <select value={currency} onChange={(event) => chooseCurrency(event.target.value)} aria-label="Choose display currency">
        {currencies.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
      </select>
      {currency !== "NGN" && !rates[currency] && ratesReady ? <span className="currency-unavailable">RATE N/A</span> : null}
    </label>
  );
}

export function ProductPrice({ amount, className = "" }) {
  const { formatPrice, currency, ratesReady, rateDate } = useCurrency();
  return (
    <span className={className}>
      {formatPrice(amount)}
      {amount != null && currency !== "NGN" ? (
        <small className="currency-estimate">{ratesReady ? "EST. REFERENCE RATE" : "LOADING RATE"}{rateDate ? ` · ${rateDate}` : ""}</small>
      ) : null}
    </span>
  );
}
