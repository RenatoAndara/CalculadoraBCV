import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Calculator as CalcIcon } from 'lucide-react';
import type { ConversionDirection, Currency, ExchangeRates } from '../types';
import { formatCurrency, formatRate, parseCleanNumber } from '../utils/formatters';

interface CalculatorProps {
  rates: ExchangeRates;
  selectedCurrency: 'USD' | 'EUR';
  direction: ConversionDirection;
  inputAmount: string;
  onInputChange: (val: string) => void;
  onReset: () => void;
  includeIVA: boolean;
  includeIGTF: boolean;
}

export const Calculator: React.FC<CalculatorProps> = ({
  rates,
  selectedCurrency,
  direction,
  inputAmount,
  onInputChange,
  onReset,
  includeIVA,
  includeIGTF,
}) => {
  const [copied, setCopied] = useState(false);

  // Determinar la tasa oficial aplicable según la divisa seleccionada
  const activeRate = selectedCurrency === 'USD' ? rates.usd : rates.eur;
  const isToVes = direction === 'TO_VES';

  const numInput = parseCleanNumber(inputAmount);

  // Cálculo base
  let baseResult = 0;
  if (numInput > 0 && activeRate > 0) {
    if (isToVes) {
      // De Divisa a VES: Divisa * Tasa
      baseResult = numInput * activeRate;
    } else {
      // De VES a Divisa: VES / Tasa
      baseResult = numInput / activeRate;
    }
  }

  // Impuestos
  const ivaRate = 0.16;
  const igtfRate = 0.03;

  const ivaAmount = includeIVA ? baseResult * ivaRate : 0;
  const igtfAmount = includeIGTF ? baseResult * igtfRate : 0;
  const totalResult = baseResult + ivaAmount + igtfAmount;

  // Monedas de origen y destino
  const fromCurrency: Currency = isToVes ? selectedCurrency : 'VES';
  const toCurrency: Currency = isToVes ? 'VES' : selectedCurrency;

  const handleCopy = () => {
    if (totalResult <= 0) return;
    const textToCopy = `${formatCurrency(totalResult, toCurrency)} ${toCurrency}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInputFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Permitir dígitos, coma y punto
    if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') {
      onInputChange(val);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Tarjeta de Entrada de Monto */}
      <div className="bg-slate-800/80 rounded-3xl p-4 border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="amount-input" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Monto a Convertir ({fromCurrency}):
          </label>

          {/* Botón de Reset para limpiar entradas de datos */}
          <button
            type="button"
            onClick={onReset}
            disabled={!inputAmount || inputAmount === '0'}
            aria-label="Limpiar entrada de datos"
            title="Limpiar entrada (Reset)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-700/60 hover:bg-rose-500/20 active:scale-95 border border-slate-600/60 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Input Numérico Grande */}
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-black text-slate-400 select-none">
            {fromCurrency === 'VES' ? 'Bs.' : selectedCurrency === 'USD' ? '$' : '€'}
          </span>
          <input
            id="amount-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={inputAmount}
            onChange={handleInputFilter}
            className="w-full pl-14 pr-10 py-3.5 bg-slate-900/90 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl text-2xl sm:text-3xl font-black text-white placeholder-slate-600 outline-none transition-all shadow-inner tracking-tight"
          />
          {inputAmount && (
            <button
              type="button"
              onClick={onReset}
              className="absolute right-3.5 text-slate-400 hover:text-white p-1 rounded-full text-sm font-bold bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta de Resultado Principal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-4">
        {/* Efecto decorativo de fondo */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CalcIcon className="w-4 h-4" />
            Resultado Estimado ({toCurrency}):
          </span>

          {/* Botón Copiar al Portapapeles */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={totalResult <= 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 active:scale-95'
            } disabled:opacity-30 disabled:pointer-events-none`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Display del Gran Resultado */}
        <div className="py-1">
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2 break-all">
            <span>{formatCurrency(totalResult, toCurrency)}</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400">
              {toCurrency === 'VES' ? 'Bs.' : toCurrency}
            </span>
          </div>
        </div>

        {/* Desglose del Cálculo */}
        <div className="pt-3 border-t border-slate-700/80 space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tasa Oficial BCV:</span>
            <span className="font-mono font-bold text-slate-200">
              1 {selectedCurrency} = {formatRate(activeRate)} Bs.
            </span>
          </div>

          {(includeIVA || includeIGTF) && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Subtotal base:</span>
              <span className="font-mono text-slate-300">
                {formatCurrency(baseResult, toCurrency)} {toCurrency}
              </span>
            </div>
          )}

          {includeIVA && (
            <div className="flex justify-between items-center text-amber-400">
              <span>IVA (+16%):</span>
              <span className="font-mono font-semibold">
                +{formatCurrency(ivaAmount, toCurrency)} {toCurrency}
              </span>
            </div>
          )}

          {includeIGTF && (
            <div className="flex justify-between items-center text-purple-400">
              <span>IGTF (+3%):</span>
              <span className="font-mono font-semibold">
                +{formatCurrency(igtfAmount, toCurrency)} {toCurrency}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
