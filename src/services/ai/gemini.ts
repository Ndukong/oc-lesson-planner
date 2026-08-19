import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_DEFAULT_MODEL = "gemini-2.0-flash";

export interface AIModelOption {
  id: string;
  label: string;
}

export async function generateWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model = GEMINI_DEFAULT_MODEL
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt
  });
  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });
  return result.response.text();
}

/**
 * Fetch the list of Gemini models currently available for the given API key,
 * limited to free-tier "flash" models that support text generation.
 */
export async function listGeminiModels(apiKey: string): Promise<AIModelOption[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  );
  if (!res.ok) {
    throw new Error(`Could not fetch Gemini models (${res.status}).`);
  }
  const data = (await res.json()) as {
    models?: {
      name: string;
      displayName?: string;
      supportedGenerationMethods?: string[];
    }[];
  };

  const models = (data.models ?? [])
    .filter(
      (m) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        /flash/i.test(m.name)
    )
    .map((m) => {
      const id = m.name.replace(/^models\//, "");
      return {
        id,
        label: m.displayName || id
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  if (models.length === 0) {
    throw new Error("No free-tier Gemini models found for this API key.");
  }
  return models;
}
