import Groq from "groq-sdk";
import type { AIModelOption } from "@/services/ai/gemini";

export const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function generateWithGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model = GROQ_DEFAULT_MODEL
): Promise<string> {
  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });
  return completion.choices[0]?.message?.content ?? "";
}

/**
 * Fetch the list of Groq models currently available for the given API key,
 * limited to active chat-completion models.
 */
export async function listGroqModels(apiKey: string): Promise<AIModelOption[]> {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error(`Could not fetch Groq models (${res.status}).`);
  }
  const data = (await res.json()) as {
    data?: {
      id: string;
      active?: boolean;
      context_window?: number;
    }[];
  };

  // Exclude speech/audio and other non-chat models.
  const excluded = /whisper|tts|audio|transcrib|speech/i;
  const models = (data.data ?? [])
    .filter((m) => m.active !== false)
    .filter((m) => !excluded.test(m.id))
    .map((m) => ({
      id: m.id,
      label: m.context_window ? `${m.id} (${m.context_window} ctx)` : m.id
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (models.length === 0) {
    throw new Error("No active Groq models found for this API key.");
  }
  return models;
}
