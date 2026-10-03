import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// --------------- middleware ---------------
app.use(cors());
app.use(express.json({ limit: "50kb" }));

// 30 requests per minute per IP
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — please wait a moment." },
  })
);

// --------------- routes ---------------
app.use("/api", aiRoutes);

// Health-check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --------------- error handler ---------------
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

export default app;
