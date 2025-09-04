import express, { Request, Response, NextFunction } from "express";
import { userModel } from "../models/user";

export const checkTrialLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const user: any = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Premium users bypass trial limits
    if (user.subscription?.plan === "premium" && user.subscription?.status === "active") {
      return next();
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastUsed = user.trialUsage?.lastUsed
      ? new Date(user.trialUsage.lastUsed).setHours(0, 0, 0, 0)
      : null;

    if (today !== lastUsed) {
      user.trialUsage = { count: 0, lastUsed: new Date() };
    }

    if (user.trialUsage.count >= 3) {
      return res.status(403).json({
        success: false,
        message:
          "You have exhausted your free trial for today. Come back tomorrow or subscribe to premium.",
      });
    }

    user.trialUsage.count++;
    await user.save();

    next();
  } catch (error) {
    console.error("Error in checkTrialLimit:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
