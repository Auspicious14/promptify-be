import { Request, Response } from "express";
import { userModel } from "../../models/user";

export const getTrialUsage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await userModel.findById(userId);

    if (!user)
      res.status(404).json({ success: false, message: "Unauthorised" });

    if (user?.subscription?.plan === "premium") {
      res.json({ success: true, message: "Unlimited" });
    }

    const today = new Date().toDateString();
    const lastUsed = user?.trialUsage?.lastUsed?.toDateString();

    let count = user?.trialUsage?.count || 0;

    if (today !== lastUsed) {
      // Reset for new day
      if (user) {
        user.trialUsage = { count: 0, lastUsed: new Date() };
      }
      await user?.save();
      count = 0;
    }

    res.json({
      success: true,
      unlimited: false,
      remaining: 3 - count,
      used: count,
    });
  } catch (err) {
    console.error("Error checking trial usage", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
