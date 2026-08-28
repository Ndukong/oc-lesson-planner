import type {
  ClassLevel,
  ProgressionEntry,
  SchoolCalendar,
  Subject,
  SubjectTemplate,
  SyllabusModule
} from "@/types";
import { CLASS_LEVELS } from "@/types";
import { downloadText } from "@/utils/format";

export async function exportSubjectTemplate(
  subject: Subject,
  modules: SyllabusModule[],
  progression: ProgressionEntry[],
  calendar: SchoolCalendar,
  exportedBy: string
): Promise<void> {
  const template: SubjectTemplate = {
    version: "1.0.0",
    exportedAt: new Date(),
    exportedBy,
    subject,
    modules,
    progression,
    calendar
  };
  const safeName = subject.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  downloadText(
    JSON.stringify(template, null, 2),
    `${safeName}-template.json`
  );
}

export function isClassLevel(value: unknown): value is ClassLevel {
  return typeof value === "string" && (CLASS_LEVELS as readonly string[]).includes(value);
}

export function validateSubjectTemplate(
  data: unknown
): { ok: true; template: SubjectTemplate } | { ok: false; message: string } {
  if (typeof data !== "object" || data === null) {
    return { ok: false, message: "Not a valid JSON template." };
  }
  const t = data as Partial<SubjectTemplate>;
  if (t.version !== "1.0.0") {
    return { ok: false, message: `Unsupported template version: ${t.version}` };
  }
  if (!t.subject || typeof t.subject.name !== "string" || !t.subject.id) {
    return { ok: false, message: "Template is missing a valid subject definition." };
  }
  if (!Array.isArray(t.modules)) {
    return { ok: false, message: "Template is missing syllabus modules." };
  }
  if (!Array.isArray(t.progression)) {
    return { ok: false, message: "Template is missing progression entries." };
  }
  if (!t.calendar || !t.calendar.academicYear) {
    return { ok: false, message: "Template is missing the school calendar." };
  }
  return { ok: true, template: t as SubjectTemplate };
}
