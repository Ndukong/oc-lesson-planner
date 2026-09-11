import type { AIModelOption } from "@/services/ai/gemini";

/** Small, fast model available on Mistral's free (Studio) tier. */
export const MISTRAL_DEFAULT_MODEL = "mistral-small-latest";

export async function generateWithMistral(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model = MISTRAL_DEFAULT_MODEL,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mistral request failed (${res.status}).${detail ? ` ${detail.slice(0, 200)}` : ""}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * List current Mistral chat models available to the given API key, excluding
 * embeddings, moderation, OCR and coding-only models.
 */
export async function listMistralModels(apiKey: string): Promise<AIModelOption[]> {
  const res = await fetch("https://api.mistral.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!res.ok) {
    throw new Error(`Could not fetch Mistral models (${res.status}).`);
  }
  const data = (await res.json()) as {
    data?: {
      id: string;
      context_length?: number;
      capabilities?: { completion_chat?: boolean };
    }[];
  };

  const excluded = /embed|moderation|ocr|classif|codestral/i;
  const models = (data.data ?? [])
    .filter((m) => m.capabilities?.completion_chat !== false)
    .filter((m) => !excluded.test(m.id))
    .filter((m) => m.id.endsWith("-latest"))
    .map((m) => ({
      id: m.id,
      label: m.context_length
        ? `${m.id} (${m.context_length.toLocaleString()} ctx)`
        : m.id
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (models.length === 0) {
    throw new Error("No chat models found for this Mistral API key.");
  }
  return models;
}