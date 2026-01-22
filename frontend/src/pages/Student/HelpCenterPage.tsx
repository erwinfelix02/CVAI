import { useMemo, useState } from "react";
import HelpCategoryGrid, { type HelpCategory } from "../../components/Student/Help/HelpCategoryGrid";
import HelpRequestForm, { type HelpRequestPayload } from "../../components/Student/Help/HelpRequestForm";
import "../../styles/student-help.css";

import {
  Settings,
  MessageSquareText,
  BookOpen,
  FileText,
  CreditCard,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

export default function HelpCenterPage() {
  const categories: HelpCategory[] = useMemo(
    () => [
      {
        key: "account",
        title: "Account Issues",
        description: "Login problems, password reset, profile updates",
        icon: Settings,
        tone: "primary",
      },
      {
        key: "technical",
        title: "Technical Problem",
        description: "System errors, bugs, or performance issues",
        icon: MessageSquareText,
        tone: "danger",
      },
      {
        key: "enrollment",
        title: "Enrollment & Registration",
        description: "Course registration, section changes, prerequisites",
        icon: BookOpen,
        tone: "success",
      },
      {
        key: "grades",
        title: "Grades & Academic Records",
        description: "Grade inquiries, transcripts, academic standing",
        icon: FileText,
        tone: "purple",
      },
      {
        key: "payments",
        title: "Payment & Billing",
        description: "Tuition fees, payment plans, refunds",
        icon: CreditCard,
        tone: "warning",
      },
      {
        key: "other",
        title: "Other Concerns",
        description: "General inquiries and other support needs",
        icon: HelpCircle,
        tone: "gray",
      },
    ],
    []
  );

  const [selected, setSelected] = useState<HelpCategory | null>(null);

  const handleSubmit = async (payload: HelpRequestPayload) => {
    console.log("Submit request:", payload);
    setSelected(null);
  };

  return (
    <div className="student-help-page">
      <div className="student-help-shell">
        {/* Header */}
        <div className="help-header mb-3">
          {/* Back button LEFT (only show when selected) */}
          {selected && (
            <button
              type="button"
              className="btn btn-light border d-inline-flex align-items-center gap-2 mb-2"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          <div>
            <h2 className="fw-bold mb-1">
              {selected ? "Submit a Request" : "Help Center"}
            </h2>

            <p className="text-muted mb-0">
              {selected
                ? "Provide details so we can assist you better"
                : "Select a category that best describes your concern"}
            </p>
          </div>
        </div>

        {/* Content */}
        {!selected ? (
          <HelpCategoryGrid categories={categories} onSelect={setSelected} />
        ) : (
          <HelpRequestForm category={selected} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
