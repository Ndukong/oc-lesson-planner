import { describe, expect, it } from "vitest";
import { buildExportSections, type ExportMeta } from "@/services/export/templates";
import type { LessonPlan } from "@/types";

const META: ExportMeta = {
  school: "GHS Dumbu",
  teacher: "Mr. Ndukong",
  subjectName: "Physics",
  academicYear: "2025/2026"
};

function makePlan(overrides: Partial<LessonPlan> = {}): LessonPlan {
  return {
    id: "lp-test",
    subjectId: "physics",
    classLevel: "Form 3",
    weekNumber: 19,
    term: 2,
    sequence: 4,
    module: "Optics",
    chapter: "Reflection of Light",
    topic: "Description and propagation of light",
    subtopics: [],
    previousKnowledge: "",
    objectives: ["State the law of reflection", "Draw a ray diagram"],
    introduction: "",
    activities: [],
    materials: [],
    lessonNotes: "",
    conclusion: "",
    homework: "",
    evaluationCriteria: [],
    crossCuttingCompetencies: [],
    differentiation: "",
    duration: 90,
    periodType: "double",
    numberOfPeriods: 2,
    status: "planned",
    teacherReflection: "",
    attendanceNote: "",
    aiGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

function sectionTitles(plan: LessonPlan): string[] {
  return buildExportSections(plan, META).sections.map((s) => s.title);
}

describe("buildExportSections", () => {
  it("numbers the objectives", () => {
    const { sections } = buildExportSections(makePlan(), META);
    const objectives = sections.find((s) => s.title === "LESSON OBJECTIVES");
    expect(objectives?.lines).toEqual([
      "1. State the law of reflection",
      "2. Draw a ray diagram"
    ]);
  });

  it("includes differentiation when present", () => {
    const plan = makePlan({
      differentiation: "Pair slower learners with confident peers."
    });
    const titles = sectionTitles(plan);
    expect(titles).toContain("DIFFERENTIATION");
    const { sections } = buildExportSections(plan, META);
    expect(sections.find((s) => s.title === "DIFFERENTIATION")?.lines[0]).toBe(
      "Pair slower learners with confident peers."
    );
  });

  it("omits the differentiation section when empty", () => {
    expect(sectionTitles(makePlan())).not.toContain("DIFFERENTIATION");
  });

  it("includes cross-cutting competencies when present", () => {
    const plan = makePlan({
      crossCuttingCompetencies: ["Communication", "Cooperation"]
    });
    expect(sectionTitles(plan)).toContain("CROSS-CUTTING COMPETENCIES");
    const { sections } = buildExportSections(plan, META);
    expect(
      sections.find((s) => s.title === "CROSS-CUTTING COMPETENCIES")?.lines[0]
    ).toBe("Communication  •  Cooperation");
  });

  it("omits cross-cutting competencies when empty", () => {
    expect(sectionTitles(makePlan())).not.toContain(
      "CROSS-CUTTING COMPETENCIES"
    );
  });

  it("appends the attendance note to the teacher's reflection", () => {
    const plan = makePlan({
      teacherReflection: "Good engagement.",
      attendanceNote: "3 learners absent (rain)."
    });
    const { sections } = buildExportSections(plan, META);
    const reflection = sections.find(
      (s) => s.title === "TEACHER'S REFLECTION (post-lesson)"
    );
    expect(reflection?.lines).toHaveLength(2);
    expect(reflection?.lines[1]).toBe("Attendance / context: 3 learners absent (rain).");
  });

  it("keeps the reflection section without an attendance line by default", () => {
    const { sections } = buildExportSections(makePlan(), META);
    const reflection = sections.find(
      (s) => s.title === "TEACHER'S REFLECTION (post-lesson)"
    );
    expect(reflection?.lines).toHaveLength(1);
  });

  it("orders sections sensibly (evaluation before differentiation before reflection)", () => {
    const titles = sectionTitles(
      makePlan({
        evaluationCriteria: ["Learners state the law correctly."],
        differentiation: "x",
        crossCuttingCompetencies: ["Creativity"]
      })
    );
    const evalIdx = titles.indexOf("EVALUATION CRITERIA");
    const diffIdx = titles.indexOf("DIFFERENTIATION");
    const crossIdx = titles.indexOf("CROSS-CUTTING COMPETENCIES");
    const reflIdx = titles.indexOf("TEACHER'S REFLECTION (post-lesson)");
    expect(evalIdx).toBeGreaterThan(-1);
    expect(diffIdx).toBeGreaterThan(evalIdx);
    expect(crossIdx).toBeGreaterThan(diffIdx);
    expect(reflIdx).toBeGreaterThan(crossIdx);
  });
});