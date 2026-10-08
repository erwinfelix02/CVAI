import { Send } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
};

export default function FacultyAIComposer({ value, onChange, onSend }: Props) {
  return (
    <div className="faculty-ai-composer">
      <div className="faculty-ai-inputwrap">
        <input
          className="form-control faculty-ai-input"
          placeholder="Ask me anything about your faculty tasks..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
        />

        <button
          type="button"
          className="btn faculty-ai-sendbtn"
          onClick={onSend}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
