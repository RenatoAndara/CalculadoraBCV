import React from 'react';
import type { ConversionDirection, Currency } from '../types';

interface QuickAmountsProps {
  direction: ConversionDirection;
  selectedCurrency: Currency;
  onSelectAmount: (val: string) => void;
}

export const QuickAmounts: React.FC<QuickAmountsProps> = ({
  direction,
  selectedCurrency,
  onSelectAmount,
}) => {
  const isToVes = direction === 'TO_VES';

  const amounts = isToVes
    ? ['1', '5', '10', '20', '50', '100']
    : ['500', '1000', '2500', '5000', '10000'];

  const prefix = isToVes ? (selectedCurrency === 'USD' ? '$' : '€') : 'Bs.';

  return (
    <div className="w-full space-y-1.5">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-1">
        Montos Rápidos:
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {amounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onSelectAmount(amt)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            {isToVes ? `${prefix}${amt}` : `${amt} ${prefix}`}
          </button>
        ))}
      </div>
    </div>
  );
};
