import { Request, Response } from "express";
import { refinePrompt } from "../../utils/refinePrompt";
import promptModel from "../../models/prompt";

export const refinePromptWithAI = async (req: Request, res: Response) => {
  const { prompt, domain, llm } = req.body;
  if (!prompt) res.status(400).json({ error: "Prompt is required." });
  try {
    const refined = await refinePrompt({ prompt, domain, llm });
    const data = await promptModel.create({
      userId: (req as any).user.id,
      prompt: refined,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const getPrompts = async (req: Request, res: Response) => {
  try {
    const prompts = await promptModel.find({ userId: (req as any).user.id });
    res.json({ success: true, prompts });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
