import { useState } from "react";
import Chat from "./components/Chat";
import Quiz from "./components/Quiz";
import Markdown from "react-markdown";

const TABS = [
  { id: "chat", label: "💬 Ask" },
  { id: "explain", label: "📖 Explain" },
  { id: "summarize", label: "📝 Summarize" },
  { id: "quiz", label: "🧩 Quiz" },
];

export default function App() {
  const [tab, setTab] = useState("chat");

  return (
    <div className="app">
      <header>
        <h1>🎓 Gemini Learning Assistant</h1>
        <p>Powered by Google Gemini — ask anything, learn faster</p>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "chat" && <Chat />}
      {tab === "explain" && <ExplainPanel />}
      {tab === "summarize" && <SummarizePanel />}
      {tab === "quiz" && <Quiz />}
    </div>
  );
}

/* ─── Explain Panel ─────────────────────────── */
function ExplainPanel() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExplain(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <form onSubmit={handleExplain}>
        <label htmlFor="topic">Topic</label>
        <input
          id="topic"
          placeholder="e.g. Photosynthesis, Binary Search, Quantum Computing…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <label htmlFor="level">Depth</label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <button className="btn" disabled={loading || !topic.trim()}>
          {loading ? "Thinking…" : "Explain"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <span /><span /><span />
        </div>
      )}

      {result && (
        <div className="result">
          <Markdown>{result}</Markdown>
        </div>
      )}
    </div>
  );
}

/* ─── Summarize Panel ───────────────────────── */
function SummarizePanel() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("bullet");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarize(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <form onSubmit={handleSummarize}>
        <label htmlFor="sumtext">Paste text to summarize</label>
        <textarea
          id="sumtext"
          rows={6}
          placeholder="Paste an article, chapter, or notes here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <label htmlFor="style">Format</label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="bullet">Bullet points</option>
          <option value="paragraph">Paragraph</option>
          <option value="takeaways">Key takeaways</option>
        </select>

        <button className="btn" disabled={loading || !text.trim()}>
          {loading ? "Summarizing…" : "Summarize"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading">
          <span /><span /><span />
        </div>
      )}

      {result && (
        <div className="result">
          <Markdown>{result}</Markdown>
        </div>
      )}
    </div>
  );
}
