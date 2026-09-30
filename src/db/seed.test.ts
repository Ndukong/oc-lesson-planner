import { describe, expect, it } from "vitest";
import { SUBJECT_SEEDS } from "@/db/seed-curriculum";
import { buildProgression, buildSubjectSeed, groupProgressionByTerm } from "@/db/seed-builder";

function progressionFor(seed: (typeof SUBJECT_SEEDS)[number], level: string) {
  return buildProgression(seed).filter((r) => r.classLevel === level);
}

describe("buildProgression — term-grouped from harmonised sheets", () => {
  for (const seed of SUBJECT_SEEDS) {
    it(`lays out every lesson for ${seed.name} grouped by TERM`, () => {
      for (const level of seed.classLevels) {
        const cur = (seed.curriculum[level as never] as unknown[] | undefined) ?? [];
        const rows = progressionFor(seed, level);
        if (cur.length === 0) {
          expect(rows).toHaveLength(0);
          continue;
        }
        expect(rows).toHaveLength(cur.length);
        const numbers = rows.map((r) => r.lessonNumber);
        expect(numbers).toEqual(Array.from({ length: cur.length }, (_, i) => i + 1));
        for (const r of rows) {
          expect(r.lessonTitle.trim()).not.toBe("");
          expect(r.chapter.trim().length).toBeGreaterThan(0);
          expect([1, 2, 3]).toContain(r.term);
        }
        const byTerm = groupProgressionByTerm(rows);
        const flat = byTerm.flatMap((g) => g.lessons);
        expect(flat).toHaveLength(cur.length);
      }
    });
  }

  it("Form 3 Mathematics: 76 lessons (header) as 3 terms, first term ≈32 lessons", () => {
    const maths = SUBJECT_SEEDS.find((s) => s.id === "mathematics");
    expect(maths).toBeDefined();
    if (!maths) return;
    const rows = progressionFor(maths, "Form 3");
    expect(rows.length).toBe(76);
    const byTerm = groupProgressionByTerm(rows);
    expect(byTerm.length).toBe(3);
    expect(byTerm[0].term).toBe(1);
    expect(byTerm[0].lessons.length).toBeGreaterThanOrEqual(20);
    expect(rows[0].rawTitle).toMatch(/Contact/i);
    expect(rows[0].term).toBe(1);
    const total = byTerm.reduce((a, g) => a + g.lessons.length, 0);
    expect(total).toBe(rows.length);
  });

  it("preserves sheet order: first lesson equals first curriculum entry, last equals last", () => {
    for (const seed of SUBJECT_SEEDS) {
      for (const level of seed.classLevels) {
        const cur = seed.curriculum[level as never] as { title: string }[] | undefined;
        if (!cur?.length) continue;
        const rows = progressionFor(seed, level);
        const clean = (t: string) => t.replace(/^Lesson\s*\d+\s*[:\.]?\s*/i, "").trim();
        expect(rows[0].lessonTitle).toBe(clean(cur[0].title));
        expect(rows[rows.length - 1].lessonTitle).toBe(clean(cur[cur.length - 1].title));
      }
    }
  });

  it("flags Integration / Evaluation / Remediation / Catch-up from Title", () => {
    const bio = SUBJECT_SEEDS.find((s) => s.id === "biology");
    if (!bio) return;
    const rows = progressionFor(bio, "Form 1");
    expect(rows.find((r) => r.isIntegration)).toBeDefined();
    expect(rows.find((r) => r.isEvaluation)).toBeDefined();
    expect(rows.find((r) => r.isRemediation)).toBeDefined();
  });

  it("stores Chapter on every lesson", () => {
    for (const seed of SUBJECT_SEEDS) {
      for (const level of seed.classLevels) {
        const cur = seed.curriculum[level as never] as { chapter: string }[] | undefined;
        if (!cur?.length) continue;
        const rows = progressionFor(seed, level);
        for (const r of rows) {
          expect(r.chapter.trim().length).toBeGreaterThan(0);
          expect(r.rawTitle.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("buildProgression — fake seeds", () => {
  it("groups a tiny curriculum sequentially with lesson numbers", async () => {
    const { buildProgression: bp } = await import("@/db/seed-builder");
    const seed = {
      id: "test-subject",
      name: "Test Subject",
      classLevels: ["Form 1" as const],
      periodsPerWeek: { "Form 1": 2 },
      curriculum: {
        "Form 1": Array.from({ length: 5 }, (_, i) => ({
          module: "M",
          chapter: `C${i + 1}`,
          title: `Lesson ${i + 1}`,
          duration: 2,
        })),
      },
    };
    const rows = bp(seed as never).filter((r) => r.classLevel === "Form 1");
    expect(rows).toHaveLength(5);
    expect(rows[0].lessonNumber).toBe(1);
    expect(rows[4].lessonNumber).toBe(5);
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
    for (const level of biology.classLevels) {
      const curLen = (biology.curriculum[level as never] as unknown[] | undefined)?.length ?? 0;
      const modules = built.modules.filter((m) => m.classLevel === level);
      if (curLen > 0) {
        expect(modules.length).toBeGreaterThan(0);
        expect(new Set(modules.map((m) => m.name)).size).toBe(modules.length);
        modules.forEach((m, i) => expect(m.moduleNumber).toBe(i + 1));
        for (const m of modules) {
          expect(m.topics.length).toBeGreaterThan(0);
          for (const t of m.topics) {
            expect(t.coreKnowledge.trim().length).toBeGreaterThan(20);
            expect(t.competencies.trim()).not.toBe("");
          }
        }
        expect(built.progression.filter((r) => r.classLevel === level)).toHaveLength(curLen);
      } else {
        expect(built.progression.filter((r) => r.classLevel === level)).toHaveLength(0);
        expect(modules).toHaveLength(0);
      }
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
  it("Sixth forms have no progression-sheet lessons (0 rows)", () => {
    if (!physics) return;
    expect(progressionFor(physics, "Lower Sixth")).toHaveLength(0);
    expect(progressionFor(physics, "Upper Sixth")).toHaveLength(0);
  });
});

describe("progression sheet fidelity", () => {
  it("Syllabus modules are derived from the Chapter column", () => {
    const bio = SUBJECT_SEEDS.find((s) => s.id === "biology");
    if (!bio) return;
    const built = buildSubjectSeed(bio);
    const F1 = built.modules.filter((m) => m.classLevel === "Form 1");
    expect(F1.length).toBeGreaterThanOrEqual(8);
    expect(F1.some((m) => /environment/i.test(m.name))).toBe(true);
  });
  it("Mathematics Form 3 has 76 lessons (header) across 3 terms", () => {
    const maths = SUBJECT_SEEDS.find((s) => s.id === "mathematics");
    if (!maths) return;
    expect(progressionFor(maths, "Form 3")).toHaveLength(76);
  });
});

describe("real MINESEC matrix integration (optional enrichment)", () => {
  it("still enriches matching modules where available", () => {
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
  it("falls back to template when no matrix", () => {
    const lit = SUBJECT_SEEDS.find((s) => s.id === "literature-in-english");
    if (!lit) return;
    for (const m of buildSubjectSeed(lit).modules.filter((x) => x.classLevel === "Form 4")) {
      expect(m.familiesOfSituations).toContain("Learners encounter");
    }
  });
});
