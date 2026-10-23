import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { ConversionDirection, Currency } from '../types';

interface CurrencySelectorProps {
  selectedCurrency: 'USD' | 'EUR';
  direction: ConversionDirection;
  onSelectCurrency: (curr: 'USD' | 'EUR') => void;
  onToggleDirection: () => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  direction,
  onSelectCurrency,
  onToggleDirection,
}) => {
  const isToVes = direction === 'TO_VES';
  const fromCurrency: Currency = isToVes ? selectedCurrency : 'VES';
  const toCurrency: Currency = isToVes ? 'VES' : selectedCurrency;

  return (
    <div className="w-full bg-slate-800/60 rounded-2xl p-2 border border-slate-700/60 backdrop-blur-sm space-y-2">
      {/* Selector de Divisa Base (USD o EUR) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => onSelectCurrency('USD')}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            selectedCurrency === 'USD'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-sm font-black">$</span> Dólar (USD)
        </button>
        <button
          type="button"
          onClick={() => onSelectCurrency('EUR')}
          className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            selectedCurrency === 'EUR'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-sm font-black">€</span> Euro (EUR)
        </button>
      </div>

      {/* Visualización de Dirección con botón SWAP */}
      <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
        <div className="flex-1 text-center">
          <div className="text-[11px] font-medium text-slate-400">Origen</div>
          <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
            <span className={fromCurrency === 'VES' ? 'text-amber-400' : 'text-emerald-400'}>
              {fromCurrency === 'VES' ? '🇻🇪 Bs.' : selectedCurrency === 'USD' ? '🇺🇸 $' : '🇪🇺 €'}
            </span>
            <span>{fromCurrency}</span>
          </div>
        </div>

        {/* Botón SWAP / Invertir Dirección */}
        <button
          type="button"
          onClick={onToggleDirection}
          aria-label="Invertir dirección de conversión"
          title="Invertir sentido (⇄)"
          className="p-2.5 rounded-full bg-slate-700/80 hover:bg-slate-650 active:scale-90 border border-slate-600 text-slate-200 hover:text-emerald-400 transition-all shadow-md group"
        >
          <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-[11px] font-medium text-slate-400">Destino</div>
          <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
            <span className={toCurrency === 'VES' ? 'text-amber-400' : 'text-emerald-400'}>
              {toCurrency === 'VES' ? '🇻🇪 Bs.' : selectedCurrency === 'USD' ? '🇺🇸 $' : '🇪🇺 €'}
            </span>
            <span>{toCurrency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
