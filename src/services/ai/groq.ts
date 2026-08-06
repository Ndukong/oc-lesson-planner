import Groq from "groq-sdk";

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
