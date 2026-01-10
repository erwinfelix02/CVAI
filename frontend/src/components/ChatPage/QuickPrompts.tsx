import { useMemo } from "react";
import "../../styles/quickprompts.css";

const PROMPTS = [
  "How do I enroll in courses?",
  "What are the library hours?",
  "Where can I find scholarship info?",
  "How do I contact my advisor?",
  "How do I reset my portal password?",
  "Where is the registrar’s office?",
  "How do I request documents?",
  "What are the payment options?",
];

export default function QuickPrompts() {
  const visiblePrompts = useMemo(() => {
    const shuffled = [...PROMPTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  return (
    <div className="quick-prompts">
      {visiblePrompts.map((text, index) => (
        <button key={index} className="prompt">
          ✨ {text}
        </button>
      ))}
    </div>
  );
}
