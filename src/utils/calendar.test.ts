import { describe, expect, it } from "vitest";
import { DEFAULT_CALENDAR } from "@/types";
import {
  daysUntilEvaluation,
  holidayWeeksFromDates,
  sequenceFromWeek,
  termFromWeek,
  weekEndDate,
  weekInfo,
  weekNumberForDate,
  weekRangeForSequence,
  weekRangeForTerm,
  weekStartDate
} from "@/utils/calendar";

describe("weekNumberForDate", () => {
  it("maps the calendar start date to week 1", () => {
    expect(weekNumberForDate(new Date(2025, 8, 1), DEFAULT_CALENDAR)).toBe(1);
  });

  it("keeps Mon-Fri of the same week in week 1", () => {
    expect(weekNumberForDate(new Date(2025, 8, 5), DEFAULT_CALENDAR)).toBe(1);
  });

  it("rolls to week 2 after seven days", () => {
    expect(weekNumberForDate(new Date(2025, 8, 8), DEFAULT_CALENDAR)).toBe(2);
  });

  it("clamps dates before the year start to week 1", () => {
    expect(weekNumberForDate(new Date(2025, 7, 30), DEFAULT_CALENDAR)).toBe(1);
  });

  it("clamps dates beyond week 36", () => {
    expect(weekNumberForDate(new Date(2026, 6, 1), DEFAULT_CALENDAR)).toBe(36);
  });

  it("places Christmas (24 Nov) in week 13 and Easter (16 Feb) in week 25", () => {
    expect(weekNumberForDate(new Date(2025, 10, 24), DEFAULT_CALENDAR)).toBe(13);
    expect(weekNumberForDate(new Date(2026, 1, 16), DEFAULT_CALENDAR)).toBe(25);
  });
});

describe("weekStartDate / weekEndDate", () => {
  it("gives Monday and Friday of the academic week", () => {
    expect(weekStartDate(1, DEFAULT_CALENDAR).getDate()).toBe(1);
    expect(weekStartDate(1, DEFAULT_CALENDAR).getMonth()).toBe(8);
    expect(weekEndDate(1, DEFAULT_CALENDAR).getDate()).toBe(5);
    expect(weekEndDate(13, DEFAULT_CALENDAR).getDate()).toBe(28);
  });
});

describe("sequenceFromWeek / termFromWeek", () => {
  it("splits 36 weeks into six contiguous 6-week sequences", () => {
    const cases: Array<[number, number]> = [
      [1, 1], [6, 1], [7, 2], [12, 2], [13, 3], [18, 3],
      [19, 4], [24, 4], [25, 5], [30, 5], [31, 6], [36, 6]
    ];
    for (const [week, seq] of cases) {
      expect(sequenceFromWeek(week)).toBe(seq);
    }
  });

  it("maps weeks to the three 12-week terms", () => {
    expect(termFromWeek(1)).toBe(1);
    expect(termFromWeek(12)).toBe(1);
    expect(termFromWeek(13)).toBe(2);
    expect(termFromWeek(24)).toBe(2);
    expect(termFromWeek(25)).toBe(3);
    expect(termFromWeek(36)).toBe(3);
  });
});

describe("weekRangeForSequence / weekRangeForTerm", () => {
  it("produces contiguous sequence ranges", () => {
    expect(weekRangeForSequence(1)).toEqual([1, 6]);
    expect(weekRangeForSequence(3)).toEqual([13, 18]);
    expect(weekRangeForSequence(6)).toEqual([31, 36]);
  });

  it("produces contiguous term ranges", () => {
    expect(weekRangeForTerm(1)).toEqual([1, 12]);
    expect(weekRangeForTerm(2)).toEqual([13, 24]);
    expect(weekRangeForTerm(3)).toEqual([25, 36]);
  });
});

describe("weekInfo", () => {
  it("flags evaluation weeks (6, 12, 18, 24, 30, 36)", () => {
    for (const w of [6, 12, 18, 24, 30, 36]) {
      expect(weekInfo(w, DEFAULT_CALENDAR).isEvaluation).toBe(true);
    }
    expect(weekInfo(5, DEFAULT_CALENDAR).isEvaluation).toBe(false);
  });

  it("flags holiday weeks 13-14 and 25-26", () => {
    expect(weekInfo(13, DEFAULT_CALENDAR).isHoliday).toBe(true);
    expect(weekInfo(14, DEFAULT_CALENDAR).isHoliday).toBe(true);
    expect(weekInfo(25, DEFAULT_CALENDAR).isHoliday).toBe(true);
    expect(weekInfo(26, DEFAULT_CALENDAR).isHoliday).toBe(true);
    expect(weekInfo(15, DEFAULT_CALENDAR).isHoliday).toBe(false);
  });

  it("assigns weeks 13-15 to sequence 3 (no orphaned weeks)", () => {
    expect(weekInfo(13, DEFAULT_CALENDAR).sequence).toBe(3);
    expect(weekInfo(14, DEFAULT_CALENDAR).sequence).toBe(3);
    expect(weekInfo(15, DEFAULT_CALENDAR).sequence).toBe(3);
  });

  it("assigns weeks 25-27 to sequence 5", () => {
    expect(weekInfo(25, DEFAULT_CALENDAR).sequence).toBe(5);
    expect(weekInfo(27, DEFAULT_CALENDAR).sequence).toBe(5);
  });
});

describe("daysUntilEvaluation", () => {
  it("counts down to the sequence evaluation week", () => {
    expect(daysUntilEvaluation(19, DEFAULT_CALENDAR)).toBe(5);
    expect(daysUntilEvaluation(24, DEFAULT_CALENDAR)).toBe(0);
    expect(daysUntilEvaluation(31, DEFAULT_CALENDAR)).toBe(5);
  });
});

describe("holidayWeeksFromDates", () => {
  it("derives week ranges from real dates", () => {
    expect(
      holidayWeeksFromDates(new Date(2025, 10, 24), new Date(2025, 11, 5), DEFAULT_CALENDAR)
    ).toEqual({ startWeek: 13, endWeek: 14 });
  });
});