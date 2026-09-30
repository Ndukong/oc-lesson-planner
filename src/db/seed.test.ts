import { afterEach, describe, expect, it, vi } from "vitest";
import { SUBJECT_SEEDS } from "@/db/seed-curriculum";
import type { SubjectSeed } from "@/db/seed-curriculum";
import { buildProgression, buildSubjectSeed, SPARE_WEEK_TITLE, TEACHER_PLANNED_TITLE } from "@/db/seed-builder";
import { DEFAULT_CALENDAR } from "@/types";
import type { SchoolCalendar } from "@/types";
import { sequenceFromWeek } from "@/utils/calendar";

afterEach(() => {
  vi.restoreAllMocks();
});

const HOLIDAY_WEEKS = new Set([13, 14, 25, 26]);
const EVAL_WEEKS = new Set([6, 12, 18, 24, 30, 36]);
const TEACHING_WEEKS = 36 - HOLIDAY_WEEKS.size - EVAL_WEEKS.size;

function gridRows(rows: ReturnType<typeof buildProgression>, level: string) {
  return rows.filter((r) => r.classLevel === level && r.weekNumber <= 36);
}
function overflowRows(rows: ReturnType<typeof buildProgression>, level: string) {
  return rows.filter((r) => r.classLevel === level && r.weekNumber > 36);
}

describe("buildProgression — real seeds", () => {
  for (const seed of SUBJECT_SEEDS) {
    it(`lays out a complete 36-week grid for ${seed.name}`, () => {
      for (const level of seed.classLevels) {
        const all = buildProgression(seed);
        const rows = gridRows(all, level);
        expect(rows).toHaveLength(36);

        const ids = new Set(rows.map((r) => r.id));
        expect(ids.size).toBe(36);

        const over = overflowRows(all, level);
        const lessons = (seed.curriculum[level as never] as unknown[] | undefined)?.length ?? 0;
        if (lessons > TEACHING_WEEKS) {
          expect(over.length).toBe(lessons - TEACHING_WEEKS);
        } else {
          expect(over.length).toBe(0);
        }

        for (const row of rows) {
          if (!row.isHoliday && !row.isEvaluation) {
            expect(row.lessonTitle.trim()).not.toBe("");
            if (row.lessonTitle !== SPARE_WEEK_TITLE && row.lessonTitle !== TEACHER_PLANNED_TITLE) {
              expect(row.lessonNumber).toBeDefined();
              expect(row.weekPeriod).toBeDefined();
            }
          }
          if (row.isHoliday) expect(HOLIDAY_WEEKS.has(row.weekNumber)).toBe(true);
          if (row.isEvaluation) expect(EVAL_WEEKS.has(row.weekNumber)).toBe(true);
          expect(row.isHoliday && row.isEvaluation).toBe(false);
          expect(row.sequence).toBe(sequenceFromWeek(row.weekNumber));
          const expectedTerm = row.weekNumber <= 12 ? 1 : row.weekNumber <= 24 ? 2 : 3;
          expect(row.term).toBe(expectedTerm);
        }
      }
    });

    it(`uses Lesson title as the display title for ${seed.name}`, () => {
      const level = seed.classLevels.find((l) => (seed.curriculum[l as never] as unknown[] | undefined)?.length) ?? seed.classLevels[0];
      const teaching = gridRows(buildProgression(seed), level).filter((r) => !r.isHoliday && !r.isEvaluation && r.lessonTitle !== SPARE_WEEK_TITLE && r.lessonTitle !== TEACHER_PLANNED_TITLE);
      if (teaching.length === 0) return;
      const firstLessonTitle = (seed.curriculum[level as never] as { title: string }[])[0]?.title ?? "";
      const firstTitleClean = firstLessonTitle.replace(/^Lesson\s*\d+\s*[:\.]?\s*/i, "").trim();
      expect(teaching[0].lessonTitle).toBe(firstTitleClean);
    });
  }

  it("preserves every progression-sheet lesson: teaching + overflow == curriculum length", () => {
    for (const seed of SUBJECT_SEEDS) {
      for (const level of seed.classLevels) {
        const cur = (seed.curriculum[level as never] as unknown[] | undefined)?.length ?? 0;
        if (cur === 0) continue;
        const all = buildProgression(seed);
        const grid = gridRows(all, level).filter((r) => !r.isHoliday && !r.isEvaluation && r.lessonTitle !== SPARE_WEEK_TITLE && r.lessonTitle !== TEACHER_PLANNED_TITLE).length;
        const over = overflowRows(all, level).length;
        expect(grid + over).toBe(cur);
      }
    }
  });
});

describe("buildProgression — custom calendars", () => {
  const custom: SchoolCalendar = {
    ...DEFAULT_CALENDAR,
    holidays: [{ name: "Opening week", startWeek: 1, endWeek: 2 }],
    sequences: [
      { number: 1, startWeek: 1, endWeek: 6, evaluationWeek: 5 },
      { number: 2, startWeek: 7, endWeek: 12, evaluationWeek: 12 },
      { number: 3, startWeek: 13, endWeek: 18, evaluationWeek: 18 },
      { number: 4, startWeek: 19, endWeek: 24, evaluationWeek: 24 },
      { number: 5, startWeek: 25, endWeek: 30, evaluationWeek: 30 },
      { number: 6, startWeek: 31, endWeek: 36, evaluationWeek: 36 }
    ]
  };

  it("respects custom evaluation weeks instead of hardcoded ones", () => {
    const rows = gridRows(buildProgression(SUBJECT_SEEDS[0], custom), "Form 1");
    const week5 = rows.find((r) => r.weekNumber === 5);
    const week6 = rows.find((r) => r.weekNumber === 6);
    expect(week5?.isEvaluation).toBe(true);
    expect(week6?.isEvaluation).toBe(false);
  });

  it("respects custom holidays", () => {
    const rows = gridRows(buildProgression(SUBJECT_SEEDS[0], custom), "Form 1");
    expect(rows.find((r) => r.weekNumber === 1)?.isHoliday).toBe(true);
    expect(rows.find((r) => r.weekNumber === 2)?.lessonTitle).toBe("Opening week");
    expect(gridRows(buildProgression(SUBJECT_SEEDS[0], custom), "Form 1").find((r) => r.weekNumber === 3)?.lessonTitle).toBe(
      (SUBJECT_SEEDS[0].curriculum["Form 1"]?.[0]?.title ?? "").replace(/^Lesson\s*\d+\s*[:\.]?\s*/i, "").trim()
    );
  });

  it("keeps progression order: first teaching week uses first curriculum lesson", () => {
    const rows = gridRows(buildProgression(SUBJECT_SEEDS[0]), "Form 1").filter((r) => !r.isHoliday && !r.isEvaluation);
    const firstTitle = (SUBJECT_SEEDS[0].curriculum["Form 1"]?.[0]?.title ?? "").replace(/^Lesson\s*\d+\s*[:\.]?\s*/i, "").trim();
    expect(rows[0]?.lessonTitle).toBe(firstTitle);
  });
});

describe("buildProgression — under- and over-filled curricula", () => {
  function fakeSeed(lessonCount: number): SubjectSeed {
    return {
      id: "test-subject",
      name: "Test Subject",
      classLevels: ["Form 1"],
      periodsPerWeek: { "Form 1": 2 },
      curriculum: {
        "Form 1": Array.from({ length: lessonCount }, (_, i) => ({
          module: "M",
          chapter: `C${i + 1}`,
          title: `Lesson ${i + 1}`,
          duration: 2
        }))
      }
    };
  }

  it("labels leftover teaching weeks as spare weeks (no blanks)", () => {
    const rows = gridRows(buildProgression(fakeSeed(5), DEFAULT_CALENDAR), "Form 1");
    const spare = rows.filter((r) => r.lessonTitle === SPARE_WEEK_TITLE);
    expect(spare).toHaveLength(TEACHING_WEEKS - 5);
    for (const r of spare) {
      expect(r.isHoliday).toBe(false);
      expect(r.isEvaluation).toBe(false);
      expect(r.duration).toBeGreaterThan(0);
    }
  });

  it("appends overflow rows beyond week 36 and keeps the 36-week grid intact", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const all = buildProgression(fakeSeed(40), DEFAULT_CALENDAR);
    const grid = gridRows(all, "Form 1");
    const over = overflowRows(all, "Form 1");
    expect(grid).toHaveLength(36);
    expect(grid.filter((r) => !r.isHoliday && !r.isEvaluation)).toHaveLength(TEACHING_WEEKS);
    for (const r of grid.filter((r) => !r.isHoliday && !r.isEvaluation)) {
      expect(r.lessonTitle.trim()).not.toBe("");
    }
    expect(over).toHaveLength(40 - TEACHING_WEEKS);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("did not fit into the 36-week grid"));
  });
});

describe("buildSubjectSeed", () => {
  const biology = SUBJECT_SEEDS.find((s) => s.id === "biology");
  it("builds modules, topics and progression for every class level", () => {
    expect(biology).toBeDefined();
    if (!biology) return;
    const built = buildSubjectSeed(biology);

    expect(built.subject.id).toBe("biology");
    expect(built.subject.classLevels).toEqual(biology.classLevels);
    expect(built.calendar).toEqual(DEFAULT_CALENDAR);

    for (const level of biology.classLevels) {
      const modules = built.modules.filter((m) => m.classLevel === level);
      if ((biology.curriculum[level as never] as unknown[] | undefined)?.length) {
        expect(modules.length).toBeGreaterThan(0);
        const names = modules.map((m) => m.name);
        expect(new Set(names).size).toBe(names.length);
        modules.forEach((m, i) => expect(m.moduleNumber).toBe(i + 1));
        for (const m of modules) {
          expect(m.topics.length).toBeGreaterThan(0);
          for (const t of m.topics) {
            expect(t.coreKnowledge.trim().length).toBeGreaterThan(20);
            expect(t.competencies.trim()).not.toBe("");
          }
        }
      }
    }

    const form1Grid = gridRows(built.progression, "Form 1");
    expect(form1Grid).toHaveLength(36);
    const teaching = form1Grid.filter((r) => !r.isHoliday && !r.isEvaluation && r.lessonTitle !== SPARE_WEEK_TITLE);
    for (const r of teaching) {
      expect(r.chapter.trim()).not.toBe("");
      expect(r.lessonTitle.trim()).not.toBe("");
    }
  });
});

describe("Sixth Form support", () => {
  const physics = SUBJECT_SEEDS.find((s) => s.id === "physics");
  const citizenship = SUBJECT_SEEDS.find((s) => s.id === "citizenship-education");

  it("adds Lower/Upper Sixth to A-Level subjects but not citizenship", () => {
    expect(physics?.classLevels).toContain("Lower Sixth");
    expect(physics?.classLevels).toContain("Upper Sixth");
    expect(citizenship?.classLevels).not.toContain("Lower Sixth");
  });

  it("gives sixth-form levels a full teacher-planned grid", () => {
    if (!physics) return;
    const rows = gridRows(buildProgression(physics, DEFAULT_CALENDAR), "Lower Sixth");
    expect(rows).toHaveLength(36);
    const teaching = rows.filter((r) => !r.isHoliday && !r.isEvaluation);
    for (const r of teaching) {
      expect(r.lessonTitle).toBe(TEACHER_PLANNED_TITLE);
    }
    expect(rows.some((r) => r.isEvaluation)).toBe(true);
  });

  it("keeps spare-week semantics for levels that have a partial curriculum", () => {
    if (!physics) return;
    const partial: SubjectSeed = {
      ...physics,
      id: "partial-test",
      curriculum: {
        "Form 1": (physics.curriculum["Form 1"] ?? []).slice(0, 2)
      },
      classLevels: ["Form 1"]
    };
    const rows = gridRows(buildProgression(partial, DEFAULT_CALENDAR), "Form 1");
    const spare = rows.filter((r) => r.lessonTitle === SPARE_WEEK_TITLE);
    expect(spare.length).toBeGreaterThan(0);
  });
});

describe("progression sheet fidelity", () => {
  it("stores Chapter and Week/Period from the sheet on every teaching week", () => {
    for (const seed of SUBJECT_SEEDS) {
      for (const level of seed.classLevels) {
        const cur = seed.curriculum[level as never] as { chapter: string; weekRaw?: string }[] | undefined;
        if (!cur?.length) continue;
        const rows = gridRows(buildProgression(seed), level).filter((r) => !r.isHoliday && !r.isEvaluation && r.lessonTitle !== SPARE_WEEK_TITLE && r.lessonTitle !== TEACHER_PLANNED_TITLE);
        for (const r of rows) {
          expect(r.chapter.trim().length).toBeGreaterThan(0);
          expect(r.weekPeriod).toBeDefined();
          expect(String(r.weekPeriod)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        }
      }
    }
  });

  it("weekPeriod matches the sheet span for the first lesson of each level", () => {
    for (const seed of SUBJECT_SEEDS) {
      for (const level of seed.classLevels) {
        const cur = seed.curriculum[level as never] as { weekRaw?: string }[] | undefined;
        if (!cur?.length || !cur[0]?.weekRaw) continue;
        const first = gridRows(buildProgression(seed), level).find((r) => !r.isHoliday && !r.isEvaluation);
        expect(first?.weekPeriod).toBe(cur[0].weekRaw);
      }
    }
  });

  it("Syllabus modules are derived from the Chapter column (one module per distinct chapter)", () => {
    const bio = SUBJECT_SEEDS.find((s) => s.id === "biology");
    if (!bio) return;
    const built = buildSubjectSeed(bio);
    const F1 = built.modules.filter((m) => m.classLevel === "Form 1");
    expect(F1.length).toBeGreaterThanOrEqual(8);
    expect(F1.some((m) => /environment/i.test(m.name))).toBe(true);
  });
});

describe("real MINESEC matrix integration (optional enrichment)", () => {
  it("still enriches matching modules with real families of situations where available", () => {
    const seedsWithMatrix = SUBJECT_SEEDS.filter((s) => ["biology", "chemistry", "physics", "mathematics", "computer-science", "geography", "history"].includes(s.id));
    let enriched = 0;
    for (const seed of seedsWithMatrix) {
      const built = buildSubjectSeed(seed);
      for (const level of seed.classLevels.slice(0, 3)) {
        for (const m of built.modules.filter((x) => x.classLevel === level)) {
          if (!m.familiesOfSituations.includes("Learners encounter")) enriched++;
        }
      }
    }
    expect(enriched).toBeGreaterThan(0);
  });

  it("falls back to the template for subjects without extracted data", () => {
    const lit = SUBJECT_SEEDS.find((s) => s.id === "literature-in-english");
    if (!lit) return;
    const built = buildSubjectSeed(lit);
    const form4 = built.modules.filter((m) => m.classLevel === "Form 4");
    for (const m of form4) {
      expect(m.familiesOfSituations).toContain("Learners encounter");
    }
  });
});
