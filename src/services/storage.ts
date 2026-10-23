import type { ExchangeRates } from '../types';

const RATES_STORAGE_KEY = 'bcv_cached_rates_v1';
const PREFS_STORAGE_KEY = 'bcv_user_prefs_v1';

// Tasas por defecto en caso de primer arranque absoluto sin internet
const DEFAULT_FALLBACK_RATES: ExchangeRates = {
  usd: 886.2271,
  eur: 993.0883,
  usdParalelo: 995.46,
  source: 'cache',
  sourceName: 'Respaldo Inicial',
  date: new Date().toISOString(),
  lastChecked: Date.now(),
};

export function getStoredRates(): ExchangeRates {
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.usd === 'number' && typeof parsed.eur === 'number') {
        return {
          ...parsed,
          source: 'cache',
          sourceName: parsed.sourceName || 'Caché Local Offline',
        };
      }
    }
  } catch (err) {
    console.warn('Error reading rates from localStorage:', err);
  }
  return DEFAULT_FALLBACK_RATES;
}

export function saveRatesToStorage(rates: ExchangeRates): void {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
  } catch (err) {
    console.warn('Error saving rates to localStorage:', err);
  }
}

export interface UserPrefs {
  lastCurrency: 'USD' | 'EUR';
  direction: 'TO_VES' | 'FROM_VES';
  includeIVA: boolean;
  includeIGTF: boolean;
}

export function getStoredPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading prefs:', err);
  }
  return {
    lastCurrency: 'USD',
    direction: 'TO_VES',
    includeIVA: false,
    includeIGTF: false,
  };
}

export function savePrefsToStorage(prefs: Partial<UserPrefs>): void {
  try {
    const current = getStoredPrefs();
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (err) {
    console.warn('Error saving prefs:', err);
  }
}
