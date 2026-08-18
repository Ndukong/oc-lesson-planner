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

/** Remove one or more markdown code fences (```json ... ```) from the text. */
function stripFences(text: string): string {
  return text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();
}

/**
 * Find the outermost balanced JSON value (object or array) in the text,
 * ignoring braces/brackets that appear inside quoted strings.
 */
function extractBalanced(text: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0 && start >= 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return start >= 0 ? text.slice(start) : null;
}

/** Repair common model mistakes so the text can be parsed as JSON. */
function repairJson(text: string): string {
  let out = text;
  // Remove trailing commas before } or ]
  out = out.replace(/,\s*([}\]])/g, "$1");

  // Convert single-quoted strings to double-quoted ones using a scanner so we
  // only touch strings and never content inside double-quoted strings.
  let converted = "";
  let i = 0;
  const n = out.length;
  while (i < n) {
    const ch = out[i];
    if (ch === '"') {
      // copy the whole double-quoted string verbatim
      let j = i + 1;
      while (j < n && (out[j] !== '"' || out[j - 1] === "\\")) j++;
      converted += out.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      let body = "";
      while (j < n) {
        if (out[j] === "\\" && j + 1 < n) {
          body += out[j] + out[j + 1];
          j += 2;
          continue;
        }
        if (out[j] === "'") break;
        body += out[j];
        j++;
      }
      converted += '"' + body.replace(/"/g, '\\"') + '"';
      i = j + 1;
      continue;
    }
    converted += ch;
    i++;
  }
  out = converted;

  // Escape literal newlines/tabs that appear inside double-quoted strings.
  let result = "";
  let inStr = false;
  let esc = false;
  for (const ch of out) {
    if (inStr) {
      if (esc) {
        result += ch;
        esc = false;
        continue;
      }
      if (ch === "\\") {
        result += ch;
        esc = true;
        continue;
      }
      if (ch === '"') {
        inStr = false;
        result += ch;
        continue;
      }
      if (ch === "\n") {
        result += "\\n";
        continue;
      }
      if (ch === "\r") continue;
      if (ch === "\t") {
        result += "\\t";
        continue;
      }
      result += ch;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      result += ch;
      continue;
    }
    result += ch;
  }
  out = result;
  // Remove any remaining control characters outside of escape sequences
  out = out.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  return out.trim();
}

export function extractJson(text: string): unknown {
  const candidates: string[] = [];
  const raw = (text || "").trim();

  // 1. As-is
  candidates.push(raw);
  // 2. Markdown fences stripped
  candidates.push(stripFences(raw));
  // 3. Outermost balanced JSON value extracted
  const balanced = extractBalanced(stripFences(raw));
  if (balanced) candidates.push(balanced);

  // Try each candidate, then a repaired version of each.
  for (const candidate of candidates) {
    if (!candidate) continue;
    for (const attempt of [candidate, repairJson(candidate)]) {
      if (!attempt) continue;
      try {
        const parsed = JSON.parse(attempt);
        if (parsed !== null && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        // fall through to next candidate
      }
    }
  }

  throw new Error("AI response could not be parsed as JSON.");
}
