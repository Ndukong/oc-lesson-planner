import { db } from "@/db/database";
import { SUBJECT_SEEDS } from "@/db/seed-curriculum";
import type { SubjectSeed } from "@/db/seed-curriculum";
import { DEFAULT_CALENDAR } from "@/types";
import type {
  AISettings,
  ClassLevel,
  ProgressionEntry,
  SchoolCalendar,
  Sequence,
  Subject,
  SyllabusModule,
  SyllabusTopic,
  Term
} from "@/types";

const EVAL_WEEKS: Record<number, number> = {
  6: 1,
  12: 2,
  18: 3,
  24: 4,
  30: 5,
  36: 6
};

function holidayWeeksFor(holidays: import("@/types").Holiday[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const h of holidays) {
    for (let w = h.startWeek; w <= h.endWeek; w++) {
      map[w] = h.name;
    }
  }
  return map;
}

function slug(level: ClassLevel): string {
  return level.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function topicText(
  title: string,
  level: ClassLevel,
  kind: keyof SyllabusTopic,
  subjectName: string
): string {
  if (kind === "id" || kind === "moduleId" || kind === "name") return "";
  const sciences = ["Biology", "Human Biology", "Chemistry", "Computer Science", "Geology", "Mathematics", "Physics"];
  const isScience = sciences.some((s) => subjectName.includes(s));
  switch (kind) {
    case "coreKnowledge":
      return isScience
        ? `Essential content on "${title}" for ${level} following the official MINESEC syllabus. Learners master the key definitions, principles and procedures described in this topic through guided discovery.`
        : `Essential content on "${title}" for ${level} following the official MINESEC syllabus. Learners master the key ideas, concepts and skills described in this topic through guided study and real-life examples.`;
    case "competencies":
      return isScience
        ? `Categories of action: identifying, explaining, applying and experimenting. Examples of actions: observe and describe ${title.toLowerCase()}; carry out simple investigations; interpret results and communicate findings; apply knowledge to real-life situations in the community.`
        : `Categories of action: identifying, explaining, analysing and applying. Examples of actions: examine ${title.toLowerCase()}; discuss and interpret information; express reasoned opinions; apply knowledge to real-life situations in the community.`;
    case "aptitudes":
      return isScience
        ? `Observing accurately; measuring with available instruments; recording data in tables; drawing and labelling simple diagrams; manipulating basic equipment safely; solving numerical problems; working cooperatively in groups.`
        : `Reading and analysing texts; taking notes; summarising key points; expressing ideas clearly in speech and writing; discussing in groups; conducting simple enquiries and presenting findings.`;
    case "attitudes":
      return `Curiosity and love for the subject; respect for rules; honesty in reporting; teamwork and mutual respect; care for the environment; responsible use of resources.`;
    case "otherResources":
      return `Locally available items: exercise books, charts, posters, newspapers, maps, models, flashcards, household objects, tools, calculators (where available), chalk and marker pens, and other materials found in the school and community.`;
  }
  return "";
}

function buildTopics(
  seed: SubjectSeed,
  level: ClassLevel,
  moduleId: string
): SyllabusTopic[] {
  const seen = new Set<string>();
  const topics: SyllabusTopic[] = [];
  for (const lesson of seed.curriculum[level] ?? []) {
    if (seen.has(lesson.chapter)) continue;
    seen.add(lesson.chapter);
    topics.push({
      id: `topic-${seed.id}-${slug(level)}-${topics.length + 1}`,
      moduleId,
      name: lesson.chapter,
      coreKnowledge: topicText(lesson.chapter, level, "coreKnowledge", seed.name),
      competencies: topicText(lesson.chapter, level, "competencies", seed.name),
      aptitudes: topicText(lesson.chapter, level, "aptitudes", seed.name),
      attitudes: topicText(lesson.chapter, level, "attitudes", seed.name),
      otherResources: topicText(lesson.chapter, level, "otherResources", seed.name)
    });
  }
  return topics;
}

function buildModules(seed: SubjectSeed): SyllabusModule[] {
  const modules: SyllabusModule[] = [];
  for (const level of seed.classLevels) {
    const moduleNames: string[] = [];
    for (const lesson of seed.curriculum[level] ?? []) {
      if (!moduleNames.includes(lesson.module)) moduleNames.push(lesson.module);
    }
    moduleNames.forEach((name, i) => {
      const moduleId = `mod-${seed.id}-${slug(level)}-${i + 1}`;
      modules.push({
        id: moduleId,
        subjectId: seed.id,
        classLevel: level,
        moduleNumber: i + 1,
        name,
        duration: `${i + 2} hours`,
        familiesOfSituations: `Learners encounter "${name}" in real-life situations such as household activities, local trades, community life and the natural environment. Lessons use contexts familiar to ${level} learners in Cameroon.`,
        topics: buildTopics(seed, level, moduleId)
      });
    });
  }
  return modules;
}

function buildProgression(
  seed: SubjectSeed,
  holidays: import("@/types").Holiday[] = DEFAULT_CALENDAR.holidays
): ProgressionEntry[] {
  const entries: ProgressionEntry[] = [];
  const holidayWeeks = holidayWeeksFor(holidays);
  for (const level of seed.classLevels) {
    const lessons = seed.curriculum[level] ?? [];
    let lessonIndex = 0;
    for (let week = 1; week <= 36; week++) {
      const term: Term = week <= 12 ? 1 : week <= 24 ? 2 : 3;
      const sequence = (EVAL_WEEKS[week] ?? (week <= 6 ? 1 : week <= 12 ? 2 : week <= 18 ? 3 : week <= 24 ? 4 : week <= 30 ? 5 : 6)) as Sequence;

      if (holidayWeeks[week]) {
        entries.push({
          id: `prog-${seed.id}-${slug(level)}-w${week}`,
          subjectId: seed.id,
          classLevel: level,
          term,
          weekNumber: week,
          sequence,
          moduleName: "",
          chapter: "",
          lessonTitle: holidayWeeks[week],
          duration: 0,
          isEvaluation: false,
          isHoliday: true
        });
        continue;
      }

      if (EVAL_WEEKS[week]) {
        const prev = lessons[Math.min(lessonIndex, lessons.length - 1)];
        entries.push({
          id: `prog-${seed.id}-${slug(level)}-w${week}`,
          subjectId: seed.id,
          classLevel: level,
          term,
          weekNumber: week,
          sequence,
          moduleName: prev?.module ?? "",
          chapter: prev?.chapter ?? "",
          lessonTitle: `Evaluation (Sequence ${sequence})`,
          duration: 2,
          isEvaluation: true,
          isHoliday: false
        });
        continue;
      }

      const lesson = lessons[lessonIndex];
      lessonIndex++;
      entries.push({
        id: `prog-${seed.id}-${slug(level)}-w${week}`,
        subjectId: seed.id,
        classLevel: level,
        term,
        weekNumber: week,
        sequence,
        moduleName: lesson?.module ?? "",
        chapter: lesson?.chapter ?? "",
        lessonTitle: lesson?.title ?? "",
        duration: lesson?.duration ?? 2,
        isEvaluation: false,
        isHoliday: false
      });
    }
  }
  return entries;
}

export function buildSubjectSeed(seed: SubjectSeed): {
  subject: Subject;
  modules: SyllabusModule[];
  progression: ProgressionEntry[];
  calendar: SchoolCalendar;
} {
  const subject: Subject = {
    id: seed.id,
    name: seed.name,
    classLevels: [...seed.classLevels],
    periodsPerWeek: { ...seed.periodsPerWeek },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return {
    subject,
    modules: buildModules(seed),
    progression: buildProgression(seed),
    calendar: { ...DEFAULT_CALENDAR }
  };
}

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
    entries.push(...buildProgression(seed, calendar.holidays));
  }
  await db.transaction("rw", db.progressionEntries, async () => {
    await db.progressionEntries.clear();
    await db.progressionEntries.bulkAdd(entries);
  });
}
