import "../../styles/quickprompts.css";

interface QuickPromptsProps {
  collapsed: boolean;
}

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

export default function QuickPrompts({ collapsed }: QuickPromptsProps) {
  // shuffle prompts and pick 4
  const shuffled = PROMPTS.sort(() => 0.5 - Math.random());
  const visiblePrompts = shuffled.slice(0, 4);

  return (
    <div className={`quick-prompts ${collapsed ? "collapsed" : ""}`}>
      {visiblePrompts.map((text, index) => (
        <button key={index} className="prompt">
          ✨ {text}
        </button>
      ))}
    </div>
  );
}
