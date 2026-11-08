export type Currency = 'USD' | 'EUR' | 'VES';

export type ConversionDirection = 'TO_VES' | 'FROM_VES';

export type RateScheduleMode = 'current' | 'next';

export interface RateSnapshot {
  label?: string;
  short_label?: string;
  fecha_valor: string;
  fecha_valor_iso?: string | null;
  usd: number;
  eur: number;
}

export interface ExchangeRates {
  usd: number;
  eur: number;
  usdParalelo?: number;
  source: 'bcv-direct' | 'dolarapi' | 'cromstudio' | 'bcvtoday' | 'cache' | 'manual';
  sourceName: string;
  date: string;
  lastChecked: number;
  rates?: {
    current?: RateSnapshot;
    next?: RateSnapshot;
  };
  history?: RateSnapshot[];
}

export interface CalculationDetails {
  inputAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  baseResult: number;
  includeIVA: boolean;
  ivaAmount: number;
  includeIGTF: boolean;
  igtfAmount: number;
  totalResult: number;
}
