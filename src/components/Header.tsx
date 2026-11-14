/**
 * Encabezado compacto: título, actualizar, pestañas Vigente/Próx. Día,
 * tarjetas de tasas (USD, EUR y, si está activo, USDT P2P) y una sola línea de estado.
 * Autor: Renato Andara (RA 2026)
 */
import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import type { Divisa, ExchangeRates, RateScheduleMode, UsdtRates } from '../types';
import { formatRate, formatTimeAgo } from '../utils/formatters';
import { fechaDeSnapshot } from '../services/schedule';

interface HeaderProps {
  rates: ExchangeRates;
  isLoading: boolean;
  isOffline: boolean;
  onRefresh: () => void;
  selectedCurrency: Divisa;
  onSelectCurrency: (curr: Divisa) => void;
  rateScheduleMode?: RateScheduleMode;
  onSelectScheduleMode?: (mode: RateScheduleMode) => void;
  usdt?: UsdtRates | null;
  usdtLoading?: boolean;
  usdtError?: string | null;
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** 'Viernes, 13 Noviembre 2026' -> 'Vie 13/11' */
function fechaCorta(texto: string): string {
  const f = fechaDeSnapshot({ fecha_valor: texto, fecha_valor_iso: null });
  if (!f) return texto;
  const [a, m, d] = f.split('-').map(Number);
  return `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

const estiloTarjeta = (activa: boolean, color: string) =>
  `p-2.5 rounded-2xl border transition-all text-left ${
    activa
      ? `bg-slate-800 ${color} ring-1 shadow-lg`
      : 'bg-slate-800/40 border-slate-700/60'
  }`;

const HeaderComponent: React.FC<HeaderProps> = ({
  rates,
  isLoading,
  isOffline,
  onRefresh,
  selectedCurrency,
  onSelectCurrency,
  rateScheduleMode = 'current',
  onSelectScheduleMode,
  usdt,
  usdtLoading,
  usdtError,
}) => {
  const vigente = rates.rates?.current;
  const proximo = rates.rates?.next;
  const brecha = usdt && rates.usd > 0 ? (usdt.promedio / rates.usd - 1) * 100 : null;

  return (
    <header className="w-full space-y-2.5">
      {/* Título + actualizar (solo ícono para ahorrar espacio) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-sm">
              Bs
            </div>
          </div>
          <h1 className="text-base font-black tracking-tight text-white">Calculadora BCV</h1>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Actualizar tasas"
          title="Actualizar tasas"
          className="p-2 rounded-xl bg-slate-800/90 active:scale-95 border border-slate-700 text-emerald-400 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading || usdtLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Vigente Hoy / Próx. Día: solo cuando el BCV ya publicó la del siguiente día */}
      {vigente && proximo && (
        <div className="flex gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {(['current', 'next'] as const).map((modo) => {
            const snap = modo === 'current' ? vigente : proximo;
            const activa = rateScheduleMode === modo;
            return (
              <button
                key={modo}
                type="button"
                onClick={() => onSelectScheduleMode?.(modo)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all truncate ${
                  activa ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                {modo === 'current' ? 'Vigente Hoy' : 'Próx. Día'} · {fechaCorta(snap.fecha_valor)}
              </button>
            );
          })}
        </div>
      )}

      {/* Tarjetas: tocar una la elige para convertir (sustituye al selector de divisa) */}
      <div className="grid grid-cols-2 gap-2">
        {(['USD', 'EUR'] as const).map((div) => {
          const valor = div === 'USD' ? rates.usd : rates.eur;
          const activa = selectedCurrency === div;
          const color = div === 'USD' ? 'border-emerald-500/60 ring-emerald-500/30' : 'border-cyan-500/60 ring-cyan-500/30';
          return (
            <button key={div} type="button" onClick={() => onSelectCurrency(div)} className={estiloTarjeta(activa, color)}>
              <div className={`text-[11px] font-bold ${div === 'USD' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {div === 'USD' ? '$ Dólar BCV' : '€ Euro BCV'}
              </div>
              <div className="text-lg font-black text-white tracking-tight leading-tight">
                {formatRate(valor)} <span className="text-[11px] font-semibold text-slate-400">Bs.</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* USDT Binance P2P (opcional) */}
      {usdt !== undefined && (
        <button
          type="button"
          onClick={() => usdt && onSelectCurrency('USDT')}
          disabled={!usdt}
          className={`w-full ${estiloTarjeta(selectedCurrency === 'USDT', 'border-amber-500/60 ring-amber-500/30')}`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-400">
              ₮ USDT Binance P2P{usdt && <span className="font-normal text-slate-400"> · {formatTimeAgo(usdt.lastChecked).toLowerCase()}</span>}
            </span>
            {brecha !== null && (
              <span className="text-slate-400">
                {brecha >= 0 ? '+' : ''}{brecha.toLocaleString('es-VE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% vs BCV
              </span>
            )}
          </div>
          {usdt ? (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-black text-white tracking-tight leading-tight">
                {formatRate(usdt.promedio)} <span className="text-[11px] font-semibold text-slate-400">Bs. prom.</span>
              </span>
              <span className="text-[11px] text-slate-400 text-right leading-tight">
                Compra {formatRate(usdt.compra)}<br />Venta {formatRate(usdt.venta)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1">
              {usdtLoading ? 'Consultando Binance…' : usdtError || 'Sin datos todavía'}
            </div>
          )}
        </button>
      )}

      {/* Una sola línea de estado (reemplaza la barra "Conectado al BCV") */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          {isOffline ? (
            <><WifiOff className="w-3 h-3 text-amber-400" /><span className="text-amber-300">Sin conexión</span></>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          <span className="whitespace-nowrap">Fecha valor: <b className="text-slate-300">{fechaCorta(rates.date)}</b></span>
        </span>
        <span className="whitespace-nowrap">BCV {formatTimeAgo(rates.lastChecked).toLowerCase()}</span>
      </div>

      {usdt && usdtError && (
        <div className="px-1 text-[11px] text-amber-300">⚠ {usdtError} Se muestra la última tasa USDT guardada.</div>
      )}
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
