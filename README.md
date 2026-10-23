# Calculadora de Tasas BCV (Standalone Android & Web)

Aplicación móvil standalone para celulares Android y web que permite consultar en tiempo real las tasas oficiales de cambio del **Banco Central de Venezuela (BCV)** para Dólares ($ USD) y Euros (€ EUR), y realizar conversiones instantáneas y bidireccionales con Bolívares (Bs. VES).

> **Desarrollado por RA 2026**

---

## Características Principales

- **Conexión Oficial Resiliente (Multi-API con Fallback automático):**
  1. *DolarApi* (`ve.dolarapi.com`): Tasas oficiales BCV de USD y EUR en tiempo real + tasa referencial paralela.
  2. *CromStudio* (`datos.cromstudio.com.ve/tasa`): Respaldo secundario oficial del BCV.
  3. *BCV Today* (`bcv.today`): Espejo estático en GitHub Pages de alta disponibilidad.
  4. *Caché Local Offline*: Si el dispositivo no tiene internet o está en modo avión, la app inicia instantáneamente (0ms) con la última tasa guardada.

- **Calculadora Bidireccional:**
  - Conversión de Divisas (USD / EUR) a Bolívares (Bs. VES).
  - Conversión de Bolívares (Bs. VES) a Divisas (USD / EUR).
  - Botón de inversión de sentido (`⇄`).
  - Botones de selección rápida de montos ($1, $5, $10, $20, $50, $100).
  - Botón de **Copiar al portapapeles** con confirmación visual.

- **Controles Requeridos:**
  - **Botón de Reset**: Limpia inmediatamente las entradas de datos y restablece el monto a cero.
  - **Botón de Refrescar / Actualizar**: Actualiza las tasas del BCV en tiempo real con animación de carga y estampa de tiempo.
  - **Crédito en el frontend**: "Desarrollado por RA 2026" en el pie de página.

- **Cálculo Opcional de Impuestos:**
  - Interruptor para agregar IVA (+16%).
  - Interruptor para agregar IGTF (+3% en pagos con divisas).

- **Standalone Móvil Android:**
  - **PWA (Progressive Web App)**: Se instala con 1 toque desde el navegador en cualquier celular Android, se agrega al cajón de aplicaciones con icono propio y corre a pantalla completa sin barra de direcciones URL.
  - **APK Nativo (Capacitor)**: Proyecto Android completo en la carpeta `android/` listo para compilar un paquete `.apk` instalable.

---

## Guía de Uso e Instalación en Celulares Android

### Opción 1: Instalación Inmediata como PWA Standalone (Recomendada - Sin Descargas Pesadas)

1. Inicia el servidor local o súbelo a un hosting gratuito (Vercel, Netlify, Cloudflare Pages o GitHub Pages):
   ```bash
   npm run dev -- --host
   ```
2. Desde tu celular Android conectado a la misma red WiFi (o accediendo a la URL del hosting), abre el enlace en Google Chrome.
3. Chrome mostrará automáticamente el botón **"Instalar en tu Android"** en la parte superior, o puedes presionar el menú de tres puntos (⋮) de Chrome y seleccionar **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.
4. ¡Listo! La app aparecerá con su icono en el launcher de Android y funcionará 100% como app nativa, incluso sin internet ni datos móviles.

### Opción 2: Compilación de APK Nativo con Capacitor

#### A) Compilación Automática en la Nube (GitHub Actions)
El repositorio incluye el workflow `.github/workflows/build-apk.yml`. Al subir el proyecto a un repositorio de GitHub, la acción compila automáticamente el archivo `.apk` en los servidores de GitHub y lo deja listo para descargar en la pestaña *Actions* / *Releases*.

#### B) Compilación Local (Requiere Android Studio y JDK 17+)
1. Sincronizar el proyecto:
   ```bash
   npm run cap:sync
   ```
2. Abrir el proyecto en Android Studio:
   ```bash
   npm run cap:open
   ```
3. En Android Studio, seleccionar **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## Comandos Disponibles

```bash
# Iniciar servidor de desarrollo con acceso en red local para probar en el celular
npm run dev -- --host

# Ejecutar las pruebas unitarias automatizadas
npm test

# Compilar para producción web
npm run build

# Sincronizar cambios web al proyecto nativo de Android
npm run cap:sync
```

---

## Estructura del Código

```text
├── android/                   # Proyecto nativo de Android generado con Capacitor
├── public/
│   ├── app-icon.svg           # Icono adaptativo para Android y PWA
│   ├── manifest.webmanifest   # Configuración de app standalone para Android
│   └── sw.js                  # Service Worker para funcionamiento 100% offline
├── src/
│   ├── components/
│   │   ├── Calculator.tsx     # Calculadora principal, botón Reset y copiado
│   │   ├── CurrencySelector.tsx # Selector USD/EUR y botón invertir sentido (⇄)
│   │   ├── Footer.tsx         # Pie de página 'Desarrollado por RA 2026'
│   │   ├── Header.tsx         # Tasas oficiales BCV y botón de Refrescar
│   │   ├── OfflineBadge.tsx   # Indicador de estado de conexión y última tasa
│   │   ├── QuickAmounts.tsx   # Botones de montos rápidos ($5, $10, etc.)
│   │   └── TaxCalculator.tsx  # Desglose opcional de IVA e IGTF
│   ├── services/
│   │   ├── rates.ts           # Servicio multi-API con fallback automático
│   │   └── storage.ts         # Almacenamiento local para modo offline
│   ├── utils/
│   │   └── formatters.ts      # Formateo numérico en Bolívares y Divisas
│   ├── App.tsx                # Componente principal con gestión de eventos PWA
│   └── main.tsx               # Montaje React
├── capacitor.config.ts        # Configuración nativa de Capacitor
└── package.json
```
