import { DEFAULT_CALENDAR } from "@/types";
import type {
  ClassLevel,
  ProgressionEntry,
  SchoolCalendar,
  Sequence,
  Subject,
  SyllabusModule,
  SyllabusTopic
} from "@/types";
import { isEvaluationWeek, sequenceFromWeek, termFromWeek } from "@/utils/calendar";
import type { CurriculumLesson, SubjectSeed } from "@/db/seed-curriculum";
import { SYLLABUS_MATRIX, type MatrixModuleData } from "@/db/syllabus-matrix.generated";

export const SPARE_WEEK_TITLE = "Spare week (consolidation / catch-up)";
export const TEACHER_PLANNED_TITLE = "Teacher-planned week (add your lesson)";
export const OVERFLOW_TITLE = "Overflow (beyond 36 weeks)";

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
  const A = tokens(a); const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0; for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}
function formKey(level: ClassLevel): string | undefined {
  const m = /(\d)/.exec(level); return m ? m[1] : undefined;
}
function findMatrixModule(seedId: string, level: ClassLevel, moduleName: string): MatrixModuleData | undefined {
  const form = SYLLABUS_MATRIX[seedId]?.[formKey(level) ?? ""]; if (!form) return undefined;
  const target = normName(moduleName); if (!target) return undefined;
  let best: { entry: MatrixModuleData; score: number } | undefined;
  for (const [key, entry] of Object.entries(form)) {
    if (key === "_unsorted") continue;
    const k = normName(key); let score = 0;
    if (k === target) score = 1; else if (k.includes(target) || target.includes(k)) score = 0.85; else score = similarity(target, k);
    if (!best || score > best.score) best = { entry, score };
  }
  if (best && best.score >= 0.55) return best.entry;
  return form["_unsorted"];
}
export function splitContentItems(blob: string): Array<{ num: string | null; text: string }> {
  if (!blob) return [];
  const parts = blob.split(/(?=\b\d{1,2}\.\d{1,2}\b)|(?=\bTopic\s+\d+\s*:)|(?<=\s)(?=\d{1,2}\.\s+[A-Z(])/);
  const items: Array<{ num: string | null; text: string }> = [];
  for (const p of parts) { const t = p.trim(); if (t.length < 10) continue; const m = /^(\d{1,2}(?:\.\d{1,2})?)[\.\)]?\s+/.exec(t); items.push({ num: m ? m[1] : null, text: t }); }
  return items;
}
export function matchCoreKnowledge(chapter: string, matrix: MatrixModuleData | undefined): string | undefined {
  const items = splitContentItems(matrix?.content ?? ""); if (items.length === 0) return undefined;
  let best: { num: string | null; text: string } | undefined; let bestScore = 0;
  for (const item of items) { const score = similarity(chapter, item.text); if (score > bestScore || (score === bestScore && best && item.text.length > best.text.length)) { bestScore = score; best = item; } }
  if (!best || bestScore < 0.4) return undefined;
  const base = best.num && !best.num.includes(".") ? `${best.num}.` : null;
  if (best.text.length < 60 && base) { const related = items.filter((it) => it.num && it.num.startsWith(base) && it.num !== best!.num).map((it) => it.text); if (related.length > 0) return cap(`${best.text} ${related.join(" ")}`); }
  if (best.text.length < 60) return undefined;
  return cap(best.text);
}
function cap(s: string, max = 800): string { return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s; }
function holidayWeeksFor(holidays: import("@/types").Holiday[]): Record<number, string> {
  const map: Record<number, string> = {}; for (const h of holidays) for (let w = h.startWeek; w <= h.endWeek; w++) map[w] = h.name; return map;
}
function sequenceForWeek(week: number, calendar: SchoolCalendar): Sequence {
  const s = calendar.sequences.find((x) => week >= x.startWeek && week <= x.endWeek); return (s?.number ?? sequenceFromWeek(week)) as Sequence;
}
function slug(level: ClassLevel): string { return level.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
function topicText(title: string, level: ClassLevel, kind: keyof SyllabusTopic, subjectName: string): string {
  if (kind === "id" || kind === "moduleId" || kind === "name") return "";
  const sciences = ["Biology", "Human Biology", "Chemistry", "Computer Science", "Geology", "Mathematics", "Physics"];
  const isScience = sciences.some((s) => subjectName.includes(s));
  switch (kind) {
    case "coreKnowledge": return isScience ? `Essential content on "${title}" for ${level} following the official MINESEC syllabus. Learners master the key definitions, principles and procedures described in this topic through guided discovery.` : `Essential content on "${title}" for ${level} following the official MINESEC syllabus. Learners master the key ideas, concepts and skills described in this topic through guided study and real-life examples.`;
    case "competencies": return isScience ? `Categories of action: identifying, explaining, applying and experimenting. Examples of actions: observe and describe ${title.toLowerCase()}; carry out simple investigations; interpret results and communicate findings; apply knowledge to real-life situations in the community.` : `Categories of action: identifying, explaining, analysing and applying. Examples of actions: examine ${title.toLowerCase()}; discuss and interpret information; express reasoned opinions; apply knowledge to real-life situations in the community.`;
    case "aptitudes": return isScience ? `Observing accurately; measuring with available instruments; recording data in tables; drawing and labelling simple diagrams; manipulating basic equipment safely; solving numerical problems; working cooperatively in groups.` : `Reading and analysing texts; taking notes; summarising key points; expressing ideas clearly in speech and writing; discussing in groups; conducting simple enquiries and presenting findings.`;
    case "attitudes": return `Curiosity and love for the subject; respect for rules; honesty in reporting; teamwork and mutual respect; care for the environment; responsible use of resources.`;
    case "otherResources": return `Locally available items: exercise books, charts, posters, newspapers, maps, models, flashcards, household objects, tools, calculators (where available), chalk and marker pens, and other materials found in the school and community.`;
  }
  return "";
}
function buildTopics(seed: SubjectSeed, level: ClassLevel, moduleId: string, matrix: MatrixModuleData | undefined): SyllabusTopic[] {
  const seen = new Set<string>(); const topics: SyllabusTopic[] = [];
  for (const lesson of seed.curriculum[level] ?? []) {
    if (seen.has(lesson.chapter)) continue; seen.add(lesson.chapter);
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
    topics.push({ id: `topic-${seed.id}-${slug(level)}-${topics.length + 1}`, moduleId, name: chapter, coreKnowledge, competencies, aptitudes, attitudes, otherResources });
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
      modules.push({ id: moduleId, subjectId: seed.id, classLevel: level, moduleNumber: i + 1, name, duration: `${i + 2} hours`, familiesOfSituations: realFamilies ? cap(realFamilies) : `Learners encounter "${name}" in real-life situations such as household activities, local trades, community life and the natural environment. Lessons use contexts familiar to ${level} learners in Cameroon.`, topics: buildTopics(seed, level, moduleId, matrix) });
    });
  }
  return modules;
}
function cleanDisplayTitle(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^(?:Lesson\s*\d+\s*[:\.]?\s*)/i, "");
  s = s.replace(/\s+/g, " ").trim();
  return s || raw.trim();
}
export function buildProgression(seed: SubjectSeed, calendar: SchoolCalendar = DEFAULT_CALENDAR): ProgressionEntry[] {
  const entries: ProgressionEntry[] = [];
  const holidayWeeks = holidayWeeksFor(calendar.holidays);
  for (const level of seed.classLevels) {
    const lessons: CurriculumLesson[] = [...(seed.curriculum[level] ?? [])];
    // Filter out placeholder BREAK entries that slipped through (defensive)
    const filtered = lessons.filter((l) => l.title.trim().toUpperCase() !== "1ST BREAK" && l.title.trim() !== "");
    // Track week assignment: distribute lessons across non-holiday, non-evaluation weeks
    // but also preserve the progression sheet's weekPeriod as the source of truth for sequencing.
    // We lay lessons out in order over the teaching weeks; the progression sheet order IS the pedagogy order.
    let lessonIndex = 0;
    const lessonCount = filtered.length;
    const teachingWeeks = Array.from({ length: 36 }, (_, i) => i + 1).filter((w) => !holidayWeeks[w] && !isEvaluationWeek(w, calendar));
    const overflowLessons = lessonCount > teachingWeeks.length ? filtered.slice(teachingWeeks.length) : [];
    // Log overflow (these are real lessons that exist in the harmonised sheet but spill past week 36)
    if (overflowLessons.length > 0) {
      const spillTitles = overflowLessons.slice(0, 3).map((l) => l.title.slice(0, 50)).join(" | ");
      console.warn(`[LessonPlanner] ${seed.name} ${level}: ${overflowLessons.length} lesson(s) did not fit into the 36-week grid (overflow past week 36, e.g. "${spillTitles}"). They are appended as overflow rows.`);
    }
    for (let week = 1; week <= 36; week++) {
      const term = termFromWeek(week);
      const sequence = sequenceForWeek(week, calendar);
      if (holidayWeeks[week]) {
        entries.push({ id: `prog-${seed.id}-${slug(level)}-w${week}`, subjectId: seed.id, classLevel: level, term, weekNumber: week, sequence, moduleName: "", chapter: "", lessonTitle: holidayWeeks[week], duration: 0, isEvaluation: false, isHoliday: true });
        continue;
      }
      if (isEvaluationWeek(week, calendar)) {
        const prev = filtered[Math.min(lessonIndex, Math.max(0, filtered.length - 1))];
        entries.push({ id: `prog-${seed.id}-${slug(level)}-w${week}`, subjectId: seed.id, classLevel: level, term, weekNumber: week, sequence, moduleName: prev?.module ?? "", chapter: prev?.chapter ?? "", lessonTitle: `Evaluation (Sequence ${sequence})`, duration: 2, isEvaluation: true, isHoliday: false });
        continue;
      }
      const lesson = filtered[lessonIndex];
      if (lesson) {
        const disp = cleanDisplayTitle(lesson.title);
        const wp = lesson.weekRaw ?? "";
        lessonIndex++;
        entries.push({ id: `prog-${seed.id}-${slug(level)}-w${week}`, subjectId: seed.id, classLevel: level, term, weekNumber: week, sequence, moduleName: lesson.module, chapter: lesson.chapter, lessonTitle: disp, duration: lesson.duration, isEvaluation: false, isHoliday: false, lessonNumber: lessonIndex, weekPeriod: wp });
      } else {
        entries.push({ id: `prog-${seed.id}-${slug(level)}-w${week}`, subjectId: seed.id, classLevel: level, term, weekNumber: week, sequence, moduleName: "", chapter: "", lessonTitle: filtered.length === 0 ? TEACHER_PLANNED_TITLE : SPARE_WEEK_TITLE, duration: 1, isEvaluation: false, isHoliday: false });
      }
    }
    overflowLessons.forEach((lesson, idx) => {
      const vWeek = 37 + idx;
      const term = 3 as const; const seq = 6 as const;
      const disp = cleanDisplayTitle(lesson.title);
      entries.push({ id: `prog-${seed.id}-${slug(level)}-w${vWeek}`, subjectId: seed.id, classLevel: level, term, weekNumber: vWeek, sequence: seq, moduleName: lesson.module, chapter: lesson.chapter, lessonTitle: `${disp} (Overflow Lesson ${filtered.indexOf(lesson) + 1})`, duration: lesson.duration, isEvaluation: false, isHoliday: false, lessonNumber: filtered.indexOf(lesson) + 1, weekPeriod: lesson.weekRaw ?? "" });
    });
  }
  return entries;
}
export function buildOverflowEntriesFiltered(entries: ProgressionEntry[]): ProgressionEntry[] {
  return entries.filter((e) => e.weekNumber > 36);
}
export function buildSubjectSeed(seed: SubjectSeed): { subject: Subject; modules: SyllabusModule[]; progression: ProgressionEntry[]; calendar: SchoolCalendar } {
  const subject: Subject = { id: seed.id, name: seed.name, classLevels: [...seed.classLevels], periodsPerWeek: { ...seed.periodsPerWeek }, createdAt: new Date(), updatedAt: new Date() };
  return { subject, modules: buildModules(seed), progression: buildProgression(seed), calendar: { ...DEFAULT_CALENDAR } };
}
export function moduleLabelForLesson(chapter: string, title: string): string {
  void title; return chapter;
}
