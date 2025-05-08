import { Request, Response } from "express";
import { refinePrompt } from "../../utils/refinePrompt";
import promptModel from "../../models/prompt";
import { userModel } from "../../models/user";

export const refinePromptWithAI = async (req: Request, res: Response) => {
  const { prompt, domain, llm } = req.body;
  const userId = (req as any).user.id;

  if (!prompt) res.status(400).json({ error: "Prompt is required." });

  try {
    const user = await userModel.findById(userId);

    if (!user)
      res.status(401).json({ success: false, message: "Unauthorized" });

    const isPremium =
      user?.subscription?.plan === "premium" &&
      user?.subscription?.status === "active"
        ? true
        : false;

    const refined = await refinePrompt({ prompt, domain, llm, isPremium });
    const data = await promptModel.create({
      userId,
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
