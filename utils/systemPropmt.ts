const getDomainSpecificInstructions = (domain: string): string => {
  switch (domain.toLowerCase().trim()) {
    case "writing":
      return "Incorporate keywords like ‘tone,’ ‘style,’ or ‘audience.’";
    case "coding":
      return "Include specific programming languages, frameworks, or constraints (e.g., ‘Python,’ ‘performance’).";
    case "marketing":
      return "Add keywords like ‘target audience,’ ‘brand voice,’ or ‘call to action.’";
    case "education":
      return "Include details like ‘grade level,’ ‘subject,’ or ‘learning objective.’";
    case "business":
      return "Incorporate keywords like ‘goals,’ ‘metrics,’ or ‘industry.’";
    case "research":
      return "Add keywords like ‘methodology,’ ‘sources,’ or ‘discipline.’";
    case "design":
      return "Include keywords like ‘style,’ ‘medium,’ or ‘user experience.’";
    case "healthcare":
      return "Incorporate keywords like ‘condition,’ ‘treatment,’ or ‘audience.’";
    case "legal":
      return "Add keywords like ‘jurisdiction,’ ‘terms,’ or ‘context.’";
    case "creative_arts":
      return "Incorporate keywords like ‘genre,’ ‘mood,’ or ‘medium.’";
    case "data_analysis":
      return "Add keywords like ‘dataset,’ ‘metrics,’ or ‘visualization.’";
    case "medical":
      return "Incorporate keywords like 'condition,' 'treatment,' or 'audience.'";
    case "technical":
      return "Add keywords like 'implementation,' 'requirements,' or 'constraints.'";
    default:
      return "Add any necessary context or keywords to improve the prompt.";
  }
};

export const getSystemPrompt = (domain: string): string => {
  if (!domain || typeof domain !== "string" || domain.trim() === "") {
    throw new Error("Invalid domain: Domain must be a non-empty string");
  }

  const domainInstructions = getDomainSpecificInstructions(domain);

  return `You are a Prompt Refiner AI. Your SOLE purpose is to rewrite a user's prompt to be more effective for a large language model.

YOU MUST NOT FULFILL OR ANSWER THE USER'S PROMPT. You only rewrite it.

Your task is to rewrite the user's prompt. Make it clearer, more specific, and add details relevant to the domain of "${domain}". ${domainInstructions}

Example (for a 'business' domain):
- User's Prompt: "Give me a business idea."
- Your Output (the refined prompt): "Generate three distinct business ideas in the sustainable energy sector that require low initial capital (under $5,000). For each idea, provide a brief description, the target audience, potential monetization strategies, and key challenges."

Now, based on this, rewrite the user's prompt that will follow. Return only the refined prompt as plain text.`;
};

// const getGenericPrompt = (domain: string) =>
//   `Your task is to refine the user's prompt for a large language model. Do not answer the prompt. Return a better version of the prompt that is more structured, and detailed. For example, if the user prompt is 'what is neurodiversity', a good refined prompt would be 'Explain the concept of neurodiversity, including its history, key characteristics, and the different perspectives on it. Discuss the social and medical models of disability in relation to neurodiversity and provide examples of neurodivergent conditions.' Add specific details, remove ambiguity, and include keywords relevant to the domain of ${domain}. Return a concise plain text prompt (max 400 words).`;

// export const getSystemPrompt = (domain: string): string => {
//   if (!domain || typeof domain !== "string" || domain.trim() === "") {
//     throw new Error("Invalid domain: Domain must be a non-empty string");
//   }

//   switch (domain.toLowerCase().trim()) {
//     case "writing":
//       return getGenericPrompt("writing");
//     case "coding":
//       return getGenericPrompt("coding");
//     case "marketing":
//       return getGenericPrompt("marketing");
//     case "education":
//       return getGenericPrompt("education");
//     case "business":
//       return getGenericPrompt("business");
//     case "research":
//       return getGenericPrompt("research");
//     case "design":
//       return getGenericPrompt("design");
//     case "healthcare":
//       return getGenericPrompt("healthcare");
//     case "legal":
//       return getGenericPrompt("legal");
//     case "creative_arts":
//       return getGenericPrompt("creative arts");
//     case "data_analysis":
//       return getGenericPrompt("data analysis");
//     case "medical":
//       return getGenericPrompt("medical");
//     case "technical":
//       return getGenericPrompt("technical");
//     default:
//       return "Refine the user's prompt to be clear, specific, and actionable. Remove ambiguity and add necessary context. Return only the refined prompt as plain text (max 400 words).";
//   }
// };
