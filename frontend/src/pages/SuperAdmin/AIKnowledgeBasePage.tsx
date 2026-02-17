import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Sparkles } from "lucide-react";
import {
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

import "../../styles/superadmin-knowledge.css";

export default function AIKnowledgeBasePage() {
  const [categories, setCategories] = useState<any[]>([]);

  // ✅ MASTER CATEGORY LIST (ALWAYS SHOWN)
  const baseCategories = [
    {
      id: "general",
      title: "General",
      subtitle: "General inquiries and information",
      icon: MessageCircle,
      tone: "slate",
    },
    {
      id: "enrollment",
      title: "Enrollment",
      subtitle: "Registration and enrollment process",
      icon: GraduationCap,
      tone: "teal",
    },
    {
      id: "courses",
      title: "Courses",
      subtitle: "Course information and schedules",
      icon: BookOpen,
      tone: "blue",
    },
    {
      id: "fees",
      title: "Fees",
      subtitle: "Tuition, fees, and payment info",
      icon: DollarSign,
      tone: "amber",
    },
    {
      id: "campus",
      title: "Campus",
      subtitle: "Facilities and campus services",
      icon: Building2,
      tone: "mint",
    },
    {
      id: "technical",
      title: "Technical",
      subtitle: "IT support and technical help",
      icon: Wrench,
      tone: "purple",
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("http://localhost:5000/api/faqs");

      // Count FAQs per category
      const grouped = res.data.reduce((acc: any, faq: any) => {
        if (!acc[faq.category]) acc[faq.category] = 0;
        acc[faq.category]++;
        return acc;
      }, {});

      // Merge counts into base categories
      const formatted = baseCategories.map((cat) => ({
        ...cat,
        count: grouped[cat.id] || 0, // ✅ 0 if none
      }));

      setCategories(formatted);
    };

    fetchCategories();
  }, []);

  return (
    <div className="superadmin-kb">
      <KnowledgeHeader
        title="AI Knowledge Base"
        subtitle="Manage FAQs that power the AI assistant"
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
