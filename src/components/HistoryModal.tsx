/**
 * Historial de tasas BCV de los últimos 30 días (guardado en el teléfono).
 * Autor: Renato Andara (RA 2026)
 */
import React from 'react';
import { X } from 'lucide-react';
import type { EntradaHistorial } from '../services/history';
import { MAX_DIAS } from '../services/history';
import { hoyCaracas } from '../services/schedule';
import { formatRate } from '../utils/formatters';

interface HistoryModalProps {
  historial: EntradaHistorial[];
  onClose: () => void;
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function fechaCorta(f: string): string {
  const [a, m, d] = f.split('-').map(Number);
  return `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

function variacion(actual: number, anterior?: number): React.ReactNode {
  if (!anterior) return <span className="text-slate-600">—</span>;
  const v = (actual / anterior - 1) * 100;
  const texto = `${v > 0 ? '+' : ''}${v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  const color = v > 0 ? 'text-rose-400' : v < 0 ? 'text-emerald-400' : 'text-slate-400';
  return <span className={color}>{texto}</span>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ historial, onClose }) => {
  const hoy = hoyCaracas();
  // La vigente es la más reciente con fecha <= hoy
  const fechaVigente = historial.find((e) => e.fecha <= hoy)?.fecha;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 app-modal-pad" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="historial-titulo"
        className="w-full max-w-md max-h-[80dvh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h2 id="historial-titulo" className="text-base font-black text-white">Historial de tasas BCV</h2>
            <p className="text-[11px] text-slate-400">
              {historial.length} {historial.length === 1 ? 'día' : 'días'} guardados en este teléfono (máx. {MAX_DIAS})
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar historial" className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
          <span>Fecha valor</span>
          <span className="text-right">$ USD</span>
          <span className="text-right">€ EUR</span>
        </div>

        <ul className="overflow-y-auto px-2 pb-3">
          {historial.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-slate-400">Aún no hay tasas guardadas. Se irán guardando cada vez que la app se actualice.</li>
          )}
          {historial.map((e, i) => {
            const anterior = historial[i + 1];
            const etiqueta = e.fecha > hoy ? 'Próx.' : e.fecha === fechaVigente ? 'Vigente' : null;
            return (
              <li
                key={e.fecha}
                className={`grid grid-cols-[1.3fr_1fr_1fr] gap-2 items-center px-2 py-2 rounded-xl ${etiqueta ? 'bg-slate-800/70' : ''}`}
              >
                <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
                  {fechaCorta(e.fecha)}
                  {etiqueta && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-black ${etiqueta === 'Próx.' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {etiqueta}
                    </span>
                  )}
                </span>
                <span className="text-right leading-tight">
                  <span className="block text-sm font-bold text-white">{formatRate(e.usd)}</span>
                  <span className="block text-[10px]">{variacion(e.usd, anterior?.usd)}</span>
                </span>
                <span className="text-right leading-tight">
                  <span className="block text-sm font-bold text-white">{formatRate(e.eur)}</span>
                  <span className="block text-[10px]">{variacion(e.eur, anterior?.eur)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
