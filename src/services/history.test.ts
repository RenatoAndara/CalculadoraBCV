// Pruebas del historial interno de tasas — Autor: Renato Andara
import { describe, it, expect } from 'vitest';
import { fechaMasReciente, mezclarHistorial } from './history';
import type { ExchangeRates } from '../types';

const snap = (d: number, usd: number) => ({
  fecha_valor: `Día ${d}`,
  fecha_valor_iso: `2026-11-${String(d).padStart(2, '0')}T00:00:00-04:00`,
  usd, eur: usd * 1.1,
});

describe('mezclarHistorial', () => {
  it('no duplica fechas y ordena de la más reciente a la más antigua', () => {
    const h1 = mezclarHistorial([], [snap(16, 914), snap(17, 915)]);
    const h2 = mezclarHistorial(h1, [snap(17, 915.7476), snap(13, 911)]);
    expect(h2.map((e) => e.fecha)).toEqual(['2026-11-17', '2026-11-16', '2026-11-13']);
    expect(h2[0].usd).toBe(915.7476);
  });
  it('conserva como máximo 30 días', () => {
    const muchos = [...Array(40)].map((_, i) => ({
      fecha_valor: `d${i}`,
      fecha_valor_iso: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10),
      usd: 900 + i, eur: 1000 + i,
    }));
    const h = mezclarHistorial([], muchos);
    expect(h).toHaveLength(30);
    expect(h[0].usd).toBe(939);
  });
});

describe('fechaMasReciente', () => {
  it('toma la próxima tasa publicada si existe', () => {
    const r: ExchangeRates = {
      usd: 914, eur: 1010, source: 'bcv-direct', sourceName: '', date: 'Lunes, 16 Noviembre 2026', lastChecked: 0,
      rates: { current: snap(16, 914), next: snap(17, 915) },
    };
    expect(fechaMasReciente(r)).toBe('2026-11-17');
  });
});
