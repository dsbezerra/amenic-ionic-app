
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
];

/**
 * Returns the name of the given month number
 */
export const getNameOfMonth = (month: number, abbr = false): string => {
  let result = MONTHS[month];
  if (!result) {
    return '';
  }

  if (abbr) {
    result = result.substring(0, 3);
  }

  return result;
}

/**
 * Parses a Date format to text day month year
 * @param date Date to parse
 */
export const parseDate = (date: Date, abbr = false): string => {
  if (!date) return 'Data não disponível';

  const d = date.getUTCDate();
  const m = date.getUTCMonth();
  const y = date.getUTCFullYear();

  let mText = MONTHS[m];
  if (abbr) {
    mText = mText.substring(0, 3);
    return `${d} ${mText} ${y}`;
  }

  return `${d} de ${mText} de ${y}`;
}

/**
 * Parses a date in milliseconds representation to text day month year
 * @param date Date as milli to parse
 */
export const parseMillisDate = (date: number): string => {
  return parseDate(new Date(date));
}

interface Period {
  start: string;
  end: string;
}
// Formats the period date
export const formatPeriodDate = (period: Period): string => {
  if (!period || !period.start || !period.end) {
    return '';
  }

  const start = new Date(period.start);
  const end   = new Date(period.end);
  
  const sDay   = addZero(start.getUTCDate());
  const sMonth = addZero(start.getUTCMonth() + 1);
  
  const eDay   = addZero(end.getUTCDate());
  const eMonth = addZero(end.getUTCMonth() + 1);

  return `${sDay}/${sMonth} a ${eDay}/${eMonth}`;
}

// Adds a left handed zero in numbers below 10
const addZero = (i: number): string => {
  if (i < 10) {
    return '0' + i;
  } 

  return String(i);
}
