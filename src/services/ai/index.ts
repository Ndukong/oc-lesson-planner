import { generateWithGemini, GEMINI_DEFAULT_MODEL, listGeminiModels } from "@/services/ai/gemini";
import { generateWithGroq, GROQ_DEFAULT_MODEL, listGroqModels } from "@/services/ai/groq";
import {
  generateWithOpenRouter,
  OPENROUTER_DEFAULT_MODEL,
  listOpenRouterModels
} from "@/services/ai/openrouter";
import {
  generateWithMistral,
  MISTRAL_DEFAULT_MODEL,
  listMistralModels
} from "@/services/ai/mistral";
import {
  buildGenerationPrompt,
  buildLessonNotesPrompt,
  buildNotesSystemPrompt,
  buildSystemPrompt,
  extractJson
} from "@/services/ai/prompts";
import type { AISettings, AIProvider, LessonField } from "@/types";
import type { AIModelOption } from "@/services/ai/gemini";

export type { AIModelOption };

interface ProviderConfig {
  keyField: keyof Pick<
    AISettings,
    "geminiApiKey" | "groqApiKey" | "openrouterApiKey" | "mistralApiKey"
  >;
  defaultModel: string;
  list: (apiKey: string) => Promise<AIModelOption[]>;
  generate: (
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    model?: string,
    signal?: AbortSignal
  ) => Promise<string>;
}

const PROVIDER_CONFIG: Record<AIProvider, ProviderConfig> = {
  gemini: {
    keyField: "geminiApiKey",
    defaultModel: GEMINI_DEFAULT_MODEL,
    list: listGeminiModels,
    generate: generateWithGemini
  },
  groq: {
    keyField: "groqApiKey",
    defaultModel: GROQ_DEFAULT_MODEL,
    list: listGroqModels,
    generate: generateWithGroq
  },
  openrouter: {
    keyField: "openrouterApiKey",
    defaultModel: OPENROUTER_DEFAULT_MODEL,
    list: listOpenRouterModels,
    generate: generateWithOpenRouter
  },
  mistral: {
    keyField: "mistralApiKey",
    defaultModel: MISTRAL_DEFAULT_MODEL,
    list: listMistralModels,
    generate: generateWithMistral
  }
};

export const DEFAULT_MODEL_BY_PROVIDER: Record<AIProvider, string> = {
  gemini: GEMINI_DEFAULT_MODEL,
  groq: GROQ_DEFAULT_MODEL,
  openrouter: OPENROUTER_DEFAULT_MODEL,
  mistral: MISTRAL_DEFAULT_MODEL
};

export function providerKey(settings: AISettings, provider: AIProvider): string {
  return settings[PROVIDER_CONFIG[provider].keyField] ?? "";
}

/** Fetch the list of currently available models for the given provider + key. */
export async function listAvailableModels(
  provider: AIProvider,
  apiKey: string
): Promise<AIModelOption[]> {
  const cfg = PROVIDER_CONFIG[provider];
  if (!apiKey) throw new Error(`No ${provider} API key configured.`);
  return cfg.list(apiKey);
}

export async function generateLessonContent(
  settings: AISettings,
  context: Parameters<typeof buildGenerationPrompt>[0],
  fields: LessonField[],
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const provider = settings.preferredProvider;
  const cfg = PROVIDER_CONFIG[provider];
  const apiKey = providerKey(settings, provider);

  if (!apiKey) {
    throw new Error(
      `No ${provider} API key configured. Add one in Settings first.`
    );
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildGenerationPrompt(context, fields);
  const model = settings.modelPreference || cfg.defaultModel;

  const raw = await cfg.generate(apiKey, systemPrompt, userPrompt, model, signal);

  const parsed = extractJson(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI returned an unexpected response shape.");
  }
  return parsed as Record<string, unknown>;
}

/** Strip a single outer code fence (``` … ```) only when it wraps the whole response. */
function cleanLessonNotes(text: string): string {
  const out = (text ?? "").trim();
  const fence = /^```(?:json|markdown|md)?\s*([\s\S]*?)```\s*$/i;
  const match = out.match(fence);
  return match ? match[1].trim() : out;
}

/**
 * Generate ONLY the lesson notes as plain markdown. This path never goes
 * through JSON parsing, so a long, newline-heavy notes field cannot fail with
 * a "could not be parsed as JSON" error or get silently dropped.
 */
export async function generateLessonNotes(
  settings: AISettings,
  context: Parameters<typeof buildLessonNotesPrompt>[0],
  signal?: AbortSignal
): Promise<string> {
  const provider = settings.preferredProvider;
  const cfg = PROVIDER_CONFIG[provider];
  const apiKey = providerKey(settings, provider);

  if (!apiKey) {
    throw new Error(
      `No ${provider} API key configured. Add one in Settings first.`
    );
  }

  const raw = await cfg.generate(
    apiKey,
    buildNotesSystemPrompt(),
    buildLessonNotesPrompt(context),
    settings.modelPreference || cfg.defaultModel,
    signal
  );

  const notes = cleanLessonNotes(raw);
  if (!notes) throw new Error("AI returned empty lesson notes.");
  return notes;
}

export async function testAIProvider(
  settings: AISettings
): Promise<{ ok: boolean; message: string }> {
  const provider = settings.preferredProvider;
  const cfg = PROVIDER_CONFIG[provider];
  const apiKey = providerKey(settings, provider);
  if (!apiKey) {
    return { ok: false, message: `No ${provider} API key set.` };
  }
  try {
    const prompt =
      'Respond with JSON only: {"ok": true, "message": "Connection successful"}';
    await cfg.generate(
      apiKey,
      "You are a test helper. Respond with JSON only.",
      prompt,
      settings.modelPreference || cfg.defaultModel
    );
    return { ok: true, message: "Connection successful." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Connection failed."
    };
  }
}