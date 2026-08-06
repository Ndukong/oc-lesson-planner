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

export const db = new Dexie("LessonPlannerDB_v2") as Dexie & {
  subjects: EntityTable<Subject, "id">;
  syllabusModules: EntityTable<SyllabusModule, "id">;
  progressionEntries: EntityTable<ProgressionEntry, "id">;
  schoolCalendars: EntityTable<SchoolCalendar, "id">;
  lessonPlans: EntityTable<LessonPlan, "id">;
  aiSettings: EntityTable<AISettings, "id">;
  teacherProfile: EntityTable<TeacherProfile, "id">;
};

db.version(1).stores({
  subjects: "id, name",
  syllabusModules: "id, subjectId, classLevel, moduleNumber",
  progressionEntries: "id, subjectId, classLevel, weekNumber, term, sequence",
  schoolCalendars: "id, academicYear",
  lessonPlans: "id, subjectId, classLevel, weekNumber, status, [subjectId+classLevel+weekNumber]",
  aiSettings: "id",
  teacherProfile: "id"
});
