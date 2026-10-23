import { describe, it, expect } from 'vitest';
import { formatCurrency, formatRate, parseCleanNumber } from './formatters';

describe('formatters', () => {
  it('correctly parses numbers with comma or dot decimal separators', () => {
    expect(parseCleanNumber('100')).toBe(100);
    expect(parseCleanNumber('100.50')).toBe(100.5);
    expect(parseCleanNumber('100,50')).toBe(100.5);
    expect(parseCleanNumber(' 1 250,75 ')).toBe(1250.75);
    expect(parseCleanNumber('')).toBe(0);
    expect(parseCleanNumber('abc')).toBe(0);
  });

  it('formats currency correctly with 2 decimal places', () => {
    const vesFormatted = formatCurrency(1250.5, 'VES');
    // es-VE uses comma as decimal separator and dot as thousand separator
    expect(vesFormatted).toMatch(/1.*250,50/);

    const zeroFormatted = formatCurrency(0, 'USD');
    expect(zeroFormatted).toBe('0,00');
  });

  it('formats BCV exchange rates with high precision', () => {
    const rate = formatRate(886.2271);
    expect(rate).toContain('886,2271');
  });
});
