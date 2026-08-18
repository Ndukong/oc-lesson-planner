import type {
  SchoolCalendar,
  Sequence,
  Term,
  WeekInfo
} from "@/types";

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Week number (1-36) for a given calendar date, relative to the academic year start (Monday-based weeks). */
export function weekNumberForDate(date: Date, calendar: SchoolCalendar): number {
  const startMs = startOfDay(calendar.startDate);
  const diffDays = Math.round((startOfDay(date) - startMs) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(36, week));
}

/** Monday of the given academic week. */
export function weekStartDate(week: number, calendar: SchoolCalendar): Date {
  const start = new Date(startOfDay(calendar.startDate));
  start.setDate(start.getDate() + (week - 1) * 7);
  return start;
}

/** Friday of the given academic week. */
export function weekEndDate(week: number, calendar: SchoolCalendar): Date {
  const start = weekStartDate(week, calendar);
  start.setDate(start.getDate() + 4);
  return start;
}

/** Derive startWeek/endWeek for a holiday from its dates. */
export function holidayWeeksFromDates(
  startDate: Date,
  endDate: Date,
  calendar: SchoolCalendar
): { startWeek: number; endWeek: number } {
  return {
    startWeek: weekNumberForDate(startDate, calendar),
    endWeek: weekNumberForDate(endDate, calendar)
  };
}

export function sequenceFromWeek(week: number): Sequence {
  if (week <= 6) return 1;
  if (week <= 12) return 2;
  if (week <= 18) return 3;
  if (week <= 24) return 4;
  if (week <= 30) return 5;
  return 6;
}

export function termFromWeek(week: number): Term {
  if (week <= 12) return 1;
  if (week <= 24) return 2;
  return 3;
}

export function weekRangeForTerm(term: Term): [number, number] {
  if (term === 1) return [1, 12];
  if (term === 2) return [13, 24];
  return [25, 36];
}

export function weekRangeForSequence(sequence: Sequence): [number, number] {
  return [sequence * 6 - 5, sequence * 6];
}

export function weekInfo(
  week: number,
  calendar: SchoolCalendar
): WeekInfo {
  return {
    week,
    sequence: sequenceFromWeek(week),
    term: termFromWeek(week),
    isHoliday: calendar.holidays.some(
      (h) => week >= h.startWeek && week <= h.endWeek
    ),
    isEvaluation: calendar.sequences.some(
      (s) => s.evaluationWeek === week
    )
  };
}

export function currentWeekNumber(
  calendar: SchoolCalendar
): number {
  const now = new Date();
  // School weeks run Monday-Friday; anchor the week boundary on Monday.
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return weekNumberForDate(monday, calendar);
}

export function daysUntilEvaluation(
  week: number,
  calendar: SchoolCalendar
): number | null {
  const current = weekInfo(week, calendar);
  const seq = calendar.sequences.find(
    (s) => s.number === current.sequence
  );
  if (!seq) return null;
  const delta = seq.evaluationWeek - week;
  return delta >= 0 ? delta : null;
}

export function isHolidayWeek(
  week: number,
  calendar: SchoolCalendar
): boolean {
  return calendar.holidays.some(
    (h) => week >= h.startWeek && week <= h.endWeek
  );
}

export function isEvaluationWeek(
  week: number,
  calendar: SchoolCalendar
): boolean {
  return calendar.sequences.some((s) => s.evaluationWeek === week);
}
