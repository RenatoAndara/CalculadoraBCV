/**
 * Utilidades de formateo para la Calculadora de Tasas BCV
 */

// Formatear montos en moneda según el estándar venezolano o internacional
export function formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'VES', decimals?: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0,00';
  }

  // Las tasas del BCV suelen tener 4 u 8 decimales, pero los montos finales 2 decimales
  const dec = decimals !== undefined ? decimals : (currency === 'VES' ? 2 : 2);

  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(amount);

  return formatted;
}

// Formatear la tasa del BCV con su precisión oficial (hasta 4 o 6 decimales)
export function formatRate(rate: number): string {
  if (!rate || isNaN(rate)) return '0,00';
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rate);
}

// Formatear fecha legible
export function formatDisplayDate(dateStr: string | number): string {
  if (!dateStr) return 'Fecha no disponible';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Si ya viene formateado en texto (ej. CromStudio: "Viernes, 23 Octubre 2026")
      return String(dateStr);
    }
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

// Tiempo transcurrido legible (hace X minutos)
export function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return 'No sincronizado';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 30) return 'Hace un momento';
  if (seconds < 60) return `Hace ${seconds} seg`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

// Parsear input numérico permitiendo comas o puntos decimales
export function parseCleanNumber(input: string): number {
  if (!input) return 0;
  // Reemplazar comas por puntos si el usuario escribe formato latino
  const cleaned = input.trim().replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
