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

describe("buildProgression — real seeds", () => {
  for (const seed of SUBJECT_SEEDS) {
    it(`lays out a complete 36-week grid for ${seed.name}`, () => {
      for (const level of seed.classLevels) {
        const rows = buildProgression(seed).filter((r) => r.classLevel === level);
        expect(rows).toHaveLength(36);

        const ids = new Set(rows.map((r) => r.id));
        expect(ids.size).toBe(36);

        for (const row of rows) {
          // Every teaching week is filled — no silent blanks.
          if (!row.isHoliday && !row.isEvaluation) {
            expect(row.lessonTitle.trim()).not.toBe("");
          }
          // Holiday/evaluation flags are mutually exclusive and calendar-driven.
          if (row.isHoliday) expect(HOLIDAY_WEEKS.has(row.weekNumber)).toBe(true);
          if (row.isEvaluation) expect(EVAL_WEEKS.has(row.weekNumber)).toBe(true);
          expect(row.isHoliday && row.isEvaluation).toBe(false);
          // Sequence assignment follows the week, contiguously.
          expect(row.sequence).toBe(sequenceFromWeek(row.weekNumber));
          // Terms are 12-week blocks.
          const expectedTerm = row.weekNumber <= 12 ? 1 : row.weekNumber <= 24 ? 2 : 3;
          expect(row.term).toBe(expectedTerm);
        }
      }
    });
  }
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
    const rows = buildProgression(SUBJECT_SEEDS[0], custom).filter(
      (r) => r.classLevel === "Form 1"
    );
    const week5 = rows.find((r) => r.weekNumber === 5);
    const week6 = rows.find((r) => r.weekNumber === 6);
    expect(week5?.isEvaluation).toBe(true);
    expect(week6?.isEvaluation).toBe(false);
  });

  it("respects custom holidays", () => {
    const rows = buildProgression(SUBJECT_SEEDS[0], custom).filter(
      (r) => r.classLevel === "Form 1"
    );
    expect(rows.find((r) => r.weekNumber === 1)?.isHoliday).toBe(true);
    expect(rows.find((r) => r.weekNumber === 2)?.lessonTitle).toBe("Opening week");
    // First lesson starts on the first free week (week 3).
    expect(rows.find((r) => r.weekNumber === 3)?.lessonTitle).toBe(
      SUBJECT_SEEDS[0].curriculum["Form 1"]?.[0]?.title
    );
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
    const rows = buildProgression(fakeSeed(5), DEFAULT_CALENDAR).filter(
      (r) => r.classLevel === "Form 1"
    );
    const spare = rows.filter((r) => r.lessonTitle === SPARE_WEEK_TITLE);
    expect(spare).toHaveLength(TEACHING_WEEKS - 5);
    for (const r of spare) {
      expect(r.isHoliday).toBe(false);
      expect(r.isEvaluation).toBe(false);
      expect(r.duration).toBeGreaterThan(0);
    }
  });

  it("warns and never leaves blanks when lessons overflow the grid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = buildProgression(fakeSeed(40), DEFAULT_CALENDAR).filter(
      (r) => r.classLevel === "Form 1"
    );
    const teaching = rows.filter((r) => !r.isHoliday && !r.isEvaluation);
    expect(teaching).toHaveLength(TEACHING_WEEKS);
    for (const r of teaching) {
      expect(r.lessonTitle.trim()).not.toBe("");
    }
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("did not fit into the 36-week grid")
    );
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
      const names = modules.map((m) => m.name);
      expect(new Set(names).size).toBe(names.length); // unique module names
      modules.forEach((m, i) => expect(m.moduleNumber).toBe(i + 1));
      for (const m of modules) {
        expect(m.topics.length).toBeGreaterThan(0);
        for (const t of m.topics) {
          expect(t.coreKnowledge.trim().length).toBeGreaterThan(20);
          expect(t.competencies.trim()).not.toBe("");
        }
      }
    }

    const form1Rows = built.progression.filter((r) => r.classLevel === "Form 1");
    expect(form1Rows).toHaveLength(36);
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
    const rows = buildProgression(physics, DEFAULT_CALENDAR).filter(
      (r) => r.classLevel === "Lower Sixth"
    );
    expect(rows).toHaveLength(36);
    const teaching = rows.filter((r) => !r.isHoliday && !r.isEvaluation);
    for (const r of teaching) {
      expect(r.lessonTitle).toBe(TEACHER_PLANNED_TITLE);
    }
    expect(rows.some((r) => r.isEvaluation)).toBe(true);
  });

  it("keeps spare-week semantics for levels that have a partial curriculum", () => {
    if (!physics) return;
    // a seed variant with only two Form 1 lessons uses the spare-week label
    const partial: SubjectSeed = {
      ...physics,
      id: "partial-test",
      curriculum: {
        "Form 1": (physics.curriculum["Form 1"] ?? []).slice(0, 2)
      },
      classLevels: ["Form 1"]
    };
    const rows = buildProgression(partial, DEFAULT_CALENDAR).filter(
      (r) => r.classLevel === "Form 1"
    );
    const spare = rows.filter((r) => r.lessonTitle === SPARE_WEEK_TITLE);
    expect(spare.length).toBeGreaterThan(0);
  });
});

describe("real MINESEC matrix integration", () => {
  it("uses real families of situations for Physics Form 1", () => {
    const physics = SUBJECT_SEEDS.find((s) => s.id === "physics");
    expect(physics).toBeDefined();
    if (!physics) return;
    const built = buildSubjectSeed(physics);
    const world = built.modules.find(
      (m) => m.classLevel === "Form 1" && m.name.toLowerCase().includes("world")
    );
    expect(world).toBeDefined();
    if (!world) return;
    // real matrix text, not the generated template
    expect(world.familiesOfSituations).not.toContain("Learners encounter");
    expect(world.familiesOfSituations.toLowerCase()).toContain("investigating");
  });

  it("matches chapter-level core knowledge from the matrix content", () => {
    const physics = SUBJECT_SEEDS.find((s) => s.id === "physics");
    if (!physics) return;
    const built = buildSubjectSeed(physics);
    const world = built.modules.find(
      (m) => m.classLevel === "Form 1" && m.name.toLowerCase().includes("world")
    );
    expect(world).toBeDefined();
    if (!world) return;
    const safety = world.topics.find((t) => t.name.toLowerCase().includes("safety"));
    expect(safety).toBeDefined();
    if (!safety) return;
    // the real matrix content item mentions safety rules / laboratory
    expect(safety.coreKnowledge.toLowerCase()).toContain("safety");
  });

  it("falls back to the template for subjects without extracted data", () => {
    const lit = SUBJECT_SEEDS.find((s) => s.id === "literature-in-english");
    if (!lit) return;
    const built = buildSubjectSeed(lit);
    const form4 = built.modules.filter((m) => m.classLevel === "Form 4");
    for (const m of form4) {
      // Form 4/5 literature PDFs are .docx and were not extracted
      expect(m.familiesOfSituations).toContain("Learners encounter");
    }
  });
});