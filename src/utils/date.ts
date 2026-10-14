import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  getDaysInMonth,
  getDate
} from 'date-fns';

/**
 * Returns today's date in local calendar 'YYYY-MM-DD' format.
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parses a 'YYYY-MM-DD' date string into a local Date object anchored at noon
 * to avoid daylight saving and timezone boundary shifts across midnight.
 */
export function parseDateSafe(dateString: string): Date {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date();
}

/**
 * Formats a Date object as 'YYYY-MM-DD'.
 */
export function formatDateSafe(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formats a date string for display (e.g. "Wednesday, Oct 14").
 */
export function formatDisplayDate(dateString: string, options?: { showYear?: boolean; showDayName?: boolean }): string {
  const date = parseDateSafe(dateString);
  const showYear = options?.showYear ?? false;
  const showDayName = options?.showDayName ?? true;

  if (showDayName && showYear) {
    return format(date, 'EEE, MMM d, yyyy');
  }
  if (showDayName) {
    return format(date, 'EEEE, MMM d');
  }
  if (showYear) {
    return format(date, 'MMM d, yyyy');
  }
  return format(date, 'MMM d');
}

/**
 * Returns the month key 'YYYY-MM' for a given date string or Date object.
 */
export function getMonthKey(dateOrString: Date | string): string {
  if (typeof dateOrString === 'string') {
    return dateOrString.substring(0, 7);
  }
  return format(dateOrString, 'yyyy-MM');
}

/**
 * Returns boundaries of the calendar week for a given anchor date string.
 * Week starts on Monday.
 */
export function getWeekBoundaries(anchorDateStr: string): { startStr: string; endStr: string; display: string } {
  const date = parseDateSafe(anchorDateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  const startStr = formatDateSafe(start);
  const endStr = formatDateSafe(end);
  const display = `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;

  return { startStr, endStr, display };
}

/**
 * Navigate weeks forward or backward.
 */
export function shiftWeek(anchorDateStr: string, direction: 'prev' | 'next'): string {
  const date = parseDateSafe(anchorDateStr);
  const shifted = direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1);
  return formatDateSafe(shifted);
}

/**
 * Shift month forward or backward.
 */
export function shiftMonth(anchorDateStr: string, direction: 'prev' | 'next'): string {
  const date = parseDateSafe(anchorDateStr);
  const shifted = direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1);
  return formatDateSafe(shifted);
}

/**
 * Checks if a date string is between start and end date strings inclusive.
 */
export function isDateWithin(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr;
}

/**
 * Checks if the given date is today.
 */
export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Returns month name and year (e.g. "October 2026") from 'YYYY-MM'.
 */
export function formatMonthName(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    return format(new Date(year, month, 1), 'MMMM yyyy');
  }
  return monthKey;
}

/**
 * Returns day-of-month and total days in current month.
 */
export function getMonthProgress(dateStr: string): { currentDay: number; totalDays: number; progressPercent: number } {
  const date = parseDateSafe(dateStr);
  const totalDays = getDaysInMonth(date);
  const currentDay = Math.min(getDate(date), totalDays);
  const progressPercent = Math.round((currentDay / totalDays) * 100);
  return { currentDay, totalDays, progressPercent };
}
