import express from "express";
import { getPrompts, refinePromptWithAI } from "../controllers/prompt";
import { authenticateToken } from "../middlewares/auth";
import { checkTrialLimit } from "../middlewares/usage";
const router = express.Router();

router.post(
  "/refine-prompt",
  authenticateToken,
  checkTrialLimit,
  refinePromptWithAI
);
router.get("/get-prompts", authenticateToken, getPrompts);

export default router;
