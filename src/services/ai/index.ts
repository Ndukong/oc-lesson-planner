import { generateWithGemini, GEMINI_DEFAULT_MODEL } from "@/services/ai/gemini";
import { generateWithGroq, GROQ_DEFAULT_MODEL } from "@/services/ai/groq";
import {
  buildGenerationPrompt,
  buildSystemPrompt,
  extractJson
} from "@/services/ai/prompts";
import type { AISettings, LessonField } from "@/types";

export async function generateLessonContent(
  settings: AISettings,
  context: Parameters<typeof buildGenerationPrompt>[0],
  fields: LessonField[]
): Promise<Record<string, unknown>> {
  const provider = settings.preferredProvider;
  const apiKey =
    provider === "gemini" ? settings.geminiApiKey : settings.groqApiKey;

  if (!apiKey) {
    throw new Error(
      `No ${provider} API key configured. Add one in Settings first.`
    );
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildGenerationPrompt(context, fields);

  const modelPreference =
    settings.modelPreference ||
    (provider === "gemini" ? GEMINI_DEFAULT_MODEL : GROQ_DEFAULT_MODEL);

  let raw: string;
  if (provider === "gemini") {
    raw = await generateWithGemini(apiKey, systemPrompt, userPrompt, modelPreference);
  } else {
    raw = await generateWithGroq(apiKey, systemPrompt, userPrompt, modelPreference);
  }

  const parsed = extractJson(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI returned an unexpected response shape.");
  }
  return parsed as Record<string, unknown>;
}

export async function testAIProvider(
  settings: AISettings
): Promise<{ ok: boolean; message: string }> {
  const provider = settings.preferredProvider;
  const apiKey =
    provider === "gemini" ? settings.geminiApiKey : settings.groqApiKey;
  if (!apiKey) {
    return { ok: false, message: `No ${provider} API key set.` };
  }
  try {
    const prompt =
      'Respond with JSON only: {"ok": true, "message": "Connection successful"}';
    if (provider === "gemini") {
      await generateWithGemini(
        apiKey,
        "You are a test helper. Respond with JSON only.",
        prompt,
        settings.modelPreference || GEMINI_DEFAULT_MODEL
      );
    } else {
      await generateWithGroq(
        apiKey,
        "You are a test helper. Respond with JSON only.",
        prompt,
        settings.modelPreference || GROQ_DEFAULT_MODEL
      );
    }
    return { ok: true, message: "Connection successful." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Connection failed."
    };
  }
}
