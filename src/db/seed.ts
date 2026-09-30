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
  // Re-seed if any piece is missing — the term-based schema (v6/v7) wipes the
  // old stores, so a partial seed must be repaired, never left half-written.
  const subjectCount = await db.subjects.count();
  const progCount = await db.progressionEntries.count();
  if (subjectCount > 0 && progCount > 0) return;

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
        await db.subjects.clear();
        await db.syllabusModules.clear();
        await db.progressionEntries.clear();
        for (const seed of SUBJECT_SEEDS) {
          const built = buildSubjectSeed(seed);
          await db.subjects.put(built.subject);
          await db.syllabusModules.bulkPut(built.modules);
          await db.progressionEntries.bulkPut(built.progression);
        }
        await db.schoolCalendars.put({ ...DEFAULT_CALENDAR });
        await db.aiSettings.put(defaultSettings);
      }
    );
  } catch (err) {
    console.error("[LessonPlanner] Seed transaction failed:", err);
    throw err;
  }
}

/**
 * Regenerate progression entries from the harmonised sheets (term-based,
 * no calendar weeks). No-op if the sheets haven't changed.
 */
export async function rebuildProgressionForCalendar(
  _calendar: SchoolCalendar
): Promise<void> {
  const entries: ProgressionEntry[] = [];
  for (const seed of SUBJECT_SEEDS) {
    entries.push(...buildProgression(seed, _calendar));
  }
  await db.transaction("rw", db.progressionEntries, async () => {
    await db.progressionEntries.clear();
    await db.progressionEntries.bulkAdd(entries);
  });
}