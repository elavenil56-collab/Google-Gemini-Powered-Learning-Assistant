import { useState } from "react";

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // { questionIndex: selectedOptionIndex }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setFinished(false);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numberOfQuestions: count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setQuestions(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectOption(qIndex, optIndex) {
    if (answers[qIndex] !== undefined) return; // already answered
    setAnswers((prev) => {
      const next = { ...prev, [qIndex]: optIndex };
      // Auto-finish when all answered
      if (Object.keys(next).length === questions.length) {
        setTimeout(() => setFinished(true), 400);
      }
      return next;
    });
  }

  const score = Object.entries(answers).reduce(
    (acc, [qi, oi]) => acc + (questions[qi]?.correctAnswer === oi ? 1 : 0),
    0
  );

  return (
    <div>
      {/* ── Setup ────────────────────────── */}
      <form className="quiz-setup" onSubmit={handleGenerate}>
        <div style={{ flex: 1 }}>
          <label htmlFor="qtopic">Topic</label>
          <input
            id="qtopic"
            placeholder="e.g. World War II, React Hooks, Cell Biology…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="qcount">Questions</label>
          <select
            id="qcount"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[3, 5, 7, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <button className="btn" disabled={loading || !topic.trim()}>
          {loading ? "Generating…" : "Generate Quiz"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading" style={{ justifyContent: "center" }}>
          <span /><span /><span />
        </div>
      )}

      {/* ── Questions ────────────────────── */}
      {questions.map((q, qi) => {
        const answered = answers[qi] !== undefined;
        return (
          <div key={qi} className="quiz-card">
            <h3>
              Q{qi + 1}. {q.question}
            </h3>
            <div className="options">
              {q.options.map((opt, oi) => {
                let cls = "option-btn";
                if (answered) {
                  if (oi === q.correctAnswer) cls += " correct";
                  else if (oi === answers[qi]) cls += " wrong";
                }
                return (
                  <button
                    key={oi}
                    className={cls}
                    disabled={answered}
                    onClick={() => selectOption(qi, oi)}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
            {answered && q.explanation && (
              <div className="explanation">💡 {q.explanation}</div>
            )}
          </div>
        );
      })}

      {/* ── Score ─────────────────────────── */}
      {finished && (
        <div className="quiz-score">
          <p>Your score</p>
          <div className="score">
            {score} / {questions.length}
          </div>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {score === questions.length
              ? "🎉 Perfect!"
              : score >= questions.length * 0.7
                ? "👏 Great job!"
                : "Keep studying — you'll get there!"}
          </p>
          <button
            className="btn"
            style={{ marginTop: "1rem" }}
            onClick={() => {
              setQuestions([]);
              setAnswers({});
              setFinished(false);
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
