import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqItem({ id, question, answer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rh-faq-item" id={id}>
      <button
        type="button"
        className={`rh-faq-question ${open ? "is-open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={`${id}-answer`}
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={`rh-faq-chevron ${open ? "rotate" : ""}`}
        />
      </button>

      <div
        id={`${id}-answer`}
        className={`rh-faq-answer-wrap ${open ? "open" : ""}`}
      >
        <div className="rh-faq-answer">{answer}</div>
      </div>
    </div>
  );
}