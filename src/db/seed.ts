import { db } from "@/db/database";
import { CURRICULUM, PHYSICS_PERIODS_PER_WEEK } from "@/db/seed-curriculum";
import { CLASS_LEVELS, DEFAULT_CALENDAR } from "@/types";
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

const HOLIDAY_WEEKS: Record<number, string> = {
  13: "Christmas Break",
  14: "Christmas Break",
  15: "Christmas Break",
  25: "Easter Break",
  26: "Easter Break"
};

function slug(level: ClassLevel): string {
  return level.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function topicText(title: string, level: ClassLevel, kind: keyof SyllabusTopic): string {
  if (kind === "id" || kind === "moduleId" || kind === "name") return "";
  switch (kind) {
    case "coreKnowledge":
      return `Essential content on "${title}" for ${level} following the official MINESEC syllabus. Learners master the key definitions, principles and procedures described in this topic through guided discovery.`;
    case "competencies":
      return `Categories of action: identifying, explaining, applying and experimenting. Examples of actions: observe and describe ${title.toLowerCase()}; carry out simple investigations; interpret results and communicate findings; apply knowledge to real-life situations in the community.`;
    case "aptitudes":
      return `Observing accurately; measuring with available instruments; recording data in tables; drawing and labelling simple diagrams; manipulating basic equipment safely; solving numerical problems; working cooperatively in groups.`;
    case "attitudes":
      return `Curiosity and love for science; respect for safety rules; honesty in recording results; teamwork and mutual respect; care for the environment; responsible use of resources.`;
    case "otherResources":
      return `Locally available items: empty bottles, stones, rulers, string, rubber bands, cardboard, mirrors, candles, matchboxes, flashlight, plastic bags, water, sand, bicycle parts, phone charger, batteries and bulbs, cooking pots, chalk and marker pens.`;
  }
  return "";
}

function buildTopics(level: ClassLevel, moduleId: string): SyllabusTopic[] {
  const seen = new Set<string>();
  const topics: SyllabusTopic[] = [];
  for (const lesson of CURRICULUM[level]) {
    if (seen.has(lesson.chapter)) continue;
    seen.add(lesson.chapter);
    topics.push({
      id: `topic-${slug(level)}-${topics.length + 1}`,
      moduleId,
      name: lesson.chapter,
      coreKnowledge: topicText(lesson.chapter, level, "coreKnowledge"),
      competencies: topicText(lesson.chapter, level, "competencies"),
      aptitudes: topicText(lesson.chapter, level, "aptitudes"),
      attitudes: topicText(lesson.chapter, level, "attitudes"),
      otherResources: topicText(lesson.chapter, level, "otherResources")
    });
  }
  return topics;
}

function buildModules(subjectId: string): SyllabusModule[] {
  const modules: SyllabusModule[] = [];
  for (const level of CLASS_LEVELS) {
    const moduleNames: string[] = [];
    for (const lesson of CURRICULUM[level]) {
      if (!moduleNames.includes(lesson.module)) moduleNames.push(lesson.module);
    }
    moduleNames.forEach((name, i) => {
      const moduleId = `mod-${slug(level)}-${i + 1}`;
      modules.push({
        id: moduleId,
        subjectId,
        classLevel: level,
        moduleNumber: i + 1,
        name,
        duration: `${i + 2} hours`,
        familiesOfSituations: `Learners encounter "${name}" in real-life situations such as household activities, local trades, community health and the natural environment. Lessons use contexts familiar to ${level} learners in Cameroon.`,
        topics: buildTopics(level, moduleId)
      });
    });
  }
  return modules;
}

function buildProgression(subjectId: string): ProgressionEntry[] {
  const entries: ProgressionEntry[] = [];
  for (const level of CLASS_LEVELS) {
    const lessons = CURRICULUM[level];
    let lessonIndex = 0;
    for (let week = 1; week <= 36; week++) {
      const term: Term = week <= 12 ? 1 : week <= 24 ? 2 : 3;
      const sequence = (EVAL_WEEKS[week] ?? (week <= 6 ? 1 : week <= 12 ? 2 : week <= 18 ? 3 : week <= 24 ? 4 : week <= 30 ? 5 : 6)) as Sequence;

      if (HOLIDAY_WEEKS[week]) {
        entries.push({
          id: `prog-${slug(level)}-w${week}`,
          subjectId,
          classLevel: level,
          term,
          weekNumber: week,
          sequence,
          moduleName: "",
          chapter: "",
          lessonTitle: HOLIDAY_WEEKS[week],
          duration: 0,
          isEvaluation: false,
          isHoliday: true
        });
        continue;
      }

      if (EVAL_WEEKS[week]) {
        const prev = lessons[Math.min(lessonIndex, lessons.length - 1)];
        entries.push({
          id: `prog-${slug(level)}-w${week}`,
          subjectId,
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
        id: `prog-${slug(level)}-w${week}`,
        subjectId,
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

export function buildPhysicsSeed(): {
  subject: Subject;
  modules: SyllabusModule[];
  progression: ProgressionEntry[];
  calendar: SchoolCalendar;
} {
  const subject: Subject = {
    id: "physics",
    name: "Physics",
    classLevels: [...CLASS_LEVELS],
    periodsPerWeek: PHYSICS_PERIODS_PER_WEEK,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return {
    subject,
    modules: buildModules("physics"),
    progression: buildProgression("physics"),
    calendar: { ...DEFAULT_CALENDAR }
  };
}

export async function initializeDatabase(): Promise<void> {
  const subjectCount = await db.subjects.count();
  if (subjectCount > 0) return;

  const seed = buildPhysicsSeed();
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
        await db.subjects.add(seed.subject);
        await db.syllabusModules.bulkAdd(seed.modules);
        await db.progressionEntries.bulkAdd(seed.progression);
        await db.schoolCalendars.add(seed.calendar);
        await db.aiSettings.add(defaultSettings);
      }
    );
  } catch (err) {
    console.error("[LessonPlanner] Seed transaction failed:", err);
    throw err;
  }
}
