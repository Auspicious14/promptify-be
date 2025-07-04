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

export const resetAllTrialUsage = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only update users whose lastUsed is not from today
    await userModel.updateMany(
      {
        $or: [
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
        ],
      },
      {
        $set: {
          "trialUsage.count": 0,
          "trialUsage.lastUsed": new Date(),
          // "message": "Your trial credits have been reset. Subscribe to our premium plan for unlimited access!"
        },
      }
    );

    await userModel.updateMany(
      {
        $and: [
          {
            $or: [
              { "subscription.plan": "free" },
              { "subscription.plan": { $exists: false } },
            ],
          },
          { "trialUsage.count": { $gte: 3 } },
        ],
      },
      {
        $set: {
          message:
            "You've used up your trial credits. Subscribe now to continue using our premium features!",
        },
      }
    );

    console.log("Trial usage reset for users from previous days");
  } catch (err) {
    console.error("Error resetting trial usage for users", err);
  }
};
