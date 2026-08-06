import { db } from "@/db/database";
import { validateSubjectTemplate } from "@/services/sharing/export-template";
import type { SubjectTemplate } from "@/types";

export async function importSubjectTemplate(
  file: File
): Promise<{ ok: true; subjectName: string } | { ok: false; message: string }> {
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return { ok: false, message: "The file could not be read as JSON." };
  }

  const result = validateSubjectTemplate(data);
  if (!result.ok) return result;

  const template: SubjectTemplate = result.template;
  const existing = await db.subjects.get(template.subject.id);
  if (existing) {
    return {
      ok: false,
      message: `Subject "${template.subject.name}" already exists.`
    };
  }

  const calendarId = `cal-${template.subject.id}`;
  const calendar = {
    ...template.calendar,
    id: calendarId
  };

  await db.subjects.add({
    ...template.subject,
    createdAt: new Date(template.subject.createdAt as unknown as string),
    updatedAt: new Date()
  });
  await db.syllabusModules.bulkAdd(template.modules);
  await db.progressionEntries.bulkAdd(template.progression);
  await db.schoolCalendars.add(calendar);

  return { ok: true, subjectName: template.subject.name };
}
