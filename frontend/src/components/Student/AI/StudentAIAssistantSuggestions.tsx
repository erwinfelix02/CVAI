import { Sparkles } from "lucide-react";

const suggestions = [
  "What are my upcoming classes today?",
  "How can I request a transcript?",
  "What's my current GPA?",
  "When is the deadline for enrollment?",
  "How do I pay my tuition fees?",
  "Where is the registrar's office?",
];

export default function StudentAIAssistantSuggestions({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="student-ai-suggestions mt-4">
      <div className="row g-3">
  {suggestions.map((text) => (
    <div key={text} className="col-12 col-sm-6">
      <button
        type="button"
        className="student-ai-suggestion-btn"
        onClick={() => onPick(text)}
      >
        <span className="student-ai-suggestion-icon">
          <Sparkles size={18} />
        </span>
        <span className="student-ai-suggestion-text">{text}</span>
      </button>
    </div>
  ))}
</div>

    </div>
  );
}
