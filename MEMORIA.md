# MEMORIA TÉCNICA - CALCULADORA DE TASAS BCV

> **Autor:** Renato Andara (RA 2026)  
> **Proyecto:** Calculadora Tasas BCV (Standalone Android & Web)  
> **Repositorio:** [RenatoAndara/CalculadoraBCV](https://github.com/RenatoAndara/CalculadoraBCV)  
> **Fecha:** Noviembre 2026  

---

## 1. Objetivo del Proyecto

La **Calculadora de Tasas BCV** nace de la necesidad de contar con una herramienta confiable, ultra-rápida y accesible tanto en dispositivos móviles (Android APK y PWA) como en la web para consultar la tasa oficial de cambio emitida por el **Banco Central de Venezuela (BCV)** para **Dólares ($ USD)** y **Euros (€ EUR)**, realizando conversiones exactas y bidireccionales con **Bolívares (Bs. VES)**.

### Objetivos Específicos:
1. **Autonomía y Precisión Oficial:** Eliminar la dependencia exclusiva de APIs intermediarias de terceros que sufren caídas periódicas, desincronización o discontinuidad, implementando una fuente directa y oficial desde `bcv.org.ve`.
2. **Arranque Instantáneo (0 ms) y Modo Offline:** Garantizar que el usuario pueda abrir la aplicación y calcular conversiones de inmediato, incluso en zonas sin cobertura, en modo avión o con conexiones lentas.
3. **Resiliencia en Conectividad (Multi-Fallback):** Establecer una cadena de conmutación por falla en cascada que garantice la disponibilidad del dato bajo cualquier contingencia.
4. **Cálculo Tributario Localizado:** Integrar de manera opcional el cálculo de los impuestos vigentes en Venezuela (IVA del 16% e IGTF del 3% en pagos con divisas).

---

## 2. Problemática Técnica y Justificación

### 2.1 El Desafío de Conectar con el Banco Central de Venezuela
El portal oficial `https://bcv.org.ve/` presenta peculiaridades técnicas que impiden consumirlo directamente desde un navegador web o aplicación frontend:
- **Ausencia de Encabezados CORS:** No permite solicitudes `fetch()` o `XMLHttpRequest` directas desde orígenes cruzados.
- **Certificados SSL No Estándar (PROCERT / FII):** La cadena de certificación digital del Estado venezolano no forma parte de los almacenes de confianza de los navegadores comerciales estándar ni de muchos entornos Linux, generando errores `CERTIFICATE_VERIFY_FAILED`.
- **Estructura HTML en lugar de API JSON:** El BCV publica sus datos renderizados en bloques HTML dinámicos de Drupal, requiriendo un análisis y extracción de texto estructurado.
- **Consumo Ineficiente de Datos Móviles:** La página principal del BCV pesa ~160 KB. Descargar esa cantidad en cada consulta móvil para obtener dos números genera demoras innecesarias.

### 2.2 Solución Implementada: Pipeline Serverless Jamstack
Se diseñó un mecanismo híbrido donde un script en Python (`scripts/update_bcv_rates.py`) se ejecuta periódicamente sin costo en **GitHub Actions**:
1. Conecta directamente a `https://bcv.org.ve/` con un contexto SSL seguro que tolera la entidad certificadora nacional.
2. Extrae las tasas de USD, EUR y la Fecha Valor oficial mediante expresiones regulares optimizadas.
3. Detecta si hubo cambios reales contra el archivo existente. Si los hay, actualiza `public/bcv_rates.json`.
4. El archivo JSON resultante se distribuye a nivel global a través de la red de entrega de contenidos (**jsDelivr CDN**), la cual provee encabezados CORS automáticos, compresión Brotli y latencias inferiores a 50 ms.

---

## 3. Lógica de Negocio y Algoritmos

### 3.1 Modelo de Tasas y Datos
La información del tipo de cambio se modela bajo la siguiente interfaz en TypeScript:

```typescript
export interface ExchangeRates {
  usd: number;
  eur: number;
  usdParalelo?: number;
  source: 'bcv-direct' | 'dolarapi' | 'cromstudio' | 'bcvtoday' | 'cache' | 'manual';
  sourceName: string;
  date: string;
  lastChecked: number;
}
```

### 3.2 Lógica de Conversión Bidireccional
La calculadora admite dos sentidos de conversión:
- **`TO_VES` (Divisa a Bolívares):**
  $$\text{Subtotal} = \text{Monto en Divisa} \times \text{Tasa Oficial}$$
- **`FROM_VES` (Bolívares a Divisa):**
  $$\text{Subtotal} = \frac{\text{Monto en Bolívares}}{\text{Tasa Oficial}}$$

### 3.3 Tratamiento de Impuestos (IVA e IGTF)
El cálculo de impuestos se aplica sobre el subtotal resultante en la moneda de destino:
- **IVA (16%):**
  $$\text{Monto IVA} = \text{Subtotal} \times 0.16 \quad (\text{si } includeIVA = \text{true})$$
- **IGTF (3%):**
  $$\text{Monto IGTF} = \text{Subtotal} \times 0.03 \quad (\text{si } includeIGTF = \text{true})$$
- **Total Estimado:**
  $$\text{Total} = \text{Subtotal} + \text{Monto IVA} + \text{Monto IGTF}$$

### 3.4 Conmutación por Falla (Cascading Fallback)
El servicio `getLiveRates()` ejecuta de forma secuencial las siguientes fuentes:
1. **Fuente 0 (BCV Directo Oficial):** JSON estático servido vía CDN desde el repositorio propio.
2. **Fuente 1 (DolarApi):** Iniciativa comunitaria con soporte de USD oficial, EUR oficial y tasa paralela referencial.
3. **Fuente 2 (CromStudio):** API venezolana alternativa de respaldo.
4. **Fuente 3 (BCV Today):** Espejo estático de alta disponibilidad.
5. **Caché Local Offline:** Último valor exitoso guardado en `localStorage` del dispositivo.

---

## 4. Estado de Conectividad y Persistencia
- **Detección Online/Offline:** Monitoreo activo de eventos de red `window.online` y `window.offline`.
- **Persistencia de Preferencias:** La divisa seleccionada (USD/EUR), el sentido de conversión y las casillas de IVA/IGTF se conservan automáticamente entre sesiones mediante `localStorage`.
