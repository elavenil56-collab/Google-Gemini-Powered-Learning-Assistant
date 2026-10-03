import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not set. Copy server/.env.example to server/.env and add your key."
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = "gemini-3.8-flash";

const SYSTEM_INSTRUCTION = `You are a friendly and knowledgeable Learning Assistant.
Your goal is to help students understand concepts clearly.
- Give concise but thorough explanations.
- Use examples and analogies when helpful.
- Format answers with markdown (headings, bold, lists, code blocks) for readability.
- If you're unsure, say so honestly.`;

/**
 * Retry wrapper — retries on 503 (high demand) up to maxRetries times.
 */
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err.status === 503 || err.message?.includes("503");
      if (is503 && attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Model busy (503). Retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Send a free-form question to Gemini and return the text answer.
 */
export async function askQuestion(question, conversationHistory = []) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(question);
    return result.response.text();
  });
}

/**
 * Ask Gemini to explain a topic at a chosen depth.
 */
export async function explainTopic(topic, level = "intermediate") {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `Explain the following topic at a ${level} level.
Include:
1. A clear definition
2. Key concepts
3. A real-world example or analogy
4. Common misconceptions (if any)

Topic: ${topic}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * Summarise a block of text.
 */
export async function summarizeText(text, style = "bullet") {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const formatInstruction =
      style === "bullet"
        ? "Use bullet points."
        : style === "paragraph"
          ? "Write a concise paragraph."
          : "Use a numbered list of key takeaways.";

    const prompt = `Summarise the following text. ${formatInstruction}

Text:
${text}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * Generate a quiz (JSON array) from a topic.
 */
export async function generateQuiz(topic, numberOfQuestions = 5) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: `You are a quiz generator. Always respond with ONLY valid JSON — no markdown fences, no extra text.`,
    });

    const prompt = `Generate a quiz with exactly ${numberOfQuestions} multiple-choice questions about "${topic}".

Return a JSON array where each element has this shape:
{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "string"
}

correctAnswer is the 0-based index of the correct option.`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    // Strip markdown fences if the model wraps them anyway
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Gemini returned invalid JSON for the quiz. Please retry.");
    }
  });
}
