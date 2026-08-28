import type { LessonPlan } from "@/types";

export interface ExportMeta {
  school: string;
  teacher: string;
  subjectName: string;
  academicYear: string;
}

export interface ExportSection {
  title: string;
  lines: string[];
}

export function buildExportSections(
  plan: LessonPlan,
  meta: ExportMeta
): { header: ExportSection; sections: ExportSection[] } {
  const header: ExportSection = {
    title: "HEADER",
    lines: [
      `${meta.school || "School"}  |  ${meta.academicYear}`,
      `Subject: ${meta.subjectName}   Class: ${plan.classLevel}`,
      `Teacher: ${meta.teacher || "—"}   Date: ${plan.date ?? "—"}`,
      `Week: ${plan.weekNumber}   Sequence: ${plan.sequence}   Term: ${plan.term}`,
      `Module: ${plan.module || "—"}`,
      `Chapter: ${plan.chapter || "—"}`,
      `Topic: ${plan.topic || "—"}`,
      `Duration: ${plan.duration} min (${plan.periodType} period)`
    ]
  };

  const sections: ExportSection[] = [];

  if (plan.previousKnowledge) {
    sections.push({ title: "PREVIOUS KNOWLEDGE", lines: [plan.previousKnowledge] });
  }

  if (plan.objectives.length) {
    sections.push({
      title: "LESSON OBJECTIVES",
      lines: plan.objectives.map((o, i) => `${i + 1}. ${o}`)
    });
  }

  if (plan.materials.length) {
    sections.push({
      title: "MATERIALS",
      lines: plan.materials.map((m) => `• ${m}`)
    });
  }

  if (plan.introduction) {
    sections.push({ title: "INTRODUCTION (5 min)", lines: [plan.introduction] });
  }

  if (plan.activities.length) {
    const lines: string[] = [];
    plan.activities.forEach((a, i) => {
      lines.push(`Activity ${i + 1}: ${a.title} (${a.duration} min) — ${a.type}`);
      lines.push(a.description);
      lines.push(`Teacher role: ${a.teacherRole}`);
      lines.push("");
    });
    sections.push({ title: "LESSON ACTIVITIES", lines });
  }

  if (plan.lessonNotes) {
    sections.push({ title: "LESSON NOTES (for learners)", lines: [plan.lessonNotes] });
  }

  if (plan.conclusion) {
    sections.push({ title: "CONCLUSION", lines: [plan.conclusion] });
  }

  if (plan.homework) {
    sections.push({ title: "HOMEWORK", lines: [plan.homework] });
  }

  if (plan.evaluationCriteria.length) {
    sections.push({
      title: "EVALUATION CRITERIA",
      lines: plan.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`)
    });
  }

  if (plan.differentiation) {
    sections.push({ title: "DIFFERENTIATION", lines: [plan.differentiation] });
  }

  if (plan.crossCuttingCompetencies.length) {
    sections.push({
      title: "CROSS-CUTTING COMPETENCIES",
      lines: [plan.crossCuttingCompetencies.join("  •  ")]
    });
  }

  const reflectionLines: string[] = [plan.teacherReflection || "What went well:\n\nTo improve:\n\n"];
  if (plan.attendanceNote) {
    reflectionLines.push(`Attendance / context: ${plan.attendanceNote}`);
  }
  sections.push({
    title: "TEACHER'S REFLECTION (post-lesson)",
    lines: reflectionLines
  });

  return { header, sections };
}
