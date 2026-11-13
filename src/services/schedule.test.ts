// Pruebas de clasificación Vigente Hoy / Próx. Día — Autor: Renato Andara
import { describe, it, expect } from 'vitest';
import { clasificarTasas, fechaDeSnapshot, hoyCaracas } from './schedule';
import type { ExchangeRates } from '../types';

const snap = (iso: string, texto: string, usd: number) => ({
  fecha_valor: texto, fecha_valor_iso: `${iso}T00:00:00-04:00`, usd, eur: usd * 1.1,
});
const jue12 = snap('2026-11-12', 'Jueves, 12 Noviembre 2026', 904.4485);
const vie13 = snap('2026-11-13', 'Viernes, 13 Noviembre 2026', 911.6243);
const lun16 = snap('2026-11-16', 'Lunes, 16 Noviembre 2026', 915.1);

const base = (extra: Partial<ExchangeRates>): ExchangeRates => ({
  usd: 0, eur: 0, source: 'bcv-direct', sourceName: 'x', date: '', lastChecked: 0, ...extra,
});
// Caso real del 13/11/2026: el JSON llamaba "vigente" al 12 y "próximo" al 13
const jsonReal = base({ rates: { current: jue12, next: vie13 }, history: [jue12, vie13] });
const en = (fechaHora: string) => new Date(`${fechaHora}-04:00`);

describe('clasificarTasas', () => {
  it('viernes 13 en la mañana: el 13 es la vigente y no hay próximo día', () => {
    const r = clasificarTasas(jsonReal, en('2026-11-13T09:00:00'));
    expect(r.current?.usd).toBe(911.6243);
    expect(r.current?.short_label).toBe('Vigente Hoy');
    expect(r.next).toBeUndefined();
  });

  it('viernes 13 después de las 4 pm, ya publicada la del lunes 16', () => {
    const json = base({ rates: { current: vie13, next: lun16 }, history: [jue12, vie13, lun16] });
    const r = clasificarTasas(json, en('2026-11-13T17:00:00'));
    expect(r.current?.usd).toBe(911.6243);
    expect(r.next?.usd).toBe(915.1);
    expect(r.next?.short_label).toBe('Próx. Día · Lun 16/11');
  });

  it('sábado y domingo: sigue vigente la del viernes y próxima la del lunes', () => {
    const json = base({ rates: { current: vie13, next: lun16 }, history: [vie13, lun16] });
    const r = clasificarTasas(json, en('2026-11-15T10:00:00'));
    expect(r.current?.fecha_valor).toContain('13');
    expect(r.next?.fecha_valor).toContain('16');
  });

  it('lunes 16 a las 7 am, sin descargar nada nuevo: la del 16 pasa sola a vigente', () => {
    const json = base({ rates: { current: vie13, next: lun16 }, history: [vie13, lun16] });
    const r = clasificarTasas(json, en('2026-11-16T07:00:00'));
    expect(r.current?.usd).toBe(915.1);
    expect(r.next).toBeUndefined();
  });

  it('jueves 12 en la tarde con la del 13 publicada: dos pestañas', () => {
    const r = clasificarTasas(jsonReal, en('2026-11-12T16:30:00'));
    expect(r.current?.usd).toBe(904.4485);
    expect(r.next?.usd).toBe(911.6243);
  });

  it('usa el texto de la fecha cuando falta la fecha ISO', () => {
    expect(fechaDeSnapshot({ fecha_valor: 'Miércoles, 2 de Diciembre de 2026', fecha_valor_iso: null }))
      .toBe('2026-12-02');
  });

  it('la fecha de hoy se calcula en hora de Caracas', () => {
    // 01:30 UTC del 14 = 21:30 del 13 en Caracas
    expect(hoyCaracas(new Date('2026-11-14T01:30:00Z'))).toBe('2026-11-13');
  });
});
