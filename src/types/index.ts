export type Currency = 'USD' | 'EUR' | 'VES';

export type ConversionDirection = 'TO_VES' | 'FROM_VES';

export interface ExchangeRates {
  usd: number;
  eur: number;
  usdParalelo?: number;
  source: 'dolarapi' | 'cromstudio' | 'bcvtoday' | 'cache' | 'manual';
  sourceName: string;
  date: string;
  lastChecked: number;
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
