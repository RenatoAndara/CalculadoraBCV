import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import type { ExchangeRates } from '../types';
import { formatRate } from '../utils/formatters';

interface HeaderProps {
  rates: ExchangeRates;
  isLoading: boolean;
  onRefresh: () => void;
  selectedCurrency: 'USD' | 'EUR';
  onSelectCurrency: (curr: 'USD' | 'EUR') => void;
}

export const Header: React.FC<HeaderProps> = ({
  rates,
  isLoading,
  onRefresh,
  selectedCurrency,
  onSelectCurrency,
}) => {
  return (
    <header className="w-full space-y-3">
      {/* Barra superior de título y botón de refresco */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-lg">
              Bs
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Calculadora BCV
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Oficial
              </span>
            </h1>
            <p className="text-xs text-slate-400">Banco Central de Venezuela</p>
          </div>
        </div>

        {/* Botón de Refrescar / Actualizar la tasa */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Actualizar tasas del BCV"
          title="Actualizar tasas en vivo"
          className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:scale-95 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold shadow-md transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          <RefreshCw
            className={`w-4 h-4 text-emerald-400 transition-transform ${
              isLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'
            }`}
          />
          <span className="hidden sm:inline">Actualizar</span>
          <span className="sm:hidden">Refrescar</span>
        </button>
      </div>

      {/* Tarjetas interactivas de Tasas Oficiales */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tarjeta USD */}
        <button
          type="button"
          onClick={() => onSelectCurrency('USD')}
          className={`relative p-3 rounded-2xl text-left border transition-all ${
            selectedCurrency === 'USD'
              ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center font-black">
                $
              </span>
              USD Oficial
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500/70" />
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatRate(rates.usd)}{' '}
            <span className="text-xs font-semibold text-slate-400">Bs.</span>
          </div>
        </button>

        {/* Tarjeta EUR */}
        <button
          type="button"
          onClick={() => onSelectCurrency('EUR')}
          className={`relative p-3 rounded-2xl text-left border transition-all ${
            selectedCurrency === 'EUR'
              ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
              : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <span className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center font-black">
                €
              </span>
              EUR Oficial
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500/70" />
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatRate(rates.eur)}{' '}
            <span className="text-xs font-semibold text-slate-400">Bs.</span>
          </div>
        </button>
      </div>

      {/* Tasa Paralelo referencial si está disponible */}
      {rates.usdParalelo && (
        <div className="px-3 py-1.5 rounded-xl bg-slate-800/30 border border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Ref. Paralelo:
          </span>
          <span className="font-semibold text-slate-300">
            {formatRate(rates.usdParalelo)} Bs.
          </span>
        </div>
      )}
    </header>
  );
};
