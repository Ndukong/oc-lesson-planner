import { DEFAULT_CALENDAR } from "@/types";
import type {
  ClassLevel,
  ProgressionEntry,
  ProgressionPeriodGroup,
  SchoolCalendar,
  Sequence,
  Subject,
  SyllabusModule,
  SyllabusTopic,
  Term,
} from "@/types";
import { sequenceFromWeek, termFromWeek } from "@/utils/calendar";
import type { CurriculumLesson, SubjectSeed } from "@/db/seed-curriculum";
import { SYLLABUS_MATRIX, type MatrixModuleData } from "@/db/syllabus-matrix.generated";

export const SPARE_WEEK_TITLE = "Spare week (consolidation / catch-up)";
export const TEACHER_PLANNED_TITLE = "Teacher-planned week (add your lesson)";

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function stem(w: string): string {
  return w.replace(/(ings?|ing|tions?|tion|ments?|ers?|es|s)$/, "");
}
function tokens(s: string): Set<string> {
  return new Set(normName(s).split(" ").filter((w) => w.length > 2).map(stem));
}
function similarity(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}
function formKey(level: ClassLevel): string | undefined {
  const m = /(\d)/.exec(level);
  return m ? m[1] : undefined;
}
function findMatrixModule(seedId: string, level: ClassLevel, moduleName: string): MatrixModuleData | undefined {
  const form = SYLLABUS_MATRIX[seedId]?.[formKey(level) ?? ""];
  if (!form) return undefined;
  const target = normName(moduleName);
  if (!target) return undefined;
  let best: { entry: MatrixModuleData; score: number } | undefined;
  for (const [key, entry] of Object.entries(form)) {
    if (key === "_unsorted") continue;
    const k = normName(key);
    let score = 0;
    if (k === target) score = 1;
    else if (k.includes(target) || target.includes(k)) score = 0.85;
    else score = similarity(target, k);
    if (!best || score > best.score) best = { entry, score };
  }
  if (best && best.score >= 0.55) return best.entry;
  return form["_unsorted"];
}
export function splitContentItems(blob: string): Array<{ num: string | null; text: string }> {
  if (!blob) return [];
  const parts = blob.split(/(?=\b\d{1,2}\.\d{1,2}\b)|(?=\bTopic\s+\d+\s*:)|(?<=\s)(?=\d{1,2}\.\s+[A-Z(])/);
  const items: Array<{ num: string | null; text: string }> = [];
  for (const p of parts) {
    const t = p.trim();
    if (t.length < 10) continue;
    const m = /^(\d{1,2}(?:\.\d{1,2})?)[\.\)]?\s+/.exec(t);
    items.push({ num: m ? m[1] : null, text: t });
  }
  return items;
}
export function matchCoreKnowledge(chapter: string, matrix: MatrixModuleData | undefined): string | undefined {
  const items = splitContentItems(matrix?.content ?? "");
  if (items.length === 0) return undefined;
  let best: { num: string | null; text: string } | undefined;
  let bestScore = 0;
  for (const item of items) {
    const score = similarity(chapter, item.text);
    if (score > bestScore || (score === bestScore && best && item.text.length > best.text.length)) {
      bestScore = score;
      best = item;
    }
  }
  if (!best || bestScore < 0.4) return undefined;
  const base = best.num && !best.num.includes(".") ? `${best.num}.` : null;
  if (best.text.length < 60 && base) {
    const related = items.filter((it) => it.num && it.num.startsWith(base) && it.num !== best!.num).map((it) => it.text);
    if (related.length > 0) return cap(`${best.text} ${related.join(" ")}`);
  }
  if (best.text.length < 60) return undefined;
  return cap(best.text);
}
function cap(s: string, max = 800): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}
function sequenceForWeek(week: number, calendar: SchoolCalendar): Sequence {
  const s = calendar.sequences.find((x) => week >= x.startWeek && week <= x.endWeek);
  return (s?.number ?? sequenceFromWeek(week)) as Sequence;
}
function slug(level: ClassLevel): string {
  return level.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
function topicText(title: string, level: ClassLevel, kind: keyof SyllabusTopic, subjectName: string): string {
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
function buildTopics(seed: SubjectSeed, level: ClassLevel, moduleId: string, matrix: MatrixModuleData | undefined): SyllabusTopic[] {
  const seen = new Set<string>();
  const topics: SyllabusTopic[] = [];
  for (const lesson of seed.curriculum[level] ?? []) {
    if (seen.has(lesson.chapter)) continue;
    seen.add(lesson.chapter);
    const chapter = lesson.chapter;
    const realItem = matchCoreKnowledge(chapter, matrix);
    let coreKnowledge: string;
    if (realItem) coreKnowledge = cap(realItem.replace(/^\s*\d{1,2}(\.\d{1,2})?[\.\)]?\s*/, ""));
    else if (matrix?.content) coreKnowledge = cap(matrix.content, 600);
    else coreKnowledge = topicText(chapter, level, "coreKnowledge", seed.name);
    const realCompetencies = [matrix?.categories, matrix?.actions].filter((v): v is string => Boolean(v && v.trim())).join(" ");
    const competencies = realCompetencies ? cap(realCompetencies) : topicText(chapter, level, "competencies", seed.name);
    const aptitudes = matrix?.aptitudes ? cap(matrix.aptitudes) : topicText(chapter, level, "aptitudes", seed.name);
    const attitudes = matrix?.attitudes ? cap(matrix.attitudes) : topicText(chapter, level, "attitudes", seed.name);
    const otherResources = matrix?.other ? cap(matrix.other) : topicText(chapter, level, "otherResources", seed.name);
    topics.push({
      id: `topic-${seed.id}-${slug(level)}-${topics.length + 1}`,
      moduleId,
      name: chapter,
      coreKnowledge,
      competencies,
      aptitudes,
      attitudes,
      otherResources,
    });
  }
  return topics;
}
function buildModules(seed: SubjectSeed): SyllabusModule[] {
  const modules: SyllabusModule[] = [];
  for (const level of seed.classLevels) {
    const moduleNames: string[] = [];
    for (const lesson of seed.curriculum[level] ?? []) if (!moduleNames.includes(lesson.module)) moduleNames.push(lesson.module);
    moduleNames.forEach((name, i) => {
      const moduleId = `mod-${seed.id}-${slug(level)}-${i + 1}`;
      const matrix = findMatrixModule(seed.id, level, name);
      const realFamilies = [matrix?.families, matrix?.examples].filter((v): v is string => Boolean(v && v.trim())).join(" ");
      modules.push({
        id: moduleId,
        subjectId: seed.id,
        classLevel: level,
        moduleNumber: i + 1,
        name,
        duration: `${i + 2} hours`,
        familiesOfSituations: realFamilies
          ? cap(realFamilies)
          : `Learners encounter "${name}" in real-life situations such as household activities, local trades, community life and the natural environment. Lessons use contexts familiar to ${level} learners in Cameroon.`,
        topics: buildTopics(seed, level, moduleId, matrix),
      });
    });
  }
  return modules;
}
function detectFlags(title: string): { isIntegration: boolean; isEvaluation: boolean; isRemediation: boolean; isCatchUp: boolean } {
  const t = title.toLowerCase();
  return {
    isIntegration: t.includes("integration"),
    isEvaluation: t.includes("evaluation"),
    isRemediation: t.includes("remediation") || t.includes("correction"),
    isCatchUp: t.includes("catch-up") || t.includes("catch up"),
  };
}
function cleanDisplayTitle(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^(?:Lesson\s*\d+\s*[:\.]?\s*)/i, "");
  s = s.replace(/\s+/g, " ").trim();
  return s || raw.trim();
}

function sanitizePeriod(raw: string): string {
  const m = raw.match(/\d{2}\/\d{2}\/\d{4}\s*au\s*\d{2}\/\d{2}\/\d{4}/);
  return m ? m[0] : raw.trim();
}

export function buildProgression(seed: SubjectSeed, _calendar: SchoolCalendar = DEFAULT_CALENDAR): ProgressionEntry[] {
  const entries: ProgressionEntry[] = [];
  for (const level of seed.classLevels) {
    const lessons: CurriculumLesson[] = [...(seed.curriculum[level] ?? [])];
    const filtered = lessons.filter((l) => l.title.trim().toUpperCase() !== "1ST BREAK" && l.title.trim() !== "");
    if (filtered.length === 0) continue;
    type PeriodRun = { weekPeriod: string; term: Term; sequence: Sequence; lessons: CurriculumLesson[] };
    const runs: PeriodRun[] = [];
    let current: PeriodRun | null = null;
    for (const lesson of filtered) {
      const raw = sanitizePeriod((lesson.weekRaw ?? "").trim());
      const key = raw || "__NO_PERIOD__";
      if (!current || current.weekPeriod !== key) {
        const term = (lesson.termHint as Term) ?? (termFromWeek(runs.length + 1) as Term);
        const sequence = (sequenceForWeek(runs.length + 1, DEFAULT_CALENDAR) ?? term) as Sequence;
        current = { weekPeriod: key === "__NO_PERIOD__" ? "" : key, term, sequence, lessons: [] };
        runs.push(current);
      }
      current.lessons.push(lesson);
    }
    let globalLessonNumber = 0;
    runs.forEach((run, rIdx) => {
      const periodIndex = rIdx + 1;
      const periodLessonCount = run.lessons.length;
      run.lessons.forEach((lesson, gIdx) => {
        globalLessonNumber++;
        const flags = detectFlags(lesson.title);
        const disp = cleanDisplayTitle(lesson.title);
        entries.push({
          id: `prog-${seed.id}-${slug(level)}-p${periodIndex}-l${gIdx + 1}`,
          subjectId: seed.id,
          classLevel: level,
          term: run.term,
          lessonNumber: globalLessonNumber,
          periodIndex,
          weekPeriod: run.weekPeriod,
          periodLessonCount,
          lessonIndexInPeriod: gIdx + 1,
          weekNumber: globalLessonNumber,
          sequence: run.sequence,
          moduleName: lesson.module,
          chapter: lesson.chapter,
          lessonTitle: disp,
          rawTitle: lesson.title,
          duration: lesson.duration,
          isEvaluation: flags.isEvaluation,
          isIntegration: flags.isIntegration,
          isRemediation: flags.isRemediation,
          isCatchUp: flags.isCatchUp,
          isHoliday: false,
        });
      });
    });
  }
  return entries;
}

export function groupProgressionByPeriod(entries: ProgressionEntry[]): ProgressionPeriodGroup[] {
  const map = new Map<number, ProgressionEntry[]>();
  const meta = new Map<number, { weekPeriod: string; term: Term; sequence: Sequence }>();
  for (const e of entries) {
    if (!map.has(e.periodIndex)) {
      map.set(e.periodIndex, []);
      meta.set(e.periodIndex, { weekPeriod: e.weekPeriod, term: e.term, sequence: e.sequence });
    }
    map.get(e.periodIndex)!.push(e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([periodIndex, lessons]) => ({
      periodIndex,
      weekPeriod: meta.get(periodIndex)!.weekPeriod,
      term: meta.get(periodIndex)!.term,
      sequence: meta.get(periodIndex)!.sequence,
      lessons: lessons.sort((a, b) => a.lessonIndexInPeriod - b.lessonIndexInPeriod),
    }));
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
    updatedAt: new Date(),
  };
  return {
    subject,
    modules: buildModules(seed),
    progression: buildProgression(seed),
    calendar: { ...DEFAULT_CALENDAR },
  };
}
