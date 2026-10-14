import { describe, it, expect } from 'vitest';
import {
  parseDateSafe,
  formatDateSafe,
  getTodayDateString,
  getWeekBoundaries,
  shiftWeek,
  shiftMonth,
  isDateWithin,
  getMonthKey,
  formatDisplayDate
} from '../src/utils/date';

describe('Timezone-Safe Date Operations', () => {
  it('parses YYYY-MM-DD date strings anchored at noon without day-shift', () => {
    const parsed = parseDateSafe('2026-10-14');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // 0-indexed October
    expect(parsed.getDate()).toBe(14);
    expect(parsed.getHours()).toBe(12); // Noon anchor
    expect(formatDateSafe(parsed)).toBe('2026-10-14');
  });

  it('calculates calendar week boundaries starting on Monday', () => {
    // 2026-10-14 is a Wednesday
    const { startStr, endStr } = getWeekBoundaries('2026-10-14');
    expect(startStr).toBe('2026-10-12'); // Monday
    expect(endStr).toBe('2026-10-18');   // Sunday
  });

  it('navigates weeks backward and forward accurately', () => {
    const current = '2026-10-14';
    const prevWeek = shiftWeek(current, 'prev');
    const nextWeek = shiftWeek(current, 'next');

    expect(prevWeek).toBe('2026-10-07');
    expect(nextWeek).toBe('2026-10-21');
  });

  it('navigates months backward and forward accurately', () => {
    const current = '2026-10-14';
    const prevMonth = shiftMonth(current, 'prev');
    const nextMonth = shiftMonth(current, 'next');

    expect(prevMonth).toBe('2026-09-14');
    expect(nextMonth).toBe('2026-11-14');
  });

  it('correctly evaluates isDateWithin inclusive intervals', () => {
    expect(isDateWithin('2026-10-14', '2026-10-12', '2026-10-18')).toBe(true);
    expect(isDateWithin('2026-10-12', '2026-10-12', '2026-10-18')).toBe(true);
    expect(isDateWithin('2026-10-18', '2026-10-12', '2026-10-18')).toBe(true);
    expect(isDateWithin('2026-10-11', '2026-10-12', '2026-10-18')).toBe(false);
    expect(isDateWithin('2026-10-19', '2026-10-12', '2026-10-18')).toBe(false);
  });

  it('extracts month key accurately', () => {
    expect(getMonthKey('2026-10-14')).toBe('2026-10');
    expect(getMonthKey('2026-01-01')).toBe('2026-01');
  });

  it('formats dates for display with day names', () => {
    const display = formatDisplayDate('2026-10-14', { showYear: true, showDayName: true });
    expect(display).toContain('Oct 14, 2026');
  });
});
