const getGenericPrompt = (domain: string) =>
  `Your task is to refine the user's prompt for a large language model. Do not answer the prompt. Return a better version of the prompt that is more structured, and detailed. For example, if the user prompt is 'what is neurodiversity', a good refined prompt would be 'Explain the concept of neurodiversity, including its history, key characteristics, and the different perspectives on it. Discuss the social and medical models of disability in relation to neurodiversity and provide examples of neurodivergent conditions.' Add specific details, remove ambiguity, and include keywords relevant to the domain of ${domain}. Return a concise plain text prompt (max 400 words).`;

export const getSystemPrompt = (domain: string): string => {
  if (!domain || typeof domain !== "string" || domain.trim() === "") {
    throw new Error("Invalid domain: Domain must be a non-empty string");
  }

  switch (domain.toLowerCase().trim()) {
    case "writing":
      return getGenericPrompt("writing");
    case "coding":
      return getGenericPrompt("coding");
    case "marketing":
      return getGenericPrompt("marketing");
    case "education":
      return getGenericPrompt("education");
    case "business":
      return getGenericPrompt("business");
    case "research":
      return getGenericPrompt("research");
    case "design":
      return getGenericPrompt("design");
    case "healthcare":
      return getGenericPrompt("healthcare");
    case "legal":
      return getGenericPrompt("legal");
    case "creative_arts":
      return getGenericPrompt("creative arts");
    case "data_analysis":
      return getGenericPrompt("data analysis");
    case "medical":
      return getGenericPrompt("medical");
    case "technical":
      return getGenericPrompt("technical");
    default:
      return "Refine the user's prompt to be clear, specific, and actionable. Remove ambiguity and add necessary context. Return only the refined prompt as plain text (max 400 words).";
  }
};
