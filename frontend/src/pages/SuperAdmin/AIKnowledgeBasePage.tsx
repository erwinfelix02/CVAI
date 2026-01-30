import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageCircle,
  GraduationCap,
  BookOpen,
  DollarSign,
  Building2,
  Wrench,
} from "lucide-react";

import KnowledgeHeader from "../../components/SuperAdmin/Knowledge/KnowledgeHeader";
import KnowledgeInfoBanner from "../../components/SuperAdmin/Knowledge/KnowledgeInfoBanner";
import KnowledgeCategoryCard from "../../components/SuperAdmin/Knowledge/KnowledgeCategoryCard";
import type { KbCategory } from "../../components/SuperAdmin/Knowledge/types";

import "../../styles/superadmin-knowledge.css";

export default function AIKnowledgeBasePage() {
  const categories: KbCategory[] = useMemo(
    () => [
      {
        id: "general",
        title: "General",
        subtitle: "General inquiries and information",
        icon: MessageCircle,
        tone: "slate",
        count: 0,
      },
      {
        id: "enrollment",
        title: "Enrollment",
        subtitle: "Registration and enrollment process",
        icon: GraduationCap,
        tone: "teal",
        count: 1,
      },
      {
        id: "courses",
        title: "Courses",
        subtitle: "Course information and schedules",
        icon: BookOpen,
        tone: "blue",
        count: 0,
      },
      {
        id: "fees",
        title: "Fees",
        subtitle: "Tuition, fees, and payment info",
        icon: DollarSign,
        tone: "amber",
        count: 0,
      },
      {
        id: "campus",
        title: "Campus",
        subtitle: "Facilities and campus services",
        icon: Building2,
        tone: "mint",
        count: 1,
      },
      {
        id: "technical",
        title: "Technical",
        subtitle: "IT support and technical help",
        icon: Wrench,
        tone: "purple",
        count: 1,
      },
    ],
    [],
  );

  return (
    <div className="superadmin-kb">
      <KnowledgeHeader
        title="AI Knowledge Base"
        subtitle="Manage FAQs that power the AI assistant's responses"
        icon={Sparkles}
      />

      <KnowledgeInfoBanner />

      <div className="row g-3 g-md-4 mt-1">
        {categories.map((c) => (
          <div key={c.id} className="col-12 col-md-6 col-xl-4">
            <Link
              to={`/superadmin/aiknowledge/${c.id}`}
              className="text-decoration-none"
            >
              <KnowledgeCategoryCard category={c} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
