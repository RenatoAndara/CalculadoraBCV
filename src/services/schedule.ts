/**
 * Clasificación de tasas: Vigente Hoy vs Próximo Día Hábil
 * Autor: Renato Andara (RA 2026)
 *
 * El BCV publica cada tarde (desde ~4 pm) la tasa del siguiente día hábil.
 * Por eso la "última tasa publicada" NO siempre es la del próximo día: en la
 * mañana, la última publicada es la vigente de hoy.
 *
 * La regla se decide con la FECHA VALOR comparada con la fecha de hoy en
 * Caracas (no con el orden de publicación):
 *   - Vigente Hoy  = la tasa más reciente con fecha valor <= hoy
 *   - Próx. Día    = la tasa más próxima con fecha valor  > hoy (si ya existe)
 *
 * Se calcula en el dispositivo, así funciona sin conexión y se corrige sola
 * al cambiar de día aunque el JSON no se haya vuelto a descargar.
 */
import type { ExchangeRates, RateSnapshot } from '../types';

const TZ = 'America/Caracas';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Fecha de hoy en Caracas como 'AAAA-MM-DD'. */
export function hoyCaracas(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/** Obtiene 'AAAA-MM-DD' de la fecha ISO o, si falta, del texto "Viernes, 13 Noviembre 2026". */
export function fechaDeSnapshot(s: Pick<RateSnapshot, 'fecha_valor' | 'fecha_valor_iso'>): string | null {
  const iso = s.fecha_valor_iso?.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const txt = (s.fecha_valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  const m = txt.match(/(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})/);
  if (!m) return null;
  const mes = MESES.findIndex((x) => m[2].startsWith(x.slice(0, 3))) + 1;
  if (!mes) return null;
  return `${m[3]}-${String(mes).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/** 'AAAA-MM-DD' -> 'Lun 16/11' */
function etiquetaCorta(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  const dia = DIAS_CORTOS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
  return `${dia} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

export interface TasasClasificadas {
  current?: RateSnapshot;
  next?: RateSnapshot;
}

/**
 * Reúne todas las tasas conocidas (current, next e historial), elimina
 * duplicados por fecha y las clasifica respecto a hoy.
 */
export function clasificarTasas(rates: ExchangeRates, now: Date = new Date()): TasasClasificadas {
  const hoy = hoyCaracas(now);
  const porFecha = new Map<string, RateSnapshot>();

  const candidatos: RateSnapshot[] = [
    ...(rates.history || []),
    ...(rates.rates?.current ? [rates.rates.current] : []),
    ...(rates.rates?.next ? [rates.rates.next] : []),
  ];

  for (const s of candidatos) {
    const f = fechaDeSnapshot(s);
    if (!f || !(s.usd > 0) || !(s.eur > 0)) continue;
    porFecha.set(f, s); // los últimos en la lista (current/next) tienen prioridad
  }

  const fechas = [...porFecha.keys()].sort();
  const fCurrent = [...fechas].reverse().find((f) => f <= hoy);
  const fNext = fechas.find((f) => f > hoy);

  const resultado: TasasClasificadas = {};
  if (fCurrent) {
    resultado.current = {
      ...porFecha.get(fCurrent)!,
      label: `Tasa Vigente (${porFecha.get(fCurrent)!.fecha_valor})`,
      short_label: 'Vigente Hoy',
    };
  }
  if (fNext) {
    resultado.next = {
      ...porFecha.get(fNext)!,
      label: `Tasa Publicada (${porFecha.get(fNext)!.fecha_valor})`,
      short_label: `Próx. Día · ${etiquetaCorta(fNext)}`,
    };
  }
  return resultado;
}
