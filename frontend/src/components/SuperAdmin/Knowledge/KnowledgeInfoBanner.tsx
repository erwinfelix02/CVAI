// src/components/SuperAdmin/Knowledge/KnowledgeInfoBanner.tsx
import { MessageCircle } from "lucide-react";

export default function KnowledgeInfoBanner() {
  return (
    <div className="card superadmin-kb-banner shadow-sm">
      <div className="card-body p-3 p-md-4 d-flex gap-3 align-items-start">
        <div className="superadmin-kb-banner-ic">
          <MessageCircle size={22} />
        </div>

        <div className="min-w-0">
          <div className="fw-bold mb-1">How the AI uses this information</div>
          <div className="text-muted mb-0">
            The FAQs you add become part of the AI's knowledge base. When students ask questions,
            the AI references this information to provide accurate, institution-specific answers.
          </div>
        </div>
      </div>
    </div>
  );
}
