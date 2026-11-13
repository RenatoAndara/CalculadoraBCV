# HISTORIAL DE VERSIONES (CHANGELOG)

Todas las modificaciones notables de este proyecto están documentadas en este archivo según los lineamientos de [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.1] - 2026-11-13

### 🐛 Corrección: "Vigente Hoy" mostraba la tasa de ayer
- **Causa:** la tasa "vigente" y la de "próximo día" se asignaban según el orden de publicación del BCV. En la mañana, la última tasa publicada (con fecha valor de hoy) aparecía como "Próx. Día" y la de ayer como "Vigente Hoy".
- **Solución:** la clasificación ahora se hace por **fecha valor frente a la fecha de hoy en Caracas**:
  - *Vigente Hoy* = la tasa más reciente con fecha valor igual o anterior a hoy.
  - *Próx. Día* = la tasa con fecha valor posterior a hoy; solo aparece cuando el BCV ya la publicó (desde ~4 pm o fines de semana), con su día en la pestaña (ej. "Próx. Día · Lun 16/11").
- Nuevo módulo [`src/services/schedule.ts`](src/services/schedule.ts): la app reclasifica en el dispositivo, sin conexión y al pasar la medianoche, aunque no descargue el JSON de nuevo.
- [`scripts/update_bcv_rates.py`](scripts/update_bcv_rates.py) aplica la misma regla al generar `public/bcv_rates.json`.
- La app abre siempre en *Vigente Hoy*; la selección de *Próx. Día* vuelve sola a *Vigente Hoy* cuando esa tasa entra en vigencia.
- Workflow de tasas: nuevas ejecuciones a las 16:30 (lun–vie) y 00:05 (diaria), hora de Venezuela.
- Pruebas: [`src/services/schedule.test.ts`](src/services/schedule.test.ts) con los casos de mañana, tarde, fin de semana y cambio de día.

---

## [1.3.0] - 2026-11-08

### 🚀 Novedades: Motor Dual de Tasas BCV (Vigente vs Próximo Día Hábil)
- **Soporte de doble tasa en vivo y alternancia instantánea:**
  - Implementada la opción para alternar entre la **Tasa Vigente de Hoy** (tasa de facturación legal del día) y la **Tasa Publicada para el Próximo Día Hábil** (emitida por el BCV entre 4:30 pm y 5:30 pm o durante fines de semana).
  - Añadido un selector interactivo tipo cápsula en [`src/components/Header.tsx`](src/components/Header.tsx) con iconos accesibles (`Clock` y `Calendar`).
  - Recálculo matemático inmediato en 0 ms en toda la aplicación (`Calculator`, `TaxCalculator`, tarjetas de divisas) sin recargar la página.
- **Estructura de datos y persistencia histórica:**
  - Actualizado [`public/bcv_rates.json`](public/bcv_rates.json) con el objeto estructurado `rates.current`, `rates.next` y el array acumulativo `history` (últimos 30 registros), manteniendo retrocompatibilidad total con las claves raíz `usd`, `eur` y `fecha_valor`.
  - Actualizado [`scripts/update_bcv_rates.py`](scripts/update_bcv_rates.py) para promover de manera automática la tasa previa a `current` al detectar una nueva `Fecha Valor`.
  - Persistencia de la preferencia de tasa en `localStorage` mediante `rateScheduleMode` ('current' | 'next') y soporte offline garantizado en el Service Worker.
- **Suite de pruebas:**
  - Añadidos casos de prueba en [`src/services/calculation.test.ts`](src/services/calculation.test.ts) validando la conmutación entre ambas tasas.

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
