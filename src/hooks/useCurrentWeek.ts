import { useMemo } from "react";
import { useCalendar } from "@/db/hooks";
import { currentWeekNumber, sequenceFromWeek, termFromWeek } from "@/utils/calendar";

export function useCurrentWeek(): {
  week: number;
  sequence: number;
  term: 1 | 2 | 3;
} {
  const calendar = useCalendar();

  return useMemo(() => {
    const week = calendar
      ? currentWeekNumber(calendar)
      : 1;
    return {
      week,
      sequence: sequenceFromWeek(week),
      term: termFromWeek(week)
    };
  }, [calendar]);
}
