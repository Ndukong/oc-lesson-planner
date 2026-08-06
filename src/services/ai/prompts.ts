import type { ClassLevel, LessonField } from "@/types";

export interface GenerationContext {
  subject: string;
  classLevel: ClassLevel;
  module: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  duration: number;
  periodType: "single" | "double";
  numberOfPeriods: number;
  coreKnowledge: string;
  competencies: string;
  aptitudes: string;
  attitudes: string;
  otherResources: string;
  previousLessonTitle: string;
}

const SYSTEM_PROMPT = `You are an expert Cameroonian secondary school teacher using the Competence-Based Approach (CBA) as mandated by MINESEC.

You generate lesson plan content that is practical and achievable in a Cameroonian secondary school classroom. Many schools lack electricity, running water, or a proper laboratory. Always use locally available materials (flashlights, tennis balls, cardboard, markers, string, rulers, empty bottles, stones, bicycle parts, phone chargers, mirrors, candles, matchboxes, rubber bands, plastic bags, etc.). Avoid expensive lab equipment unless the syllabus specifically requires it.

Respond with JSON ONLY, using the exact keys requested. Do not wrap in markdown code fences.`;

const FIELD_INSTRUCTIONS: Record<LessonField, string> = {
  previousKnowledge:
    'previousKnowledge: string — 2-3 sentences describing what students should already know from prior lessons.',
  objectives:
    'objectives: string[] — 3-5 specific, measurable objectives, each starting with "By the end of the lesson, the learner should be able to..." using Bloom\'s taxonomy verbs (define, explain, calculate, demonstrate, compare, design, evaluate).',
  introduction:
    'introduction: string — a 5-minute hook: a question, demonstration, real-life scenario, or brief story connecting to students\' daily life in Cameroon.',
  activities:
    'activities: array of { title: string, description: string, duration: number (minutes), type: "individual"|"group"|"demonstration"|"discussion"|"practical", teacherRole: string } — 3-4 learner-centred activities using CBA methodology, at least one group activity.',
  materials:
    'materials: string[] — specific, commonly available items in rural Cameroon.',
  lessonNotes:
    'lessonNotes: string — the actual content students copy into their exercise books. 300-800 words. Clear headings with "## " prefix, definitions in complete sentences, key formulas, diagrams described in text like "[Draw a circuit with a battery, switch and bulb in series]", 2-3 worked examples if mathematical, and a final summary box "Summary:" with bullet points using "- " prefix.',
  conclusion:
    'conclusion: string — 2-3 sentences summarizing the key takeaway and connecting to the next lesson.',
  homework:
    'homework: string — 1-2 practical assignments reinforcing the objectives, doable without internet or expensive materials.',
  evaluationCriteria:
    'evaluationCriteria: string[] — 3-4 observable, measurable criteria proving the objectives were met.',
  differentiation:
    'differentiation: string — brief notes on adapting the lesson for slower and faster learners.'
};

export function buildGenerationPrompt(
  context: GenerationContext,
  fields: LessonField[]
): string {
  const contextLines = [
    "Context:",
    `- Subject: ${context.subject}`,
    `- Class Level: ${context.classLevel}`,
    `- Module: ${context.module}`,
    `- Chapter: ${context.chapter}`,
    `- Topic: ${context.topic}`,
    `- Subtopics: ${context.subtopics.join(", ") || "—"}`,
    `- Duration: ${context.duration} minutes (${context.periodType} period, ${context.numberOfPeriods} period(s))`,
    `- Core Knowledge from Syllabus: ${context.coreKnowledge}`,
    `- Competencies from Syllabus: ${context.competencies}`,
    `- Aptitudes: ${context.aptitudes}`,
    `- Attitudes: ${context.attitudes}`,
    `- Available Resources: ${context.otherResources}`,
    `- Previous Lesson: ${context.previousLessonTitle || "—"}`
  ];

  const instruction = fields
    .map((f) => FIELD_INSTRUCTIONS[f])
    .join("\n");

  const userPrompt = `${contextLines.join("\n")}

Generate the following JSON object with exactly these keys:
${instruction}

Keep everything practical, simple and achievable in a ${context.classLevel} Cameroonian classroom. English only.`;

  return userPrompt;
}

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function extractJson(text: string): unknown {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI response could not be parsed as JSON.");
  }
}
