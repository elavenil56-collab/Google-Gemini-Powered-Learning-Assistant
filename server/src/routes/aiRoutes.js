import { Router } from "express";
import {
  askQuestion,
  explainTopic,
  summarizeText,
  generateQuiz,
} from "../services/geminiService.js";

const router = Router();

// ---------- helpers ----------
function validate(fields, body) {
  for (const f of fields) {
    if (!body[f] || (typeof body[f] === "string" && !body[f].trim())) {
      return `"${f}" is required.`;
    }
  }
  return null;
}

// ---------- POST /api/ask ----------
router.post("/ask", async (req, res, next) => {
  try {
    const err = validate(["question"], req.body);
    if (err) return res.status(400).json({ error: err });

    const { question, history = [] } = req.body;
    const answer = await askQuestion(question, history);
    res.json({ answer });
  } catch (e) {
    next(e);
  }
});

// ---------- POST /api/explain ----------
router.post("/explain", async (req, res, next) => {
  try {
    const err = validate(["topic"], req.body);
    if (err) return res.status(400).json({ error: err });

    const { topic, level } = req.body;
    const explanation = await explainTopic(topic, level);
    res.json({ explanation });
  } catch (e) {
    next(e);
  }
});

// ---------- POST /api/summarize ----------
router.post("/summarize", async (req, res, next) => {
  try {
    const err = validate(["text"], req.body);
    if (err) return res.status(400).json({ error: err });

    const { text, style } = req.body;
    const summary = await summarizeText(text, style);
    res.json({ summary });
  } catch (e) {
    next(e);
  }
});

// ---------- POST /api/quiz ----------
router.post("/quiz", async (req, res, next) => {
  try {
    const err = validate(["topic"], req.body);
    if (err) return res.status(400).json({ error: err });

    const { topic, numberOfQuestions } = req.body;
    const quiz = await generateQuiz(topic, numberOfQuestions);
    res.json({ quiz });
  } catch (e) {
    next(e);
  }
});

export default router;
