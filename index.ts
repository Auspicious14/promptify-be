import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
export const appRoute = express();
import authRouter from "./routes/auth";
import promptRouter from "./routes/prompt";
import subscriptionRouter from "./routes/subscription";
import { getTrialUsage, resetAllTrialUsage } from "./controllers/usage.ts";
import { Cron } from "croner";

dotenv.config();
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3002"];

console.log("CORS Allowed Origins:", allowedOrigins);

appRoute.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming origin:", origin);
      if (
        !origin ||
        allowedOrigins.some((allowed) => origin.startsWith(allowed))
      ) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["Content-Disposition"],
  })
);
console.log("ENV:", process.env.CLIENT_URL);
appRoute.use(express.json({ limit: "50mb" }));
appRoute.use(express.urlencoded({ limit: "50mb", extended: true }));
appRoute.use(cookieParser());
appRoute.get("/", (req, res) => {
  res.send("Backend is working!");
});
appRoute.use(authRouter);
appRoute.use(promptRouter);
appRoute.use(subscriptionRouter);
// Run at 3 AM when traffic is typically lowest
// Split users into batches to avoid performance impact
new Cron("0 3 * * *", async () => {
  await resetAllTrialUsage();
}).schedule();
