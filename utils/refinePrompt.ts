import {
  refineWithClaude,
  refineWithGroq,
  refineWithOpenAI,
  refineWithOpenRouter,
  refineWithPollinations,
} from "./providers";
import { getSystemPrompt } from "./systemPropmt";

type LLM =
  | "openai"
  | "claude"
  | "local"
  | "openrouter"
  | "ollama"
  | "groq"
  | "pollinations";

interface RefineOptions {
  prompt: string;
  domain?: string;
  llm?: LLM;
}

export const refinePrompt = async ({
  prompt,
  domain = "general",
  llm = "openai",
}: RefineOptions): Promise<string> => {
  const systemPrompt = getSystemPrompt(domain);

  switch (llm) {
    case "openai":
      return await refineWithOpenAI({ userPrompt: prompt, systemPrompt });
    case "claude":
      return await refineWithClaude({ userPrompt: prompt, systemPrompt });
    case "pollinations":
      return await refineWithPollinations({ userPrompt: prompt, systemPrompt });
    case "openrouter":
      return await refineWithOpenRouter({ userPrompt: prompt, systemPrompt });
    case "groq":
      return await refineWithGroq({ userPrompt: prompt, systemPrompt });
    default:
      throw new Error(`Unsupported LLM provider: ${llm}`);
  }
};
