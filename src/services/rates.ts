import type { ExchangeRates } from '../types';
import { getStoredRates, saveRatesToStorage } from './storage';

// Utilidad para fetch con timeout estricto para evitar bloqueos en conexiones lentas
async function fetchWithTimeout(url: string, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache',
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Proveedor 1: DolarApi (ve.dolarapi.com)
 * Basado en la iniciativa Open Source venezolana
 */
async function fetchFromDolarApi(): Promise<ExchangeRates> {
  // Peticiones paralelas de Dólar oficial, Euro oficial y Paralelo
  const [resUsd, resEur, resParalelo] = await Promise.all([
    fetchWithTimeout('https://ve.dolarapi.com/v1/dolares/oficial'),
    fetchWithTimeout('https://ve.dolarapi.com/v1/euros/oficial'),
    fetchWithTimeout('https://ve.dolarapi.com/v1/dolares/paralelo').catch(() => null),
  ]);

  if (!resUsd.ok || !resEur.ok) {
    throw new Error(`DolarApi respondió con status USD:${resUsd.status} EUR:${resEur.status}`);
  }

  const dataUsd = await resUsd.json();
  const dataEur = await resEur.json();
  let paraleloValue: number | undefined;

  if (resParalelo && resParalelo.ok) {
    try {
      const dataParalelo = await resParalelo.json();
      if (typeof dataParalelo.promedio === 'number') {
        paraleloValue = dataParalelo.promedio;
      }
    } catch {
      // Ignore paralelo error
    }
  }

  const usd = Number(dataUsd.promedio);
  const eur = Number(dataEur.promedio);

  if (!usd || !eur || isNaN(usd) || isNaN(eur)) {
    throw new Error('Datos incompletos o inválidos de DolarApi');
  }

  return {
    usd,
    eur,
    usdParalelo: paraleloValue,
    source: 'dolarapi',
    sourceName: 'BCV Oficial (DolarApi)',
    date: dataUsd.fechaActualizacion || new Date().toISOString(),
    lastChecked: Date.now(),
  };
}

/**
 * Proveedor 2: CromStudio API Pública (datos.cromstudio.com.ve)
 */
async function fetchFromCromStudio(): Promise<ExchangeRates> {
  const response = await fetchWithTimeout('https://datos.cromstudio.com.ve/tasa');
  if (!response.ok) {
    throw new Error(`CromStudio respondió con status ${response.status}`);
  }

  const data = await response.json();
  const usd = Number(data?.tasas?.USD);
  const eur = Number(data?.tasas?.EUR);

  if (!usd || !eur || isNaN(usd) || isNaN(eur)) {
    throw new Error('Estructura de tasas inválida en CromStudio');
  }

  return {
    usd,
    eur,
    source: 'cromstudio',
    sourceName: 'BCV Oficial (CromStudio)',
    date: data.fecha_valor || data.actualizado_el || new Date().toISOString(),
    lastChecked: Date.now(),
  };
}

/**
 * Proveedor 3: BCV Today (bcv.today)
 * Espejo estático de alta disponibilidad
 */
async function fetchFromBcvToday(): Promise<ExchangeRates> {
  const response = await fetchWithTimeout('https://bcv.today/api/v1/rate.json');
  if (!response.ok) {
    throw new Error(`BCV Today respondió con status ${response.status}`);
  }

  const data = await response.json();
  const usd = Number(data?.USD);
  const eur = Number(data?.EUR);

  if (!usd || !eur || isNaN(usd) || isNaN(eur)) {
    throw new Error('Estructura de tasas inválida en BCV Today');
  }

  return {
    usd,
    eur,
    source: 'bcvtoday',
    sourceName: 'BCV Oficial (bcv.today)',
    date: data.effective_date || data.updated_at || new Date().toISOString(),
    lastChecked: Date.now(),
  };
}

/**
 * Servicio unificado con Conmutación por Falla (Fallback)
 */
export async function getLiveRates(): Promise<{ rates: ExchangeRates; isOffline: boolean; errorNotice?: string }> {
  // Intentar Fuente 1: DolarApi
  try {
    const rates = await fetchFromDolarApi();
    saveRatesToStorage(rates);
    return { rates, isOffline: false };
  } catch (err1) {
    console.warn('Fallo en DolarApi, conmutando a CromStudio...', err1);
  }

  // Intentar Fuente 2: CromStudio
  try {
    const rates = await fetchFromCromStudio();
    saveRatesToStorage(rates);
    return { rates, isOffline: false };
  } catch (err2) {
    console.warn('Fallo en CromStudio, conmutando a BCV Today...', err2);
  }

  // Intentar Fuente 3: BCV Today
  try {
    const rates = await fetchFromBcvToday();
    saveRatesToStorage(rates);
    return { rates, isOffline: false };
  } catch (err3) {
    console.warn('Fallo en BCV Today, recurriendo a memoria local offline...', err3);
  }

  // Si todas las fuentes fallan (dispositivo sin internet o modo avión)
  const cached = getStoredRates();
  return {
    rates: cached,
    isOffline: true,
    errorNotice: 'Sin conexión a internet. Mostrando la última tasa guardada en el dispositivo.',
  };
}
