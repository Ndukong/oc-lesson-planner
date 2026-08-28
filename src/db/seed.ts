import { db } from "@/db/database";
import { SUBJECT_SEEDS } from "@/db/seed-curriculum";
import { buildProgression, buildSubjectSeed } from "@/db/seed-builder";
import { DEFAULT_CALENDAR } from "@/types";
import type {
  AISettings,
  ProgressionEntry,
  SchoolCalendar
} from "@/types";

export async function initializeDatabase(): Promise<void> {
  const subjectCount = await db.subjects.count();
  if (subjectCount > 0) return;

  const defaultSettings: AISettings = {
    id: "default",
    preferredProvider: "gemini",
    autoGenerate: false
  };

  try {
    await db.transaction(
      "rw",
      db.subjects,
      db.syllabusModules,
      db.progressionEntries,
      db.schoolCalendars,
      db.aiSettings,
      async () => {
        for (const seed of SUBJECT_SEEDS) {
          const built = buildSubjectSeed(seed);
          await db.subjects.add(built.subject);
          await db.syllabusModules.bulkAdd(built.modules);
          await db.progressionEntries.bulkAdd(built.progression);
        }
        await db.schoolCalendars.add({ ...DEFAULT_CALENDAR });
        await db.aiSettings.add(defaultSettings);
      }
    );
  } catch (err) {
    console.error("[LessonPlanner] Seed transaction failed:", err);
    throw err;
  }
}

/**
 * Regenerate the progression grid for every subject using a (possibly
 * edited) school calendar. Lesson plans that already exist are preserved
 * (they reference their week directly); only the week's progression row is
 * recreated so holiday/evaluation weeks stay aligned with the calendar.
 */
export async function rebuildProgressionForCalendar(
  calendar: SchoolCalendar
): Promise<void> {
  const entries: ProgressionEntry[] = [];
  for (const seed of SUBJECT_SEEDS) {
    entries.push(...buildProgression(seed, calendar));
  }
  await db.transaction("rw", db.progressionEntries, async () => {
    await db.progressionEntries.clear();
    await db.progressionEntries.bulkAdd(entries);
  });
}