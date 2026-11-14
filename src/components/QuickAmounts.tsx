// Montos rápidos en una sola fila, sin título — Autor: Renato Andara (RA 2026)
import React from 'react';
import type { ConversionDirection, Divisa } from '../types';

interface QuickAmountsProps {
  direction: ConversionDirection;
  selectedCurrency: Divisa;
  onSelectAmount: (val: string) => void;
}

const SIMBOLOS: Record<Divisa, string> = { USD: '$', EUR: '€', USDT: '₮' };

const QuickAmountsComponent: React.FC<QuickAmountsProps> = ({ direction, selectedCurrency, onSelectAmount }) => {
  const isToVes = direction === 'TO_VES';
  const amounts = isToVes ? ['1', '5', '10', '20', '50', '100'] : ['500', '1000', '2500', '5000', '10000'];
  const prefix = SIMBOLOS[selectedCurrency];

  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar" aria-label="Montos rápidos">
      {amounts.map((amt) => (
        <button
          key={amt}
          type="button"
          onClick={() => onSelectAmount(amt)}
          className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 active:scale-95 border border-slate-700/60 text-xs font-bold text-slate-200"
        >
          {isToVes ? `${prefix}${amt}` : `${Number(amt).toLocaleString('es-VE')} Bs.`}
        </button>
      ))}
    </div>
  );
};

export const QuickAmounts = React.memo(QuickAmountsComponent);
