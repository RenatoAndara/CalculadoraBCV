// Pie de página compacto — Autor: Renato Andara (RA 2026)
import React from 'react';

const FooterComponent: React.FC = () => (
  // app-footer deja espacio para la barra de navegación de Android (botones o gestos)
  <footer className="app-footer w-full max-w-md mx-auto pt-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
    Desarrollado por <span className="text-emerald-400 font-bold">RA 2026</span> · Tasas oficiales del BCV
  </footer>
);

export const Footer = React.memo(FooterComponent);
