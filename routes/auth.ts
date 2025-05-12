import express from "express";
import {
  checkAuth,
  forgetPassword,
  getUser,
  login,
  resetPassword,
  signUp,
  updateUser,
  verifyOTP,
} from "../controllers/auth";
import { authenticateToken } from "../middlewares/auth";
import { getTrialUsage } from "../controllers/usage.ts";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/update/:id", updateUser);
router.get("/user/:id", getUser);
router.post("/forgetPassword", forgetPassword);
router.post("/verify", verifyOTP);
router.post("/resetPassword", resetPassword);
router.get("/auth/check", authenticateToken, checkAuth);
router.get("/trialUsage", authenticateToken, getTrialUsage);
export default router;
