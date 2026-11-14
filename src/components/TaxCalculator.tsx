// Impuestos opcionales en una fila compacta — Autor: Renato Andara (RA 2026)
import React from 'react';

interface TaxCalculatorProps {
  includeIVA: boolean;
  onToggleIVA: () => void;
  includeIGTF: boolean;
  onToggleIGTF: () => void;
}

const chip = (on: boolean, color: string) =>
  `flex-1 flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
    on ? color : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
  }`;

const TaxCalculatorComponent: React.FC<TaxCalculatorProps> = ({ includeIVA, onToggleIVA, includeIGTF, onToggleIGTF }) => (
  <div className="w-full flex gap-2" aria-label="Impuestos opcionales">
    <button type="button" role="switch" aria-checked={includeIVA} onClick={onToggleIVA}
      className={chip(includeIVA, 'bg-amber-950/40 border-amber-500/70 text-amber-300')}>
      <span>+ IVA 16%</span><span>{includeIVA ? '✓' : ''}</span>
    </button>
    <button type="button" role="switch" aria-checked={includeIGTF} onClick={onToggleIGTF}
      className={chip(includeIGTF, 'bg-purple-950/40 border-purple-500/70 text-purple-300')}>
      <span>+ IGTF 3%</span><span>{includeIGTF ? '✓' : ''}</span>
    </button>
  </div>
);

export const TaxCalculator = React.memo(TaxCalculatorComponent);
