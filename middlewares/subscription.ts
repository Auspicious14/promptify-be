import { Request, Response, NextFunction } from "express";

export const checkSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    (req as any).user.subscription.plan !== "premium" ||
    (req as any).user.subscription.status !== "active"
  ) {
    res.status(403).json({
      error: "Premium subscription required for this feature",
    });
  }
  next();
};
