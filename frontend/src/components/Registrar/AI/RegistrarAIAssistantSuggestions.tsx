import { Sparkles } from "lucide-react";

const suggestions = [
  "How many pending applications today?",
  "Show enrollment statistics this semester",
  "Generate student report summary",
  "List students with incomplete requirements",
  "When is enrollment deadline?",
  "Export faculty account report",
];

export default function RegistrarAIAssistantSuggestions({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="registrar-ai-suggestions mt-4">
      <div className="row g-3">
        {suggestions.map((text) => (
          <div key={text} className="col-12 col-sm-6">
            <button
              type="button"
              className="registrar-ai-suggestion-btn"
              onClick={() => onPick(text)}
            >
              <span className="registrar-ai-suggestion-icon">
                <Sparkles size={18} />
              </span>
              <span className="registrar-ai-suggestion-text">{text}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
