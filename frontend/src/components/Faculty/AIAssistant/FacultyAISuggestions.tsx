import { Sparkles } from "lucide-react";

type Props = {
  items: { id: string; text: string }[];
  onPick: (text: string) => void;
};

export default function FacultyAISuggestions({ items, onPick }: Props) {
  return (
    <div className="faculty-ai-suggestions mt-4">
      <div className="row g-3">
        {items.map((s) => (
          <div key={s.id} className="col-12 col-md-6">
            <button
              type="button"
              className="faculty-ai-suggest-card w-100 text-start"
              onClick={() => onPick(s.text)}
            >
              <span className="faculty-ai-suggest-ic">
                <Sparkles size={18} />
              </span>
              <span className="faculty-ai-suggest-text">{s.text}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
