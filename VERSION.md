# HISTORIAL DE VERSIONES (CHANGELOG)

Todas las modificaciones notables de este proyecto están documentadas en este archivo según los lineamientos de [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-11-08

### 🚀 Novedades y Automatización Oficial
- **Integración del extractor directo del Banco Central de Venezuela:**
  - Creado el script Python [`scripts/update_bcv_rates.py`](scripts/update_bcv_rates.py) con cero dependencias externas y soporte para el certificado SSL oficial del BCV (cadena PROCERT / FII).
  - Creado el workflow automatizado [`.github/workflows/update-bcv-rates.yml`](.github/workflows/update-bcv-rates.yml) en GitHub Actions para extraer y actualizar las tasas de Lunes a Viernes a las 09:00, 13:00, 17:00 y 19:00 (hora Venezuela), con opción de ejecución manual `workflow_dispatch`.
  - Agregado el archivo estático [`public/bcv_rates.json`](public/bcv_rates.json) con distribución global a través de jsDelivr CDN y fallback a GitHub raw.
  - Integrado el nuevo proveedor prioritario `bcv-direct` en [`src/services/rates.ts`](src/services/rates.ts) y [`src/types/index.ts`](src/types/index.ts).

### ⚡ Optimizaciones de Rendimiento (Guía de 31 Recomendaciones)
- **Prevención de re-renders innecesarios (Regla #26):**
  - Memoizados los componentes `Header`, `CurrencySelector`, `QuickAmounts`, `TaxCalculator`, `OfflineBadge` y `Footer` con `React.memo`.
  - Memorizados los controladores de eventos en `App.tsx` con `useCallback`.
  - El tipeo en la calculadora ahora solo vuelve a renderizar el componente `Calculator`.
- **Deduplicación de llamadas a la API (Regla #3):**
  - Implementado sistema de deduplicación de promesas activas en `getLiveRates()` para compartir peticiones concurrentes.
- **Skeletons de carga (Regla #1):**
  - Agregados estados esqueleto con animación `animate-pulse` en las tarjetas de tasas de `Header.tsx` para eliminar saltos de diseño (CLS = 0).
- **División de bundles / Vendor Chunking (Regla #22):**
  - Configurado Rollup `manualChunks` en `vite.config.ts` separando `vendor` (React/React-DOM) e `icons` (Lucide React) de la lógica de la app (24 KB).
- **Caché en Service Worker (Regla #27):**
  - Incluido `/bcv_rates.json` dentro del precaché estático de `public/sw.js`.
- **Eliminación de código muerto y activos obsoletos (Regla #11):**
  - Eliminados archivos no utilizados: `src/App.css`, `hero.png`, `react.svg` y `vite.svg`.

### 📚 Documentación
- Creada la documentación completa del sistema:
  - [`MEMORIA.md`](MEMORIA.md): Justificación técnica, lógica de negocio y tratamiento tributario.
  - [`ARQUITECTURA.md`](ARQUITECTURA.md): Diagrama global, capas del sistema y detalle de optimizaciones.
  - [`VERSION.md`](VERSION.md): Historial de versiones y control de cambios.

---

## [1.1.0] - 2026-10-25

### Agregado
- Integración de **Capacitor 8** para generación de proyectos Android nativos (`android/`).
- Workflow de GitHub Actions `.github/workflows/build-apk.yml` para compilar el paquete `.apk` de forma continua.
- Sistema de conmutación por falla con múltiples proveedores: DolarApi, CromStudio y BCV Today.
- Persistencia de preferencias del usuario y almacenamiento de tasas en `localStorage`.

---

## [1.0.0] - 2026-10-15

### Versión Inicial
- Lanzamiento inicial de la calculadora en React 19, TypeScript y Tailwind CSS.
- Conversión bidireccional entre USD/EUR y Bolívares (VES).
- Módulo de cálculo de impuestos venezolanos (IVA 16% e IGTF 3%).
- Configuración básica de Progressive Web App (PWA) con Service Worker y Web Manifest.
- Soporte para botones de selección rápida de montos.
- Función de copiado al portapapeles.
