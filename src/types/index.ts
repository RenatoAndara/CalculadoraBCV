/** Divisas que se pueden convertir a/desde bolívares */
export type Divisa = 'USD' | 'EUR' | 'USDT';
export type Currency = Divisa | 'VES';

/** Frecuencia de actualización de USDT: al abrir la app, o cada N minutos */
export type UsdtRefresh = 'open' | 30 | 45;

/** Promedios del mercado P2P de Binance (USDT/VES) */
export interface UsdtRates {
  /** Promedio de lo que se PAGA por 1 USDT (anuncios donde el usuario compra) */
  compra: number;
  /** Promedio de lo que se RECIBE por 1 USDT (anuncios donde el usuario vende) */
  venta: number;
  /** Punto medio entre compra y venta: se usa para convertir */
  promedio: number;
  /** Cantidad de anuncios promediados por lado */
  anuncios: number;
  lastChecked: number;
}

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
