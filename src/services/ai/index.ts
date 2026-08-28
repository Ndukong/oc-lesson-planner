import { generateWithGemini, GEMINI_DEFAULT_MODEL, listGeminiModels } from "@/services/ai/gemini";
import { generateWithGroq, GROQ_DEFAULT_MODEL, listGroqModels } from "@/services/ai/groq";
import type { AIModelOption } from "@/services/ai/gemini";
import { attemptWithRetry } from "@/services/ai/retry";
import {
  buildGenerationPrompt,
  buildSystemPrompt,
  extractJson
} from "@/services/ai/prompts";
import type { AISettings, AIProvider, LessonField } from "@/types";

export type { AIModelOption };

/** Fetch the list of currently available models for the given provider + key. */
export async function listAvailableModels(
  provider: AIProvider,
  apiKey: string
): Promise<AIModelOption[]> {
  if (!apiKey) throw new Error(`No ${provider} API key configured.`);
  if (provider === "gemini") return listGeminiModels(apiKey);
  return listGroqModels(apiKey);
}

export async function generateLessonContent(
  settings: AISettings,
  context: Parameters<typeof buildGenerationPrompt>[0],
  fields: LessonField[],
  signal?: AbortSignal
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

  return attemptWithRetry(async () => {
    const raw =
      provider === "gemini"
        ? await generateWithGemini(apiKey, systemPrompt, userPrompt, modelPreference, signal)
        : await generateWithGroq(apiKey, systemPrompt, userPrompt, modelPreference, signal);
    const parsed = extractJson(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("AI returned an unexpected response shape.");
    }
    return parsed as Record<string, unknown>;
  }, signal);
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
