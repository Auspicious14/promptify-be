import { Request, Response } from "express";
import { userModel } from "../../models/user";

export const getTrialUsage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Unauthorised" });
    }

    if (user?.subscription?.plan === "premium") {
      return res.json({ success: true, message: "Unlimited" });
    }

    const today = new Date().toDateString();
    const lastUsed = user?.trialUsage?.lastUsed?.toDateString();

    let count = user?.trialUsage?.count || 0;

    if (today !== lastUsed) {
      // Reset for new day
      user.trialUsage = { count: 0, lastUsed: new Date() };
      await user.save();
      count = 0;
    }

    return res.json({
      success: true,
      unlimited: false,
      remaining: 3 - count,
      used: count,
    });
  } catch (err) {
    console.error("Error checking trial usage", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const resetAllTrialUsage = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Reset trial usage for free users whose lastUsed is before today
    const resetResult = await userModel.updateMany(
      {
        $and: [
          {
            $or: [
              { "subscription.plan": "free" },
              { "subscription.plan": { $exists: false } },
            ],
          },
          {
            $or: [
              { "trialUsage.lastUsed": { $lt: today } },
              { "trialUsage.lastUsed": { $exists: false } },
            ],
          },
        ],
      },
      {
        $set: {
          "trialUsage.count": 0,
          "trialUsage.lastUsed": new Date(),
        },
      }
    );

    console.log(`Trial usage reset for ${resetResult.modifiedCount} users`);
    
    return resetResult;
  } catch (err) {
    console.error("Error resetting trial usage for users", err);
    throw err;
  }
};
