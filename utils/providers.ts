import axios from "axios";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const refineWithOpenAI = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return completion.choices[0].message.content?.trim() || "";
};

// providers/claudeProvider.ts
export const refineWithClaude = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    return (
      response.data.content?.[0]?.text?.trim() || "Claude returned no result"
    );
  } catch (error: any) {
    console.error("Claude API error:", error.response?.data || error.message);
    return "Error processing Claude request";
  }
};

export const refineWithOpenRouter = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistral/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return (
      response.data.choices?.[0]?.message?.content?.trim() ||
      "No response from OpenRouter."
    );
  } catch (error: any) {
    console.error(
      "OpenRouter API error:",
      error.response?.data || error.message
    );
    return "Error processing OpenRouter request";
  }
};

export const refineWithGroq = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return (
      response.data.choices?.[0]?.message?.content?.trim() ||
      "No response from Groq."
    );
  } catch (error: any) {
    console.error("Groq API error:", error.response?.data || error.message);
    return "Error processing Groq request";
  }
};

export const refinePromptWithHuggingFace = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  const apiUrl = "https://api-inference.huggingface.co/models/t5-large";
  const headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  const payload = {
    inputs: `${systemPrompt}${userPrompt}`,
    parameters: {
      max_length: 100,
      num_return_sequences: 1,
    },
  };

  // Make API call
  const response = await axios.post(apiUrl, payload, { headers });

  // Extract and validate response
  if (
    !response.data ||
    !Array.isArray(response.data) ||
    !response.data[0].generated_text
  ) {
    throw new Error("Invalid response from Hugging Face API");
  }

  // Return refined prompt (cleaned up)
  const refinedPrompt = response.data[0].generated_text.trim();
  return refinedPrompt;
};

export const refineWithPollinations = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.pollinations.ai/v1/chat",
      {
        model: "pollinations/multi-modal",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return (
      response.data.choices?.[0]?.message?.content?.trim() ||
      "No response from Pollinations"
    );
  } catch (error: any) {
    console.error(
      "Pollinations API error:",
      error.response?.data || error.message
    );
    return "Error processing Pollinations request";
  }
};

export const refinePromptWithXAI = async ({
  userPrompt,
  systemPrompt,
}: {
  userPrompt: string;
  systemPrompt: string;
}): Promise<string> => {
  // API configuration
  const apiUrl = "https://api.x.ai/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    "Content-Type": "application/json",
  };
  const payload = {
    model: "grok-3",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    max_tokens: 100,
    temperature: 0.7,
  };

  const response = await axios.post(apiUrl, payload, { headers });

  if (
    !response.data ||
    !response.data.choices ||
    !response.data.choices[0].message.content
  ) {
    throw new Error("Invalid response from xAI API");
  }

  const refinedPrompt = response.data.choices[0].message.content.trim();
  return refinedPrompt;
};
