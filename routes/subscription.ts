import express from "express";
import {
  initializeSubscription,
  verifyPayment,
  handleWebhook,
} from "../controllers/subscription";
import { authenticateToken } from "../middlewares/auth";
import { checkSubscription } from "../middlewares/subscription";

const router = express.Router();

router.post("/initialize", authenticateToken, initializeSubscription);
router.get("/verify/:reference", authenticateToken, verifyPayment);
router.post("/webhook", handleWebhook);
router.get("/upgrade", authenticateToken, checkSubscription, (req, res) => {
  res.json({ premiumFeatures: ["advanced-prompting", "priority-support"] });
});

export default router;