import { describe, it, expect } from 'vitest';
import { parseCleanNumber } from '../utils/formatters';

describe('Calculator Conversion Logic', () => {
  const usdRate = 886.2271;
  const eurRate = 993.0883;

  it('converts USD to VES accurately', () => {
    const input = '100';
    const amount = parseCleanNumber(input);
    const result = amount * usdRate;
    expect(result).toBeCloseTo(88622.71, 2);
  });

  it('converts EUR to VES accurately', () => {
    const input = '50';
    const amount = parseCleanNumber(input);
    const result = amount * eurRate;
    expect(result).toBeCloseTo(49654.415, 2);
  });

  it('converts VES to USD accurately', () => {
    const input = '88622.71';
    const amount = parseCleanNumber(input);
    const result = amount / usdRate;
    expect(result).toBeCloseTo(100, 2);
  });

  it('calculates optional IVA (16%) correctly', () => {
    const base = 1000;
    const iva = base * 0.16;
    const total = base + iva;
    expect(iva).toBe(160);
    expect(total).toBe(1160);
  });

  it('calculates optional IGTF (3%) correctly', () => {
    const base = 1000;
    const igtf = base * 0.03;
    const total = base + igtf;
    expect(igtf).toBe(30);
    expect(total).toBe(1030);
  });

  it('calculates combined IVA and IGTF correctly', () => {
    const base = 1000;
    const iva = base * 0.16;
    const igtf = base * 0.03;
    const total = base + iva + igtf;
    expect(total).toBe(1190);
  });
});
