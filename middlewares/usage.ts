import express, { Request, Response, NextFunction } from "express";
import { userModel } from "../models/user";

export const checkTrialLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;
  const user: any = await userModel.findById(userId);

  if (!user) res.status(401).json({ success: false, message: "Unauthorized" });

  if (user.subscription.plan === "premium") next();

  const today = new Date().toDateString();
  const lastUsed = user.usage?.lastUsed?.toDateString();

  if (today !== lastUsed) {
    user.usage = { count: 1, lastUsed: new Date() };
  } else {
    if (user.usage.count >= 3) {
      res.status(403).json({
        success: false,
        message:
          "You have exhausted your free trial for today. Come back tomorrow or subscribe to premium.",
      });
    }
    user.trialUsage.count += 1;
  }

  await user.save();
  next();
};
