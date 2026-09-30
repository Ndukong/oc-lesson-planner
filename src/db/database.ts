import Dexie from "dexie";
import type { EntityTable } from "dexie";
import type {
  Subject,
  SyllabusModule,
  ProgressionEntry,
  SchoolCalendar,
  LessonPlan,
  AISettings,
  TeacherProfile
} from "@/types";
import { DEFAULT_CALENDAR } from "@/types";

export const db = new Dexie("LessonPlannerDB_v2") as Dexie & {
  subjects: EntityTable<Subject, "id">;
  syllabusModules: EntityTable<SyllabusModule, "id">;
  progressionEntries: EntityTable<ProgressionEntry, "id">;
  schoolCalendars: EntityTable<SchoolCalendar, "id">;
  lessonPlans: EntityTable<LessonPlan, "id">;
  aiSettings: EntityTable<AISettings, "id">;
  teacherProfile: EntityTable<TeacherProfile, "id">;
};

const STORES = {
  subjects: "id, name",
  syllabusModules: "id, subjectId, classLevel, moduleNumber",
  progressionEntries: "id, subjectId, classLevel, lessonNumber, term, sequence",
  schoolCalendars: "id, academicYear",
  lessonPlans: "id, subjectId, classLevel, lessonNumber, weekNumber, status, [subjectId+classLevel+lessonNumber]",
  aiSettings: "id",
  teacherProfile: "id"
};

db.version(1).stores(STORES);

// v2: the default calendar used to leave weeks 13-15 and 25-26 outside any
// sequence. Patch the stored default calendar to the contiguous sequences.
db.version(2)
  .stores(STORES)
  .upgrade(async (tx) => {
    const calendars = tx.table("schoolCalendars");
    const cal = (await calendars.get("default-calendar")) as
      | SchoolCalendar
      | undefined;
    if (!cal) return;
    const stale = cal.sequences?.some((s) => s.number === 3 && s.startWeek === 16);
    if (stale) {
      await calendars.put({ ...cal, sequences: DEFAULT_CALENDAR.sequences });
    }
  });

// v3: Sixth Form support — subjects that teach GCE A-Level gain Lower/Upper
// Sixth class levels on existing installs (fresh seeds already include them).
const SIXTH_FORM_SUBJECTS = new Set([
  "physics",
  "chemistry",
  "biology",
  "human-biology",
  "mathematics",
  "economics",
  "geography",
  "geology",
  "history",
  "literature-in-english",
  "computer-science"
]);

db.version(3)
  .stores(STORES)
  .upgrade(async (tx) => {
    const subjectsTable = tx.table("subjects");
    const rows = (await subjectsTable.toArray()) as Subject[];
    for (const s of rows) {
      if (!SIXTH_FORM_SUBJECTS.has(s.id)) continue;
      const levels = Array.isArray(s.classLevels) ? s.classLevels : [];
      const next = [...levels];
      if (!next.includes("Lower Sixth")) next.push("Lower Sixth");
      if (!next.includes("Upper Sixth")) next.push("Upper Sixth");
      if (next.length !== levels.length) {
        await subjectsTable.put({ ...s, classLevels: next });
      }
    }
  });

db.version(4).stores(STORES);
db.version(5).stores(STORES);
// v6: term-based progression — no dates/weeks. Old lessons stored 1-per-week with
// overflow/period grouping are stale. Wipe and re-seed; keep profile/aiSettings.
db.version(6)
  .stores(STORES)
  .upgrade(async (tx) => {
    await tx.table("progressionEntries").clear();
    await tx.table("syllabusModules").clear();
    await tx.table("subjects").clear();
    await tx.table("schoolCalendars").clear();
    await tx.table("lessonPlans").clear();
  });
// v7: fix ConstraintError from v6 when aiSettings/lessonPlans already existed —
// re-clear stale stores so initializeDatabase can re-seed idempotently.
db.version(7)
  .stores(STORES)
  .upgrade(async (tx) => {
    await tx.table("progressionEntries").clear();
    await tx.table("syllabusModules").clear();
    await tx.table("subjects").clear();
    await tx.table("schoolCalendars").clear();
    await tx.table("lessonPlans").clear();
  });
