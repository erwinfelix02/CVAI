// ✅ src/components/DepartmentHead/HelpSupport/FAQCard.tsx

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCardProps {
  items: FAQItem[];
}

export default function FAQCard({
  items,
}: FAQCardProps) {
  const [openId, setOpenId] = useState<number | null>(
    null
  );

  const handleToggle = (id: number) => {
    setOpenId((currentId) =>
      currentId === id ? null : id
    );
  };

  return (
    <section className="faq-card">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="faq-card-header">
        <h2>Frequently Asked Questions</h2>
      </div>

      {/* ===================================================
          QUESTIONS
          =================================================== */}

      <div className="faq-list">
        {items.map((item) => {
          const isOpen = openId === item.id;

          return (
            <div
              className={`faq-item ${
                isOpen ? "faq-item-open" : ""
              }`}
              key={item.id}
            >
              <button
                type="button"
                className="faq-question"
                onClick={() =>
                  handleToggle(item.id)
                }
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">
                  {item.question}
                </span>

                <ChevronDown
                  size={19}
                  strokeWidth={1.8}
                  className={`faq-chevron ${
                    isOpen
                      ? "faq-chevron-open"
                      : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}