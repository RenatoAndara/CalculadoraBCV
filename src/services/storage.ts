import type { ExchangeRates, RateScheduleMode } from '../types';

const RATES_STORAGE_KEY = 'bcv_cached_rates_v1';
const PREFS_STORAGE_KEY = 'bcv_user_prefs_v1';

// Tasas por defecto en caso de primer arranque absoluto sin internet
const DEFAULT_FALLBACK_RATES: ExchangeRates = {
  usd: 897.5383,
  eur: 1001.18602288,
  usdParalelo: 995.46,
  source: 'cache',
  sourceName: 'Respaldo Inicial',
  date: 'Lunes, 09 Noviembre 2026',
  lastChecked: Date.now(),
  rates: {
    current: {
      label: 'Tasa Vigente (Viernes 06 Nov)',
      short_label: '06 Nov (Vigente)',
      fecha_valor: 'Viernes, 06 Noviembre 2026',
      fecha_valor_iso: '2026-11-06T00:00:00-04:00',
      usd: 895.12,
      eur: 998.40,
    },
    next: {
      label: 'Tasa Publicada (Lunes 09 Nov)',
      short_label: '09 Nov (Próx. Día)',
      fecha_valor: 'Lunes, 09 Noviembre 2026',
      fecha_valor_iso: '2026-11-09T00:00:00-04:00',
      usd: 897.5383,
      eur: 1001.18602288,
    },
  },
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
  rateScheduleMode?: RateScheduleMode;
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
    rateScheduleMode: 'next',
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
