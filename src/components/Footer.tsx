import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-5 px-4 text-center border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <p className="text-sm font-semibold tracking-wide text-slate-300">
        Desarrollado por <span className="text-emerald-400 font-bold">RA 2026</span>
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Tasas de cambio oficiales del Banco Central de Venezuela (BCV)
      </p>
    </footer>
  );
};
