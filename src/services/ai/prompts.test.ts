import { describe, expect, it } from "vitest";
import {
  ALL_LESSON_FIELDS,
  buildGenerationPrompt,
  buildLessonNotesPrompt,
  buildNotesSystemPrompt,
  buildSystemPrompt,
  extractJson,
  LESSON_FIELD_GROUPS,
  type GenerationContext
} from "@/services/ai/prompts";
import { FIELD_LABELS } from "@/types";

describe("LESSON_FIELD_GROUPS", () => {
  it("covers every lesson field exactly once", () => {
    const all = [...ALL_LESSON_FIELDS].sort();
    const expected = Object.keys(FIELD_LABELS).sort();
    expect(all).toEqual(expected);
    expect(new Set(all).size).toBe(all.length);
  });

  it("gives lessonNotes its own request so long notes cannot truncate the rest", () => {
    expect(LESSON_FIELD_GROUPS).toHaveLength(2);
    expect(LESSON_FIELD_GROUPS[1]).toEqual(["lessonNotes"]);
    expect(LESSON_FIELD_GROUPS[0]).not.toContain("lessonNotes");
  });
});

describe("extractJson", () => {
  it("parses a plain JSON object", () => {
    expect(extractJson('{"ok": true}')).toEqual({ ok: true });
  });

  it("parses JSON wrapped in markdown fences", () => {
    const text = '```json\n{"objectives": ["a", "b"]}\n```';
    expect(extractJson(text)).toEqual({ objectives: ["a", "b"] });
  });

  it("parses JSON embedded in surrounding prose", () => {
    const text = 'Here is your lesson:\n{"topic": "Light"}\nHope that helps!';
    expect(extractJson(text)).toEqual({ topic: "Light" });
  });

  it("repairs trailing commas", () => {
    const text = '{"materials": ["torch", "ruler",],}';
    expect(extractJson(text)).toEqual({ materials: ["torch", "ruler"] });
  });

  it("repairs single-quoted strings", () => {
    const text = "{'title': 'Newton\\'s first law'}";
    expect(extractJson(text)).toEqual({ title: "Newton's first law" });
  });

  it("repairs invalid \\' escapes inside double-quoted strings", () => {
    const text = '{"title": "Newton\\\'s first law"}';
    expect(extractJson(text)).toEqual({ title: "Newton's first law" });
  });

  it("repairs literal newlines inside string values", () => {
    const text = '{"lessonNotes": "line one\nline two"}';
    expect(extractJson(text)).toEqual({ lessonNotes: "line one\nline two" });
  });

  it("handles braces inside quoted strings", () => {
    const text = '{"notes": "sets like {a, b} and closing } are fine"}';
    expect(extractJson(text)).toEqual({
      notes: "sets like {a, b} and closing } are fine"
    });
  });

  it("returns arrays as-is", () => {
    expect(extractJson('["a", "b"]')).toEqual(["a", "b"]);
  });

  it("throws on truncated JSON", () => {
    expect(() => extractJson('{"a": {"b": [1, 2')).toThrow();
  });

  it("throws on non-JSON text", () => {
    expect(() => extractJson("Sorry, I cannot help with that.")).toThrow();
  });
});

const CONTEXT: GenerationContext = {
  subject: "Physics",
  classLevel: "Form 3",
  module: "Optics",
  chapter: "Reflection of Light",
  topic: "Description and propagation of light",
  subtopics: ["Rays", "Beams"],
  duration: 90,
  periodType: "double",
  numberOfPeriods: 2,
  coreKnowledge: "Laws of reflection.",
  competencies: "Observe and describe.",
  aptitudes: "Measuring angles.",
  attitudes: "Curiosity.",
  otherResources: "Mirrors, torches.",
  previousLessonTitle: ""
};

describe("buildGenerationPrompt", () => {
  it("injects the syllabus context", () => {
    const prompt = buildGenerationPrompt(CONTEXT, ["lessonNotes"]);
    expect(prompt).toContain("Subject: Physics");
    expect(prompt).toContain("Class Level: Form 3");
    expect(prompt).toContain("Core Knowledge from Syllabus: Laws of reflection.");
    expect(prompt).toContain("Subtopics: Rays, Beams");
  });

  it("only includes instructions for the requested fields", () => {
    const prompt = buildGenerationPrompt(CONTEXT, ["objectives"]);
    expect(prompt).toContain("objectives: string[]");
    expect(prompt).not.toContain("lessonNotes: string");
  });

  it("anchors the answer to a Cameroonian classroom", () => {
    const prompt = buildGenerationPrompt(CONTEXT, ["materials"]);
    expect(prompt).toContain("Cameroonian classroom");
  });
});

describe("buildSystemPrompt", () => {
  it("mandates CBA and locally available materials", () => {
    const sys = buildSystemPrompt();
    expect(sys).toContain("Competence-Based Approach");
    expect(sys).toContain("locally available materials");
    expect(sys).toContain("JSON ONLY");
  });
});

describe("lesson notes plain-text path", () => {
  it("uses a notes system prompt that never demands JSON", () => {
    const sys = buildNotesSystemPrompt();
    expect(sys).toContain("Competence-Based Approach");
    expect(sys).not.toContain("JSON ONLY");
    expect(sys).toContain("plain markdown");
  });

  it("requests notes as raw markdown, not a JSON object", () => {
    const prompt = buildLessonNotesPrompt(CONTEXT);
    expect(prompt).toContain("Subject: Physics");
    expect(prompt).toContain("Core Knowledge from Syllabus: Laws of reflection.");
    expect(prompt.toLowerCase()).toContain("only the markdown lesson notes");
    expect(prompt).not.toContain("Generate the following JSON object");
    expect(prompt).not.toContain('lessonNotes: string');
  });

  it("keeps lessonNotes in its own group so notes can never block other fields", () => {
    expect(LESSON_FIELD_GROUPS[1]).toEqual(["lessonNotes"]);
  });
});