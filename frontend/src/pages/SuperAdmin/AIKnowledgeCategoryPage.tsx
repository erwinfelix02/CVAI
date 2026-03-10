import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  GraduationCap,
  BookOpen,
  DollarSign,
  Building2,
  Wrench,
} from "lucide-react";
import AddFaqModal from "../../components/SuperAdmin/Knowledge/AddFaqModal";

import CategoryHeader from "../../components/SuperAdmin/Knowledge/CategoryHeader";
import FaqSearch from "../../components/SuperAdmin/Knowledge/FaqSearch";
import FaqList from "../../components/SuperAdmin/Knowledge/FaqList";
import type { FaqItem } from "../../components/SuperAdmin/Knowledge/types";
import axios from "axios";
import "../../styles/superadmin-knowledge.css";

const categoryMeta = {
  general: {
    title: "General",
    subtitle: "General inquiries and information",
    icon: MessageCircle,
  },
  enrollment: {
    title: "Enrollment",
    subtitle: "Registration and enrollment process",
    icon: GraduationCap,
  },
  courses: {
    title: "Courses",
    subtitle: "Course information and schedules",
    icon: BookOpen,
  },
  fees: {
    title: "Fees",
    subtitle: "Tuition, fees, and payment info",
    icon: DollarSign,
  },
  campus: {
    title: "Campus",
    subtitle: "Facilities and campus services",
    icon: Building2,
  },
  technical: {
    title: "Technical",
    subtitle: "IT support and technical help",
    icon: Wrench,
  },
} as const;

export default function AIKnowledgeCategoryPage() {
  const nav = useNavigate();
  const { categoryId } = useParams();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faqs?category=${categoryId}`,
      );

      const formatted = res.data.map((faq: any) => ({
        ...faq,
        id: faq._id,
      }));

      setFaqs(formatted);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      setFaqs([]);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [categoryId]);

  const handleEdit = (id: string) => {
    const selected = faqs.find((f: any) => f.id === id);
    setEditingFaq(selected || null);
  };

  const filtered = useMemo(() => {
    let result = [...faqs];

    if (query.trim()) {
      result = result.filter((f) =>
        f.question.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (filter === "recent") {
      result.sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    if (filter === "new") {
      result.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [faqs, query, filter]);

  const currentCategory =
    (categoryId && categoryMeta[categoryId as keyof typeof categoryMeta]) || {
      title: "Category",
      subtitle: "Knowledge base category",
      icon: GraduationCap,
    };

  return (
    <div className="superadmin-kb">
      <div className="superadmin-kb-narrow">
        <CategoryHeader
          title={currentCategory.title}
          subtitle={currentCategory.subtitle}
          icon={currentCategory.icon}
          onBack={() => nav(-1)}
          right={
            <button
              className="btn btn-primary superadmin-kb-addbtn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} className="me-2" />
              Add FAQ
            </button>
          }
        />

        <div className="mt-3">
          <FaqSearch
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
          />
        </div>

        <div className="mt-3">
          {filtered.length > 0 ? (
            <FaqList
              items={filtered}
              onEdit={(id) => handleEdit(id)}
              onDelete={async (id) => {
                await axios.delete(`http://localhost:5000/api/faqs/${id}`);
                setFaqs((prev) => prev.filter((f: any) => f.id !== id));
              }}
            />
          ) : (
            <div className="kb-empty-state">
              <div className="kb-empty-icon">📭</div>
              <h5 className="fw-semibold mb-1">No FAQs found</h5>
              <p className="text-muted mb-0">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddFaqModal
          category={categoryId || ""}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchFaqs();
            setShowModal(false);
          }}
        />
      )}

      {editingFaq && (
        <AddFaqModal
          category={categoryId || ""}
          initialData={editingFaq}
          onClose={() => setEditingFaq(null)}
          onSuccess={() => {
            fetchFaqs();
            setEditingFaq(null);
          }}
        />
      )}
    </div>
  );
}