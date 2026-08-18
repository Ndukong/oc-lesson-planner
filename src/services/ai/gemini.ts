import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_DEFAULT_MODEL = "gemini-2.0-flash";

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
