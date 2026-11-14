/**
 * Tasas USDT/VES del mercado P2P de Binance (opcional, se activa con un interruptor)
 * Autor: Renato Andara (RA 2026)
 *
 * Usa el endpoint público que consume la propia web de Binance P2P. No requiere
 * llave ni tiene costo, pero NO es una API oficial documentada: Binance puede
 * cambiarlo sin aviso. Por eso todo falla con gracia y se conserva la última
 * tasa guardada.
 *
 * En Android se consulta con la conexión nativa (CapacitorHttp) porque desde
 * el WebView el navegador bloquearía la petición (CORS).
 */
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import type { UsdtRates, UsdtRefresh } from '../types';

const URL_P2P = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const CLAVE_CACHE = 'bcv_usdt_rates_v1';
/** Se promedian los N mejores anuncios de cada lado */
export const ANUNCIOS_A_PROMEDIAR = 10;

type Lado = 'BUY' | 'SELL';

interface AnuncioP2P {
  adv?: { price?: string };
}

/** Promedio de los primeros N precios válidos (los anuncios vienen ordenados del mejor al peor). */
export function promedioPrecios(anuncios: AnuncioP2P[], n = ANUNCIOS_A_PROMEDIAR): { promedio: number; cantidad: number } {
  const precios = anuncios
    .map((a) => Number(a?.adv?.price))
    .filter((p) => isFinite(p) && p > 0)
    .slice(0, n);
  if (!precios.length) return { promedio: 0, cantidad: 0 };
  const suma = precios.reduce((s, p) => s + p, 0);
  return { promedio: suma / precios.length, cantidad: precios.length };
}

async function consultarLado(lado: Lado): Promise<AnuncioP2P[]> {
  const cuerpo = {
    asset: 'USDT',
    fiat: 'VES',
    tradeType: lado,
    page: 1,
    rows: 20,
    payTypes: [],
    publisherType: null,
  };

  let datos: { code?: string; data?: AnuncioP2P[] };
  if (Capacitor.isNativePlatform()) {
    const r = await CapacitorHttp.post({
      url: URL_P2P,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: cuerpo,
      connectTimeout: 8000,
      readTimeout: 8000,
    });
    if (r.status < 200 || r.status >= 300) throw new Error(`Binance respondió ${r.status}`);
    datos = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
  } else {
    // En navegador puede fallar por CORS; se intenta igual
    const r = await fetch(URL_P2P, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    if (!r.ok) throw new Error(`Binance respondió ${r.status}`);
    datos = await r.json();
  }

  if (!Array.isArray(datos?.data)) throw new Error('Respuesta inesperada de Binance');
  return datos.data;
}

/** Consulta compra y venta en paralelo y guarda el resultado. */
export async function obtenerUsdtP2P(): Promise<UsdtRates> {
  const [compras, ventas] = await Promise.all([consultarLado('BUY'), consultarLado('SELL')]);
  const c = promedioPrecios(compras);
  const v = promedioPrecios(ventas);
  if (!c.promedio || !v.promedio) throw new Error('Binance no devolvió anuncios de USDT/VES');

  const tasas: UsdtRates = {
    compra: c.promedio,
    venta: v.promedio,
    promedio: (c.promedio + v.promedio) / 2,
    anuncios: Math.min(c.cantidad, v.cantidad),
    lastChecked: Date.now(),
  };
  guardarUsdt(tasas);
  return tasas;
}

export function leerUsdtGuardado(): UsdtRates | null {
  try {
    const raw = localStorage.getItem(CLAVE_CACHE);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.promedio > 0 ? d : null;
  } catch {
    return null;
  }
}

function guardarUsdt(t: UsdtRates): void {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(t));
  } catch {
    /* sin almacenamiento: se sigue sin caché */
  }
}

/**
 * ¿Toca volver a consultar? Modo "al abrir": si pasaron más de 5 min (evita
 * repetir al alternar apps). Modo 30/45: si pasó ese intervalo.
 */
export function usdtVencido(t: UsdtRates | null, modo: UsdtRefresh, ahora = Date.now()): boolean {
  if (!t) return true;
  const minutos = modo === 'open' ? 5 : modo;
  return ahora - t.lastChecked >= minutos * 60_000;
}
