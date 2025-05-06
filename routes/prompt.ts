import express from "express";
import { getPrompts, refinePromptWithAI } from "../controllers/prompt";
import { authenticateToken } from "../middlewares/auth";
const router = express.Router();

router.post("/refine-prompt", authenticateToken, refinePromptWithAI);
router.get("/get-prompts", authenticateToken, getPrompts);

export default router;
