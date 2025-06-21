import { Request, Response } from "express";
import { refinePrompt } from "../../utils/refinePrompt";
import promptModel from "../../models/prompt";
import { userModel } from "../../models/user";
import { LLM } from "../../utils/provider/types";

interface PromptRequestBody {
  prompt: string;
  domain?: string;
  llm?: string;
}

const TRIAL_LIMIT = 3;

export const refinePromptWithAI = async (req: Request, res: Response) => {
  const { prompt, domain, llm } = req.body as PromptRequestBody;
  const userId = (req as any)?.user?.id;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({
      success: false,
      message: "Prompt is required and must be a string.",
    });
  }

  if (domain && typeof domain !== "string") {
    res.status(400).json({
      success: false,
      message: "Domain must be a string if provided.",
    });
  }

  if (llm && typeof llm !== "string") {
    res.status(400).json({
      success: false,
      message: "LLM must be a string if provided.",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User not found.",
      });
    }

    const isPremium =
      user &&
      user.subscription?.plan === "premium" &&
      user.subscription?.status === "active";

    if (user && !isPremium) {
      const trialCount = user.trialUsage?.count ?? 0;
      if (trialCount >= TRIAL_LIMIT) {
        res.status(403).json({
          success: false,
          message:
            "Trial limit exceeded. Please upgrade to Premium or try again tomorrow.",
        });
      }

      user.trialUsage = user.trialUsage ?? { count: 0 };
      user.trialUsage.count += 1;
      await user.save();
    }

    const refined = await refinePrompt({
      prompt,
      domain,
      llm: llm as LLM,
      isPremium: isPremium as boolean,
    });
    const data = await promptModel.create({
      userId,
      raw: prompt,
      prompt: refined,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error refining prompt:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const getPrompts = async (req: Request, res: Response) => {
  try {
    const prompts = await promptModel.find({ userId: (req as any).user.id });
    res.json({ success: true, dsta: prompts });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};
