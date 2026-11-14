/**
 * Interruptor "Ver USDT (Binance P2P)" con advertencia de consumo de datos
 * y elección de frecuencia: al abrir la app, cada 30 min o cada 45 min.
 * Autor: Renato Andara (RA 2026)
 */
import React, { useState } from 'react';
import type { UsdtRefresh } from '../types';

interface UsdtSwitchProps {
  enabled: boolean;
  refresh: UsdtRefresh;
  onChange: (enabled: boolean, refresh: UsdtRefresh) => void;
}

const OPCIONES: { valor: UsdtRefresh; titulo: string; detalle: string }[] = [
  { valor: 'open', titulo: 'Al abrir la app', detalle: 'Consulta cada vez que la abres (máx. una vez cada 5 min).' },
  { valor: 30, titulo: 'Cada 30 minutos', detalle: 'Mientras la app está abierta y al volver a ella.' },
  { valor: 45, titulo: 'Cada 45 minutos', detalle: 'Menos consultas; tasa algo menos fresca.' },
];

const textoFrecuencia = (r: UsdtRefresh) => (r === 'open' ? 'al abrir' : `cada ${r} min`);

const UsdtSwitchComponent: React.FC<UsdtSwitchProps> = ({ enabled, refresh, onChange }) => {
  const [abierto, setAbierto] = useState(false);
  const [eleccion, setEleccion] = useState<UsdtRefresh>(refresh);

  const abrir = () => { setEleccion(refresh); setAbierto(true); };

  return (
    <>
      <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
        <button type="button" onClick={enabled ? abrir : undefined} className="text-left text-slate-300 font-semibold">
          ₮ Ver USDT (Binance P2P)
          {enabled && <span className="block text-[11px] font-normal text-slate-400 underline decoration-dotted">Actualiza {textoFrecuencia(refresh)} · cambiar</span>}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Mostrar tasas USDT de Binance"
          onClick={() => (enabled ? onChange(false, refresh) : abrir())}
          className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-500' : 'bg-slate-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="usdt-titulo"
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="usdt-titulo" className="text-base font-black text-white">Tasas USDT de Binance P2P</h2>
            <div className="text-xs text-amber-200 bg-amber-950/50 border border-amber-700/50 rounded-xl p-2.5 space-y-1">
              <p>⚠ Esta opción usa <b>más conexiones de datos</b>: a diferencia de la tasa BCV (una vez al día), el precio del USDT cambia constantemente.</p>
              <p>Es un precio <b>referencial del mercado</b>, no oficial: promedio de los 10 mejores anuncios de compra y de venta. Binance puede cambiar su servicio sin aviso.</p>
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">¿Cuándo actualizar?</div>
              {OPCIONES.map((o) => (
                <label
                  key={String(o.valor)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                    eleccion === o.valor ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="usdt-frecuencia"
                    className="mt-0.5 accent-amber-500"
                    checked={eleccion === o.valor}
                    onChange={() => setEleccion(o.valor)}
                  />
                  <span>
                    <span className="block text-sm font-bold text-white">{o.titulo}</span>
                    <span className="block text-[11px] text-slate-400">{o.detalle}</span>
                  </span>
                </label>
              ))}
              <p className="text-[11px] text-slate-500">También puedes actualizar cuando quieras con el botón ⟳.</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setAbierto(false)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { onChange(true, eleccion); setAbierto(false); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black"
              >
                {enabled ? 'Guardar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const UsdtSwitch = React.memo(UsdtSwitchComponent);
