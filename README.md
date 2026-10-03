# 🎓 Gemini Learning Assistant

A full-stack AI-powered learning assistant built with **React + Vite** on the frontend, **Node.js + Express** on the backend, and **Google Gemini** as the AI engine.

## Features

| Feature | Endpoint | Description |
|---------|----------|-------------|
| 💬 Ask | `POST /api/ask` | Free-form Q&A with conversation history |
| 📖 Explain | `POST /api/explain` | Topic explanations at beginner / intermediate / advanced level |
| 📝 Summarize | `POST /api/summarize` | Summarize pasted text as bullets, paragraph, or key takeaways |
| 🧩 Quiz | `POST /api/quiz` | Auto-generate interactive multiple-choice quizzes |

## Architecture

```
Student → React UI → Express REST API → Gemini Service → Google Gemini API
                                                      ↓
                                              AI Response → React UI
```

The Gemini API key lives **only on the backend** — it is never exposed to the browser.

## Prerequisites

- **Node.js 18+** and **npm**
- A **Google Gemini API key** — get one free at <https://aistudio.google.com/app/apikey>

## Quick Start

```bash
# 1. Clone / enter the project
cd gemini-learning-assistant

# 2. Install all dependencies (root + server + client)
npm run install:all

# 3. Create the server .env file
cp server/.env.example server/.env
# Then open server/.env and paste your GEMINI_API_KEY

# 4. Start both server & client in dev mode
npm run dev
```

The React app opens at **http://localhost:5173** and proxies API calls to the Express server on port **3001**.

## Project Structure

```
gemini-learning-assistant/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx     # Conversational Q&A
│   │   │   ├── Message.jsx  # Single chat bubble (Markdown)
│   │   │   └── Quiz.jsx     # Interactive quiz generator
│   │   ├── App.jsx          # Tab navigation + Explain/Summarize panels
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles (dark theme)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Dev proxy → localhost:3001
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── aiRoutes.js  # REST endpoints
│   │   ├── services/
│   │   │   └── geminiService.js  # Gemini SDK wrapper
│   │   ├── app.js           # Express app (CORS, rate-limit, error handler)
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json             # Root scripts (concurrently)
```

## API Reference

All endpoints accept and return JSON.

### `POST /api/ask`
```json
{ "question": "What is recursion?", "history": [] }
→ { "answer": "Recursion is…" }
```

### `POST /api/explain`
```json
{ "topic": "Binary Search", "level": "beginner" }
→ { "explanation": "…" }
```

### `POST /api/summarize`
```json
{ "text": "Long article…", "style": "bullet" }
→ { "summary": "• …" }
```

### `POST /api/quiz`
```json
{ "topic": "Photosynthesis", "numberOfQuestions": 5 }
→ { "quiz": [{ "question": "…", "options": [], "correctAnswer": 0, "explanation": "…" }] }
```

### `GET /api/health`
```json
→ { "status": "ok" }
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | **Required.** Your Google Gemini API key |
| `PORT` | `3001` | Express server port |
| `NODE_ENV` | `development` | Set to `production` to hide error details |

## VS Code Setup

Recommended extensions:
- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **ES7+ React snippets** — `dsznajder.es7-react-js-snippets`

A minimal `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Production Build

```bash
cd client && npm run build   # outputs to client/dist/
```

Serve `client/dist` with Express, Nginx, or any static host.

## License

MIT
