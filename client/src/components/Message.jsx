import Markdown from "react-markdown";

export default function Message({ role, content }) {
  return (
    <div className={`message ${role}`}>
      {role === "assistant" ? (
        <Markdown>{content}</Markdown>
      ) : (
        <span>{content}</span>
      )}
    </div>
  );
}
