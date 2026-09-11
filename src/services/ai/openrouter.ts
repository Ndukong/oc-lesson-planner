import type { AIModelOption } from "@/services/ai/gemini";

/** Routes automatically across currently-free OpenRouter models, resilient
 *  to the free catalog churning (individual `:free` slugs come and go). */
export const OPENROUTER_DEFAULT_MODEL = "openrouter/free";

export async function generateWithOpenRouter(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model = OPENROUTER_DEFAULT_MODEL,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://oc-lesson-planner.netlify.app",
      "X-Title": "Lesson Planner"
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter request failed (${res.status}).${detail ? ` ${detail.slice(0, 200)}` : ""}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * List the currently-free OpenRouter models available for the given API key.
 * The models endpoint is public; the key is passed so the catalog matches the
 * account. Only zero-cost `:free` chat models are returned (plus the
 * `openrouter/free` router as a resilient option).
 */
export async function listOpenRouterModels(apiKey: string): Promise<AIModelOption[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  });
  if (!res.ok) {
    throw new Error(`Could not fetch OpenRouter models (${res.status}).`);
  }
  const data = (await res.json()) as {
    data?: {
      id: string;
      name?: string;
      context_length?: number;
      architecture?: { input_modalities?: string[] };
    }[];
  };

  const excluded = /embedding|rerank|reranker|audio|tts|whisper|image-gen|moderation|classif|lyria/i;
  const freeModels = (data.data ?? [])
    .filter((m) => /:free$/i.test(m.id))
    .filter((m) => !excluded.test(m.id))
    .map((m) => ({
      id: m.id,
      label: m.name
        ? m.context_length
          ? `${m.name} (${m.context_length.toLocaleString()} ctx)`
          : m.name
        : m.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const router: AIModelOption = {
    id: OPENROUTER_DEFAULT_MODEL,
    label: "OpenRouter free router (auto-picks a free model)"
  };

  const models = [router, ...freeModels];
  if (models.length === 0) {
    throw new Error("No free-tier OpenRouter models found for this API key.");
  }
  return models;
}