// Pruebas del cálculo de USDT P2P y del formato de copiado — Autor: Renato Andara
import { describe, it, expect } from 'vitest';
import { promedioPrecios, usdtVencido } from './usdt';
import { formatCurrency, formatForCopy } from '../utils/formatters';

const formatCurrencyLike = (n: number) => formatCurrency(n, 'VES').replace(/\./g, '');

const anuncio = (price: string) => ({ adv: { price } });

describe('promedioPrecios', () => {
  it('promedia solo los 10 mejores anuncios', () => {
    const lista = [...Array(10)].map(() => anuncio('1000')).concat([anuncio('5000')]);
    expect(promedioPrecios(lista)).toEqual({ promedio: 1000, cantidad: 10 });
  });
  it('ignora precios vacíos o inválidos', () => {
    expect(promedioPrecios([anuncio('1050.5'), anuncio(''), anuncio('abc'), anuncio('1049.5')]))
      .toEqual({ promedio: 1050, cantidad: 2 });
  });
  it('sin anuncios devuelve 0', () => {
    expect(promedioPrecios([])).toEqual({ promedio: 0, cantidad: 0 });
  });
});

describe('usdtVencido', () => {
  const t = { compra: 1, venta: 1, promedio: 1, anuncios: 10, lastChecked: 0 };
  const min = 60_000;
  it('modo cada 30 min', () => {
    expect(usdtVencido(t, 30, 29 * min)).toBe(false);
    expect(usdtVencido(t, 30, 30 * min)).toBe(true);
  });
  it('modo cada 45 min', () => {
    expect(usdtVencido(t, 45, 44 * min)).toBe(false);
    expect(usdtVencido(t, 45, 45 * min)).toBe(true);
  });
  it('modo al abrir: no repite antes de 5 min', () => {
    expect(usdtVencido(t, 'open', 4 * min)).toBe(false);
    expect(usdtVencido(t, 'open', 5 * min)).toBe(true);
  });
  it('sin datos guardados siempre consulta', () => {
    expect(usdtVencido(null, 45)).toBe(true);
  });
});

describe('formatForCopy', () => {
  it('sin separador de miles y con coma decimal', () => {
    expect(formatForCopy(45581.2153)).toBe('45581,22');
    // 50 × 911,6243 = 45581,215: debe coincidir con lo mostrado en pantalla
    expect(formatForCopy(50 * 911.6243)).toBe(formatCurrencyLike(50 * 911.6243));
    expect(formatForCopy(1234567.5)).toBe('1234567,50');
    expect(formatForCopy(0.05)).toBe('0,05');
  });
});
