// src/pages/SuperAdmin/AIKnowledgeCategoryPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";

import CategoryHeader from "../../components/SuperAdmin/Knowledge/CategoryHeader";
import FaqSearch from "../../components/SuperAdmin/Knowledge/FaqSearch";
import FaqList from "../../components/SuperAdmin/Knowledge/FaqList";
import type { FaqItem } from "../../components/SuperAdmin/Knowledge/types";

import "../../styles/superadmin-knowledge.css";

export default function AIKnowledgeCategoryPage() {
  const nav = useNavigate();
  const { categoryId } = useParams();

  const [query, setQuery] = useState("");

  // ✅ seed FAQs (replace with API later)
  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: "faq-1",
        question: "How do I enroll in a course?",
        answer:
          "Go to Enrollment > Select your subjects > Review your schedule > Submit your enrollment request. Wait for registrar approval.",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.question.toLowerCase().includes(q));
  }, [faqs, query]);

  // For your screenshot, Enrollment is the example:
  const title = categoryId ? categoryId[0].toUpperCase() + categoryId.slice(1) : "Category";
  const subtitle = "Registration and enrollment process";

  return (
    <div className="superadmin-kb">
      <div className="superadmin-kb-narrow">
        <CategoryHeader
          title={title}
          subtitle={subtitle}
          icon={GraduationCap}
          onBack={() => nav(-1)}
          right={
            <button className="btn btn-primary superadmin-kb-addbtn">
              <Plus size={18} className="me-2" />
              Add FAQ
            </button>
          }
        />

        <div className="mt-3">
          <FaqSearch query={query} setQuery={setQuery} />
        </div>

        <div className="mt-3">
          <FaqList
            items={filtered}
            onEdit={(id) => alert(`Edit ${id}`)}
            onDelete={(id) => alert(`Delete ${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
