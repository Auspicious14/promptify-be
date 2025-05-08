import { RENDER_MODELS } from "./provider/models";
import { openRouter, groq } from "./provider/sdk";
import { LLM } from "./provider/types";

import { getSystemPrompt } from "./systemPropmt";

interface RefineOptions {
  prompt: string;
  domain?: string;
  llm?: LLM;
  isPremium?: boolean;
}

export const refinePrompt = async ({
  prompt,
  domain = "general",
  llm = "mistral",
  isPremium = false,
}: RefineOptions): Promise<string> => {
  const systemPrompt = getSystemPrompt(domain);
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const PREMIUM_ONLY_MODELS: LLM[] = [
    "premium",
    "gpt-4",
    "dolphin",
    "amazon",
    "gemini",
  ];

  const selectedLLM: LLM =
    !isPremium && PREMIUM_ONLY_MODELS.includes(llm)
      ? "default"
      : llm in RENDER_MODELS
      ? llm
      : "default";

  const selected = RENDER_MODELS[selectedLLM];
  if (!selected) throw new Error(`Unsupported model: ${llm}`);

  const client = selected.provider === "openrouter" ? openRouter : groq;

  const completion = await client.chat.completions.create({
    model: selected.model,
    messages: messages as Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>,
  });

  return completion.choices[0].message.content ?? "";
};
