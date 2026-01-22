import { Send } from "lucide-react";

export default function StudentAIAssistantInput({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string) => void;
}) {
  const submit = () => {
    const t = value.trim();
    if (!t) return;
    onSend(t);
    onChange(""); // clear
  };

  return (
    <div className="student-ai-input-wrap">
      <input
        className="student-ai-input form-control"
        placeholder="Ask me anything about your campus..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <button
        type="button"
        className="student-ai-send-btn"
        onClick={submit}
        aria-label="Send"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
