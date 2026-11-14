/**
 * Calculadora compacta: monto + dirección (⇄) en una tarjeta y resultado en otra.
 * Al copiar, el monto va sin separador de miles y con coma decimal (ej. 45581,22).
 * Autor: Renato Andara (RA 2026)
 */
import React, { useState } from 'react';
import { Copy, Check, ArrowLeftRight } from 'lucide-react';
import type { ConversionDirection, Currency, Divisa } from '../types';
import { formatCurrency, formatForCopy, formatRate, parseCleanNumber } from '../utils/formatters';

interface CalculatorProps {
  activeRate: number;
  rateLabel: string;
  selectedCurrency: Divisa;
  direction: ConversionDirection;
  onToggleDirection: () => void;
  inputAmount: string;
  onInputChange: (val: string) => void;
  onReset: () => void;
  includeIVA: boolean;
  includeIGTF: boolean;
}

const SIMBOLO: Record<Currency, string> = { USD: '$', EUR: '€', USDT: '₮', VES: 'Bs.' };
const NOMBRE: Record<Currency, string> = { USD: 'USD', EUR: 'EUR', USDT: 'USDT', VES: 'Bs.' };

export const Calculator: React.FC<CalculatorProps> = ({
  activeRate,
  rateLabel,
  selectedCurrency,
  direction,
  onToggleDirection,
  inputAmount,
  onInputChange,
  onReset,
  includeIVA,
  includeIGTF,
}) => {
  const [copied, setCopied] = useState(false);
  const isToVes = direction === 'TO_VES';
  const numInput = parseCleanNumber(inputAmount);

  let baseResult = 0;
  if (numInput > 0 && activeRate > 0) {
    baseResult = isToVes ? numInput * activeRate : numInput / activeRate;
  }
  const ivaAmount = includeIVA ? baseResult * 0.16 : 0;
  const igtfAmount = includeIGTF ? baseResult * 0.03 : 0;
  const totalResult = baseResult + ivaAmount + igtfAmount;

  const fromCurrency: Currency = isToVes ? selectedCurrency : 'VES';
  const toCurrency: Currency = isToVes ? 'VES' : selectedCurrency;

  const handleCopy = () => {
    if (totalResult <= 0) return;
    navigator.clipboard.writeText(formatForCopy(totalResult)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInputFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') onInputChange(val);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Monto + dirección */}
      <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="amount-input" className="text-xs font-bold text-slate-300">
            {NOMBRE[fromCurrency]} <span className="text-slate-500">→</span> {NOMBRE[toCurrency]}
          </label>
          <button
            type="button"
            onClick={onToggleDirection}
            aria-label="Invertir dirección de conversión"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/70 active:scale-95 border border-slate-600 text-slate-200 text-xs font-semibold"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" /> Invertir
          </button>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-xl font-black text-slate-400 select-none">{SIMBOLO[fromCurrency]}</span>
          <input
            id="amount-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={inputAmount}
            onChange={handleInputFilter}
            className="w-full pl-12 pr-10 py-2.5 bg-slate-900/90 border-2 border-slate-700 focus:border-emerald-500 rounded-xl text-2xl font-black text-white placeholder-slate-600 outline-none tracking-tight"
          />
          {inputAmount && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Borrar monto"
              className="absolute right-3 text-slate-400 p-1 rounded-full text-sm font-bold bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-3.5 border border-slate-700 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-3xl font-black text-white tracking-tight break-all leading-tight">
              {formatCurrency(totalResult, toCurrency)}{' '}
              <span className="text-base font-bold text-emerald-400">{SIMBOLO[toCurrency]}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              1 {NOMBRE[selectedCurrency]} = {formatRate(activeRate)} Bs. · {rateLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={totalResult <= 0}
            title="Copia el monto sin separador de miles (ej. 45581,22)"
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              copied ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-600 text-slate-200 active:scale-95'
            } disabled:opacity-30`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" />{formatForCopy(totalResult)}</> : <><Copy className="w-3.5 h-3.5" />Copiar</>}
          </button>
        </div>

        {(includeIVA || includeIGTF) && (
          <div className="pt-1.5 border-t border-slate-700/80 space-y-0.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span><span className="font-mono">{formatCurrency(baseResult, toCurrency)}</span>
            </div>
            {includeIVA && (
              <div className="flex justify-between text-amber-400">
                <span>IVA 16%</span><span className="font-mono">+{formatCurrency(ivaAmount, toCurrency)}</span>
              </div>
            )}
            {includeIGTF && (
              <div className="flex justify-between text-purple-400">
                <span>IGTF 3%</span><span className="font-mono">+{formatCurrency(igtfAmount, toCurrency)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
