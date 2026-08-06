import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import type {
  AISettings,
  ClassLevel,
  LessonPlan,
  ProgressionEntry,
  Subject,
  SyllabusModule,
  TeacherProfile
} from "@/types";
import { uid } from "@/utils/format";

export function useSubjects(): Subject[] | undefined {
  return useLiveQuery(() => db.subjects.toArray(), []);
}

export function useSubject(subjectId?: string): Subject | undefined {
  return useLiveQuery(() => {
    if (!subjectId) return undefined;
    return db.subjects.get(subjectId);
  }, [subjectId]);
}

export function useSyllabusModules(
  subjectId?: string,
  classLevel?: ClassLevel
): SyllabusModule[] | undefined {
  return useLiveQuery(async () => {
    if (!subjectId || !classLevel) return [];
    const modules = await db.syllabusModules
      .where("subjectId")
      .equals(subjectId)
      .and((m) => m.classLevel === classLevel)
      .toArray();
    return modules.sort((a, b) => a.moduleNumber - b.moduleNumber);
  }, [subjectId, classLevel]);
}

export function useProgression(
  subjectId?: string,
  classLevel?: ClassLevel
): ProgressionEntry[] | undefined {
  return useLiveQuery(async () => {
    if (!subjectId || !classLevel) return [];
    return db.progressionEntries
      .where("subjectId")
      .equals(subjectId)
      .and((e) => e.classLevel === classLevel)
      .sortBy("weekNumber");
  }, [subjectId, classLevel]);
}

export function useLessonPlan(
  subjectId: string,
  classLevel: ClassLevel,
  weekNumber: number
): LessonPlan | undefined {
  return useLiveQuery(() =>
    db.lessonPlans
      .where("subjectId")
      .equals(subjectId)
      .and((p) => p.classLevel === classLevel && p.weekNumber === weekNumber)
      .first()
  , [subjectId, classLevel, weekNumber]);
}

export function useLessonPlans(
  subjectId?: string,
  classLevel?: ClassLevel
): LessonPlan[] | undefined {
  return useLiveQuery(async () => {
    if (!subjectId || !classLevel) return [];
    return db.lessonPlans
      .where("subjectId")
      .equals(subjectId)
      .and((p) => p.classLevel === classLevel)
      .toArray();
  }, [subjectId, classLevel]);
}

export function useLessonPlansBySubject(subjectId?: string): LessonPlan[] | undefined {
  return useLiveQuery(async () => {
    if (!subjectId) return [];
    return db.lessonPlans.where("subjectId").equals(subjectId).toArray();
  }, [subjectId]);
}

export function useCalendar(): import("@/types").SchoolCalendar | undefined {
  return useLiveQuery(() => db.schoolCalendars.limit(1).first(), []);
}

export function useAISettings(): AISettings | undefined {
  return useLiveQuery(() => db.aiSettings.limit(1).first(), []);
}

export function useTeacherProfile(): TeacherProfile | undefined {
  return useLiveQuery(() => db.teacherProfile.limit(1).first(), []);
}

export async function saveLessonPlan(plan: LessonPlan): Promise<void> {
  plan.updatedAt = new Date();
  await db.lessonPlans.put(plan);
}

export async function getOrCreateLessonPlan(
  subjectId: string,
  classLevel: ClassLevel,
  weekNumber: number
): Promise<LessonPlan> {
  const existing = await db.lessonPlans
    .where("subjectId")
    .equals(subjectId)
    .and((p) => p.classLevel === classLevel && p.weekNumber === weekNumber)
    .first();
  if (existing) return existing;

  const prog = await db.progressionEntries
    .where("subjectId")
    .equals(subjectId)
    .and((p) => p.classLevel === classLevel && p.weekNumber === weekNumber)
    .first();

  const now = new Date();
  const newPlan: LessonPlan = {
    id: uid("lp-"),
    subjectId,
    classLevel,
    weekNumber,
    date: undefined,
    term: prog?.term ?? 1,
    sequence: prog?.sequence ?? 1,
    module: prog?.moduleName ?? "",
    chapter: prog?.chapter ?? "",
    topic: prog?.lessonTitle ?? "",
    subtopics: [],
    previousKnowledge: "",
    objectives: [],
    introduction: "",
    activities: [],
    materials: [],
    lessonNotes: "",
    conclusion: "",
    homework: "",
    evaluationCriteria: [],
    crossCuttingCompetencies: [],
    differentiation: "",
    duration: prog?.duration ? (prog.duration >= 2 ? 90 : 45) : 45,
    periodType: prog?.duration && prog.duration >= 2 ? "double" : "single",
    numberOfPeriods: prog?.duration ?? 1,
    status: "planned",
    teacherReflection: "",
    attendanceNote: "",
    aiGenerated: false,
    createdAt: now,
    updatedAt: now
  };
  await db.lessonPlans.add(newPlan);
  return newPlan;
}

export async function deleteLessonPlan(id: string): Promise<void> {
  await db.lessonPlans.delete(id);
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await db.aiSettings.put(settings);
}

export async function saveTeacherProfile(
  profile: TeacherProfile
): Promise<void> {
  await db.teacherProfile.put(profile);
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.subjects.clear(),
    db.syllabusModules.clear(),
    db.progressionEntries.clear(),
    db.schoolCalendars.clear(),
    db.lessonPlans.clear(),
    db.aiSettings.clear(),
    db.teacherProfile.clear()
  ]);
}
