import React from 'react';
import { Percent, ShieldAlert } from 'lucide-react';

interface TaxCalculatorProps {
  includeIVA: boolean;
  onToggleIVA: () => void;
  includeIGTF: boolean;
  onToggleIGTF: () => void;
  direction: 'TO_VES' | 'FROM_VES';
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  includeIVA,
  onToggleIVA,
  includeIGTF,
  onToggleIGTF,
}) => {
  return (
    <div className="w-full bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-0.5">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Percent className="w-3.5 h-3.5 text-slate-400" />
          Impuestos Venezolanos (Opcional):
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Toggle IVA 16% */}
        <button
          type="button"
          onClick={onToggleIVA}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
            includeIVA
              ? 'bg-amber-950/40 border-amber-500/70 text-amber-300 shadow-sm'
              : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>IVA (+16%)</span>
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
              includeIVA
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'border-slate-600'
            }`}
          >
            {includeIVA ? '✓' : ''}
          </span>
        </button>

        {/* Toggle IGTF 3% */}
        <button
          type="button"
          onClick={onToggleIGTF}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
            includeIGTF
              ? 'bg-purple-950/40 border-purple-500/70 text-purple-300 shadow-sm'
              : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-purple-400" />
            IGTF (+3%)
          </span>
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
              includeIGTF
                ? 'bg-purple-500 text-slate-950 border-purple-400 font-black'
                : 'border-slate-600'
            }`}
          >
            {includeIGTF ? '✓' : ''}
          </span>
        </button>
      </div>
    </div>
  );
};
