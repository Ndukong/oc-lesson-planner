export type ClassLevel =
  | "Form 1"
  | "Form 2"
  | "Form 3"
  | "Form 4"
  | "Form 5"
  | "Lower Sixth"
  | "Upper Sixth";

export type Term = 1 | 2 | 3;
export type Sequence = 1 | 2 | 3 | 4 | 5 | 6;
export type LessonStatus = "planned" | "completed" | "skipped" | "partial";
export type PeriodType = "single" | "double";

export interface Subject {
  id: string;
  name: string;
  classLevels: ClassLevel[];
  periodsPerWeek: Record<ClassLevel, number>;
  createdAt: Date;
  updatedAt: Date;
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

export interface LessonPlan {
  id: string;
  subjectId: string;
  classLevel: ClassLevel;
  weekNumber: number;
  date?: string;
  term: Term;
  sequence: Sequence;
  module: string;
  topic: string;
  subtopics: string[];
  objectives: string[];
  activities: string[];
  materials: string[];
  duration: 45 | 90;
  periodType: PeriodType;
  status: LessonStatus;
  teacherNotes: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AISettings {
  geminiApiKey?: string;
  groqApiKey?: string;
  preferredProvider: "gemini" | "groq";
  autoGenerate: boolean;
}

export interface AppState {
  selectedSubjectId: string | null;
  selectedClassLevel: ClassLevel | null;
  currentWeek: number;
  currentSequence: Sequence;
  currentTerm: Term;
  isOnline: boolean;
}
