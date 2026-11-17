/**
 * Historial interno de tasas BCV (máximo 30 días) guardado en el teléfono.
 * Autor: Renato Andara (RA 2026)
 *
 * Cada vez que llegan tasas nuevas se mezclan con las guardadas, una entrada por
 * fecha valor. Funciona sin conexión y no depende de que el servidor conserve
 * el historial.
 */
import type { ExchangeRates, RateSnapshot } from '../types';
import { fechaDeSnapshot } from './schedule';

const CLAVE = 'bcv_historial_v1';
export const MAX_DIAS = 30;

export interface EntradaHistorial {
  /** AAAA-MM-DD */
  fecha: string;
  fecha_valor: string;
  usd: number;
  eur: number;
}

/** Todas las tasas que trae una respuesta (historial + vigente + próxima). */
function snapshotsDe(rates: ExchangeRates): RateSnapshot[] {
  return [
    ...(rates.history || []),
    ...(rates.rates?.current ? [rates.rates.current] : []),
    ...(rates.rates?.next ? [rates.rates.next] : []),
  ];
}

/** Fecha valor más reciente (AAAA-MM-DD) contenida en una respuesta, o null. */
export function fechaMasReciente(rates: ExchangeRates | null | undefined): string | null {
  if (!rates) return null;
  const fechas = snapshotsDe(rates)
    .map(fechaDeSnapshot)
    .concat(fechaDeSnapshot({ fecha_valor: rates.date, fecha_valor_iso: null }))
    .filter((f): f is string => Boolean(f))
    .sort();
  return fechas.length ? fechas[fechas.length - 1] : null;
}

/** Mezcla (sin duplicar fechas) y conserva solo las últimas `max` fechas. */
export function mezclarHistorial(
  actual: EntradaHistorial[],
  nuevas: RateSnapshot[],
  max = MAX_DIAS,
): EntradaHistorial[] {
  const porFecha = new Map(actual.map((e) => [e.fecha, e]));
  for (const s of nuevas) {
    const fecha = fechaDeSnapshot(s);
    if (!fecha || !(s.usd > 0) || !(s.eur > 0)) continue;
    porFecha.set(fecha, { fecha, fecha_valor: s.fecha_valor, usd: s.usd, eur: s.eur });
  }
  return [...porFecha.values()].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, max);
}

export function leerHistorial(): EntradaHistorial[] {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

/** Guarda las tasas recibidas y devuelve el historial actualizado. */
export function actualizarHistorial(rates: ExchangeRates): EntradaHistorial[] {
  const h = mezclarHistorial(leerHistorial(), snapshotsDe(rates));
  try {
    localStorage.setItem(CLAVE, JSON.stringify(h));
  } catch {
    /* sin almacenamiento disponible */
  }
  return h;
}
