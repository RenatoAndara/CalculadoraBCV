import React, { useState, useEffect, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { OfflineBadge } from './components/OfflineBadge';
import { CurrencySelector } from './components/CurrencySelector';
import { QuickAmounts } from './components/QuickAmounts';
import { Calculator } from './components/Calculator';
import { TaxCalculator } from './components/TaxCalculator';
import { Footer } from './components/Footer';
import { getLiveRates } from './services/rates';
import { getStoredPrefs, getStoredRates, savePrefsToStorage } from './services/storage';
import type { ConversionDirection, ExchangeRates } from './types';

export const App: React.FC = () => {
  // Estado de tasas con carga inmediata de caché para arranque a velocidad instantánea (0ms)
  const [rates, setRates] = useState<ExchangeRates>(() => getStoredRates());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Preferencias de usuario
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR'>(() => {
    return getStoredPrefs().lastCurrency || 'USD';
  });
  const [direction, setDirection] = useState<ConversionDirection>(() => {
    return getStoredPrefs().direction || 'TO_VES';
  });
  const [includeIVA, setIncludeIVA] = useState<boolean>(() => {
    return getStoredPrefs().includeIVA || false;
  });
  const [includeIGTF, setIncludeIGTF] = useState<boolean>(() => {
    return getStoredPrefs().includeIGTF || false;
  });

  // Estado de la calculadora
  const [inputAmount, setInputAmount] = useState<string>('1');

  // Soporte para instalación standalone en Android (PWA BeforeInstallPrompt)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);

  // Función de actualización de tasas desde la red
  const handleFetchRates = useCallback(async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const result = await getLiveRates();
      setRates(result.rates);
      setIsOffline(result.isOffline);
      if (result.errorNotice) {
        setErrorNotice(result.errorNotice);
      }
    } catch {
      setIsOffline(true);
      setErrorNotice('No se pudo conectar a los servidores. Usando datos guardados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial y eventos de conectividad del sistema
  useEffect(() => {
    handleFetchRates();

    const handleOnline = () => {
      setIsOffline(false);
      handleFetchRates();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capturar evento de instalación nativa en Android
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [handleFetchRates]);

  // Manejo de instalación PWA en Android
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  // Guardar preferencias cuando cambian
  const handleSelectCurrency = (curr: 'USD' | 'EUR') => {
    setSelectedCurrency(curr);
    savePrefsToStorage({ lastCurrency: curr });
  };

  const handleToggleDirection = () => {
    const newDir: ConversionDirection = direction === 'TO_VES' ? 'FROM_VES' : 'TO_VES';
    setDirection(newDir);
    savePrefsToStorage({ direction: newDir });
  };

  const handleToggleIVA = () => {
    const next = !includeIVA;
    setIncludeIVA(next);
    savePrefsToStorage({ includeIVA: next });
  };

  const handleToggleIGTF = () => {
    const next = !includeIGTF;
    setIncludeIGTF(next);
    savePrefsToStorage({ includeIGTF: next });
  };

  // Botón de Reset para limpiar entradas de datos
  const handleReset = () => {
    setInputAmount('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Contenedor centralizado para celulares Android y responsive */}
      <main className="w-full max-w-md mx-auto px-4 py-5 flex-1 flex flex-col gap-4">
        {/* Banner de instalación Standalone en Android si el navegador lo ofrece */}
        {canInstall && (
          <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Download className="w-4 h-4" />
              <span>Instalar app en tu Android</span>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow active:scale-95 transition-transform"
            >
              Instalar
            </button>
          </div>
        )}

        {/* Notificación de aviso si hay error de red */}
        {errorNotice && (
          <div className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Encabezado con tasas oficiales y botón de refrescar */}
        <Header
          rates={rates}
          isLoading={isLoading}
          onRefresh={handleFetchRates}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={handleSelectCurrency}
        />

        {/* Indicador de conexión / offline */}
        <OfflineBadge
          isOffline={isOffline}
          rates={rates}
          lastSyncTime={rates.lastChecked}
        />

        {/* Selector de divisa y dirección con botón Swap */}
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          direction={direction}
          onSelectCurrency={handleSelectCurrency}
          onToggleDirection={handleToggleDirection}
        />

        {/* Montos rápidos para agilizar el tecleo en móvil */}
        <QuickAmounts
          direction={direction}
          selectedCurrency={selectedCurrency}
          onSelectAmount={(val) => setInputAmount(val)}
        />

        {/* Calculadora principal con botón de Reset y copiado */}
        <Calculator
          rates={rates}
          selectedCurrency={selectedCurrency}
          direction={direction}
          inputAmount={inputAmount}
          onInputChange={setInputAmount}
          onReset={handleReset}
          includeIVA={includeIVA}
          includeIGTF={includeIGTF}
        />

        {/* Cálculo de impuestos opcionales */}
        <TaxCalculator
          includeIVA={includeIVA}
          onToggleIVA={handleToggleIVA}
          includeIGTF={includeIGTF}
          onToggleIGTF={handleToggleIGTF}
          direction={direction}
        />
      </main>

      {/* Pie de página con créditos requeridos: Desarrollado por RA 2026 */}
      <Footer />
    </div>
  );
};

export default App;
