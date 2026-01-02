export const MONTH_INFO = {
  1: { suffix: 'jan', name: 'Enero', nameEn: 'January' },
  2: { suffix: 'feb', name: 'Febrero', nameEn: 'February' },
  3: { suffix: 'mar', name: 'Marzo', nameEn: 'March' },
  4: { suffix: 'apr', name: 'Abril', nameEn: 'April' },
  5: { suffix: 'may', name: 'Mayo', nameEn: 'May' },
  6: { suffix: 'jun', name: 'Junio', nameEn: 'June' },
  7: { suffix: 'jul', name: 'Julio', nameEn: 'July' },
  8: { suffix: 'aug', name: 'Agosto', nameEn: 'August' },
  9: { suffix: 'sep', name: 'Septiembre', nameEn: 'September' },
  10: { suffix: 'oct', name: 'Octubre', nameEn: 'October' },
  11: { suffix: 'nov', name: 'Noviembre', nameEn: 'November' },
  12: { suffix: 'dec', name: 'Diciembre', nameEn: 'December' },
} as const;

export type MonthNumber = keyof typeof MONTH_INFO;

export const getMonthSuffix = (month: number): string => {
  return MONTH_INFO[month as MonthNumber]?.suffix || 'jan';
};

export const getMonthName = (month: number, language: 'es' | 'en' = 'es'): string => {
  const info = MONTH_INFO[month as MonthNumber];
  return language === 'es' ? info?.name : info?.nameEn;
};

/**
 * Get table name for monthly data
 * Note: Tables now support multi-year data via a 'year' column in the database
 * The table name remains the same (e.g., 'monthly_transactions_jan') but queries
 * should filter by the 'year' column to get data for specific years
 *
 * @param baseTable - Base table name (e.g., 'monthly_transactions')
 * @param month - Month number (1-12)
 * @returns Table name with month suffix (e.g., 'monthly_transactions_jan')
 */
export const getTableName = (baseTable: string, month: number): string => {
  const suffix = getMonthSuffix(month);
  return `${baseTable}_${suffix}`;
};
