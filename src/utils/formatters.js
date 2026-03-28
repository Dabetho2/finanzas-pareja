export function formatCurrency(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number);
}

function getBogotaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const data = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      data[part.type] = part.value;
    }
  }

  return {
    year: data.year,
    month: data.month,
    day: data.day,
    hour: data.hour,
    minute: data.minute,
  };
}

export function getBogotaTodayISO(date = new Date()) {
  const { year, month, day } = getBogotaDateParts(date);
  return `${year}-${month}-${day}`;
}

export function formatBogotaDate(date = new Date()) {
  const { year, month, day } = getBogotaDateParts(date);
  return `${day}/${month}/${year}`;
}

export function formatBogotaDateTime(date = new Date()) {
  const { year, month, day, hour, minute } = getBogotaDateParts(date);
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function formatISODateToDisplay(isoDate) {
  if (!isoDate || !isoDate.includes('-')) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function getMonthNameFromISO(isoDate) {
  if (!isoDate || !isoDate.includes('-')) return '';

  const [, month] = isoDate.split('-');

  const monthMap = {
    '01': 'enero',
    '02': 'febrero',
    '03': 'marzo',
    '04': 'abril',
    '05': 'mayo',
    '06': 'junio',
    '07': 'julio',
    '08': 'agosto',
    '09': 'septiembre',
    '10': 'octubre',
    '11': 'noviembre',
    '12': 'diciembre',
  };

  return monthMap[month] || '';
}

export function formatCOPInput(rawDigits) {
  if (!rawDigits) return '';

  const clean = String(rawDigits).replace(/\D/g, '');
  if (!clean) return '';

  return `$ ${Number(clean).toLocaleString('es-CO')}`;
}

export function extractDigits(value) {
  return String(value || '').replace(/\D/g, '');
}