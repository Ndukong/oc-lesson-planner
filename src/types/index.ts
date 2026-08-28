export const CLASS_LEVELS = [
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4",
  "Form 5",
  "Lower Sixth",
  "Upper Sixth"
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];

export type Term = 1 | 2 | 3;
export type Sequence = 1 | 2 | 3 | 4 | 5 | 6;

export type LessonStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "skipped"
  | "partial";

export type PeriodType = "single" | "double";
export type AIProvider = "gemini" | "groq";

export interface Subject {
  id: string;
  name: string;
  classLevels: ClassLevel[];
  periodsPerWeek: Partial<Record<ClassLevel, number>>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyllabusTopic {
  id: string;
  moduleId: string;
  name: string;
  coreKnowledge: string;
  competencies: string;
  aptitudes: string;
  attitudes: string;
  otherResources: string;
}

export interface SyllabusModule {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  moduleNumber: number;
  name: string;
  duration: string;
  familiesOfSituations: string;
  topics: SyllabusTopic[];
}

export interface ProgressionEntry {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  term: Term;
  weekNumber: number;
  sequence: Sequence;
  moduleName: string;
  chapter: string;
  lessonTitle: string;
  duration: number;
  isEvaluation: boolean;
  isHoliday: boolean;
}

export interface Holiday {
  name: string;
  startWeek: number;
  endWeek: number;
  startDate?: Date;
  endDate?: Date;
}

export interface SequenceInfo {
  number: Sequence;
  startWeek: number;
  endWeek: number;
  evaluationWeek: number;
}

export interface SchoolCalendar {
  id: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  holidays: Holiday[];
  sequences: SequenceInfo[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: "individual" | "group" | "demonstration" | "discussion" | "practical";
  teacherRole: string;
}

export interface LessonPlan {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  weekNumber: number;
  date?: string;
  term: Term;
  sequence: Sequence;
  module: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  previousKnowledge: string;
  objectives: string[];
  introduction: string;
  activities: Activity[];
  materials: string[];
  lessonNotes: string;
  conclusion: string;
  homework: string;
  evaluationCriteria: string[];
  crossCuttingCompetencies: string[];
  differentiation: string;
  duration: number;
  periodType: PeriodType;
  numberOfPeriods: number;
  status: LessonStatus;
  teacherReflection: string;
  attendanceNote: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AISettings {
  id: string;
  geminiApiKey?: string;
  groqApiKey?: string;
  preferredProvider: AIProvider;
  autoGenerate: boolean;
  modelPreference?: string;
}

export interface WeekInfo {
  week: number;
  sequence: Sequence;
  term: Term;
  isHoliday: boolean;
  isEvaluation: boolean;
}

export interface TeacherProfile {
  id: string;
  name: string;
  school: string;
  subjects: string[];
  defaultClassLevels: ClassLevel[];
  region?: string;
  onboarded: boolean;
}

export interface SubjectTemplate {
  version: string;
  exportedAt: Date;
  exportedBy: string;
  subject: Subject;
  modules: SyllabusModule[];
  progression: ProgressionEntry[];
  calendar: SchoolCalendar;
}

export type LessonField =
  | "previousKnowledge"
  | "objectives"
  | "introduction"
  | "activities"
  | "materials"
  | "lessonNotes"
  | "conclusion"
  | "homework"
  | "evaluationCriteria"
  | "differentiation";

export const FIELD_LABELS: Record<LessonField, string> = {
  previousKnowledge: "Previous Knowledge",
  objectives: "Objectives",
  introduction: "Introduction",
  activities: "Activities",
  materials: "Materials",
  lessonNotes: "Lesson Notes",
  conclusion: "Conclusion",
  homework: "Homework",
  evaluationCriteria: "Evaluation Criteria",
  differentiation: "Differentiation"
};

export const STATUS_LABELS: Record<LessonStatus, string> = {
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  partial: "Partial"
};

export const STATUS_COLORS: Record<LessonStatus, string> = {
  planned: "bg-slate-200 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-800"
};

export const SEQUENCE_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-violet-100 border-violet-300 text-violet-900",
  "bg-cyan-100 border-cyan-300 text-cyan-900",
  "bg-emerald-100 border-emerald-300 text-emerald-900",
  "bg-rose-100 border-rose-300 text-rose-900"
];

export const SEQUENCE_BARS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-rose-500"
];

export const CROSS_CUTTING_COMPETENCIES = [
  "Communication",
  "Problem-solving",
  "Citizenship",
  "ICT Literacy",
  "Creativity",
  "Cooperation"
];

export const ACTIVITY_TYPES: Activity["type"][] = [
  "individual",
  "group",
  "demonstration",
  "discussion",
  "practical"
];

export const TERM_NAMES: Record<Term, string> = {
  1: "Term 1",
  2: "Term 2",
  3: "Term 3"
};

export const APP_VERSION = "1.0.0";
export const DEFAULT_ACADEMIC_YEAR = "2025/2026";

export const DEFAULT_CALENDAR: SchoolCalendar = {
  id: "default-calendar",
  academicYear: DEFAULT_ACADEMIC_YEAR,
  // Local-time constructors (not ISO strings) so the date is the same
  // calendar day regardless of the device's timezone offset.
  startDate: new Date(2025, 8, 1),
  endDate: new Date(2026, 4, 31),
  holidays: [
    { name: "Christmas Break", startWeek: 13, endWeek: 14, startDate: new Date(2025, 10, 24), endDate: new Date(2025, 11, 5) },
    { name: "Easter Break", startWeek: 25, endWeek: 26, startDate: new Date(2026, 1, 16), endDate: new Date(2026, 1, 27) }
  ],
  // Sequences are contiguous 6-week blocks (weeks 1-36) so every week belongs
  // to exactly one sequence; holidays fall INSIDE a sequence (weeks are still
  // marked as holidays via the holidays list). Evaluation weeks are the last
  // week of each sequence (6, 12, 18, 24, 30, 36).
  sequences: [
    { number: 1, startWeek: 1, endWeek: 6, evaluationWeek: 6 },
    { number: 2, startWeek: 7, endWeek: 12, evaluationWeek: 12 },
    { number: 3, startWeek: 13, endWeek: 18, evaluationWeek: 18 },
    { number: 4, startWeek: 19, endWeek: 24, evaluationWeek: 24 },
    { number: 5, startWeek: 25, endWeek: 30, evaluationWeek: 30 },
    { number: 6, startWeek: 31, endWeek: 36, evaluationWeek: 36 }
  ]
};
