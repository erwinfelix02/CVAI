import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  {
    category: "Grades",
    question: "Why can't I grade a student?",
    answer: "Grading might be locked if the grading period deadline has passed or if the student's enrollment status is pending/withdrawn. Contact the Registrar if an override is required.",
  },
  {
    category: "Grades",
    question: "Can I edit a grade after saving?",
    answer: "Yes, you can modify grades up until final grade submission is locked by the department head. Afterward, a grade change request form must be filed.",
  },
  {
    category: "Grades",
    question: "How are remarks computed?",
    answer: "Remarks ('Passed', 'Failed', 'Incomplete') are automatically calculated based on your course passing threshold and submission of all required components.",
  },
  {
    category: "Classes & Students",
    question: "How do I add a student to my class?",
    answer: "Students must be officially registered through the enrollment portal. If they are attending auditors or added late, please submit an add/drop slip to department clearance.",
  },
  {
    category: "Classes & Students",
    question: "Can I create my own class or schedule?",
    answer: "Custom class creation is handled centrally by the scheduling office. Reach out to your dean or department coordinator for section creation requests.",
  },
  {
    category: "Classes & Students",
    question: "How do I correct a student's record?",
    answer: "Direct record modifications such as name or major adjustments must be requested via the Registrar Office support desk.",
  },
  {
    category: "Materials & Announcements",
    question: "What file types can I upload?",
    answer: "You can upload PDF documents, Word documents (.doc, .docx), PowerPoint presentations (.ppt, .pptx), spreadsheets, and common video/image formats up to 50MB per file.",
  },
  {
    category: "Materials & Announcements",
    question: "Can I schedule an announcement?",
    answer: "Yes, when drafting an announcement, select the 'Schedule for later' toggle to specify the exact date and time for publication.",
  },
  {
    category: "Materials & Announcements",
    question: "Who sees my announcements?",
    answer: "Announcements can be broadcast to your specific enrolled class sections or department-wide depending on the target audience configuration you choose.",
  },
];

interface FaqAccordionProps {
  searchQuery: string;
}

export default function FaqAccordionSection({ searchQuery }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    const q = searchQuery.toLowerCase();
    return faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group by category
  const categories = useMemo(() => {
    const map: Record<string, FaqItem[]> = {};
    filteredFaqs.forEach((faq) => {
      if (!map[faq.category]) map[faq.category] = [];
      map[faq.category].push(faq);
    });
    return map;
  }, [filteredFaqs]);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      {Object.keys(categories).length === 0 ? (
        <div className="text-center text-muted py-4">
          <p className="mb-0">No matching help topics or FAQs found.</p>
        </div>
      ) : (
        Object.entries(categories).map(([catName, items], catIdx) => (
          <div key={catIdx} className={catIdx > 0 ? "mt-4 pt-3 border-top" : ""}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <h5 className="fw-bold mb-0">{catName}</h5>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2">
                {items.length}
              </span>
            </div>

            <div className="accordion-custom">
              {items.map((item, idx) => {
                const globalKey = `${catName}-${idx}`;
                const isOpen = openIndex === hashString(globalKey);

                return (
                  <div
                    key={idx}
                    className="border rounded-3 mb-2 overflow-hidden bg-white shadow-none"
                  >
                    <button
                      type="button"
                      className="w-100 d-flex justify-content-between align-items-center p-3 text-start bg-transparent border-0 fw-semibold"
                      onClick={() =>
                        setOpenIndex(isOpen ? null : hashString(globalKey))
                      }
                    >
                      <span>{item.question}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 text-muted small border-top pt-2 bg-light-subtle">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Simple hash helper for accordion index tracking
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}