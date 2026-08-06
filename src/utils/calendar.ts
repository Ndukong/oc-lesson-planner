import type {
  SchoolCalendar,
  Sequence,
  Term,
  WeekInfo
} from "@/types";

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
  const start = new Date(calendar.startDate);
  const startOfStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffDays = Math.floor(
    (now.getTime() - startOfStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(36, week));
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
