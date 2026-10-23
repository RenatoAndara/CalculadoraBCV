import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { formatDisplayDate, formatTimeAgo } from '../utils/formatters';
import type { ExchangeRates } from '../types';

interface OfflineBadgeProps {
  isOffline: boolean;
  rates: ExchangeRates;
  lastSyncTime: number;
}

export const OfflineBadge: React.FC<OfflineBadgeProps> = ({ isOffline, rates, lastSyncTime }) => {
  return (
    <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors bg-slate-800/40 border-slate-700/60 text-slate-300">
      <div className="flex items-center gap-2">
        {isOffline ? (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-semibold">Modo Offline (Caché local)</span>
          </>
        ) : (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Conectado al BCV</span>
          </>
        )}
      </div>

      <div className="text-right text-[11px] text-slate-400">
        <span>{formatTimeAgo(lastSyncTime || rates.lastChecked)}</span>
        <span className="mx-1">•</span>
        <span className="text-slate-300">{formatDisplayDate(rates.date)}</span>
      </div>
    </div>
  );
};
