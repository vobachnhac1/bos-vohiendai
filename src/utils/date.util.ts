/**
 * Date utility functions for UTC timezone handling
 * All dates in the system should be stored and processed in UTC
 */

/**
 * Get current date/time in UTC
 */
export function nowUTC(): Date {
  return new Date();
}

/**
 * Convert any date to UTC Date object
 */
export function toUTC(date: Date | string | number): Date {
  if (date instanceof Date) {
    return new Date(date.toISOString());
  }
  return new Date(date);
}

/**
 * Format date to ISO string (UTC)
 */
export function toISOString(date: Date | string | number): string {
  return toUTC(date).toISOString();
}

/**
 * Parse ISO string to UTC Date
 */
export function parseISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get UTC timestamp (milliseconds since epoch)
 */
export function getUTCTimestamp(date?: Date | string | number): number {
  if (!date) {
    return Date.now();
  }
  return toUTC(date).getTime();
}

/**
 * Create date from UTC components
 */
export function createUTCDate(
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  seconds: number = 0,
  milliseconds: number = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
}

/**
 * Get start of day in UTC
 */
export function startOfDayUTC(date: Date | string | number): Date {
  const d = toUTC(date);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Get end of day in UTC
 */
export function endOfDayUTC(date: Date | string | number): Date {
  const d = toUTC(date);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    23, 59, 59, 999
  ));
}

/**
 * Add days to a date (UTC)
 */
export function addDaysUTC(date: Date | string | number, days: number): Date {
  const d = toUTC(date);
  const result = new Date(d);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Subtract days from a date (UTC)
 */
export function subtractDaysUTC(date: Date | string | number, days: number): Date {
  return addDaysUTC(date, -days);
}

/**
 * Add hours to a date (UTC)
 */
export function addHoursUTC(date: Date | string | number, hours: number): Date {
  const d = toUTC(date);
  const result = new Date(d);
  result.setUTCHours(result.getUTCHours() + hours);
  return result;
}

/**
 * Get difference in days between two dates (UTC)
 */
export function diffDaysUTC(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = startOfDayUTC(date1);
  const d2 = startOfDayUTC(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day (UTC)
 */
export function isSameDayUTC(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = toUTC(date1);
  const d2 = toUTC(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

/**
 * Format date for display (ISO format in UTC)
 */
export function formatDateUTC(date: Date | string | number, includeTime: boolean = true): string {
  const d = toUTC(date);
  
  if (includeTime) {
    return d.toISOString();
  }
  
  return d.toISOString().split('T')[0];
}

/**
 * Get UTC date components
 */
export function getUTCComponents(date: Date | string | number): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const d = toUTC(date);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1, // 1-based month
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    seconds: d.getUTCSeconds(),
    milliseconds: d.getUTCMilliseconds(),
  };
}

/**
 * Ensure date is valid, return null if invalid
 */
export function validateDate(date: any): Date | null {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return d;
}

/**
 * Get date range for queries (start and end of day in UTC)
 */
export function getDateRangeUTC(
  startDate: Date | string | number,
  endDate: Date | string | number
): { start: Date; end: Date } {
  return {
    start: startOfDayUTC(startDate),
    end: endOfDayUTC(endDate),
  };
}

