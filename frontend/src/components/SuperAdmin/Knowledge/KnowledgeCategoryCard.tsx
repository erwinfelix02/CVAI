import { MessageCircle } from "lucide-react";
import type { KbCategory } from "./types";

export default function KnowledgeCategoryCard({
  category,
}: {
  category: KbCategory;
}) {
  const Icon = category.icon || MessageCircle;

  return (
    <div
      className={`superadmin-kb-cat card shadow-sm tone-${
        category.tone || "slate"
      }`}
    >
      <div className="card-body p-3 p-md-4">
        <div className="superadmin-kb-cat-top d-flex align-items-start justify-content-between gap-3">
          <div className="superadmin-kb-cat-ic">
            <Icon size={22} />
          </div>

          <div className="superadmin-kb-count text-muted small">
            {category.count} {category.count === 1 ? "item" : "items"}
          </div>
        </div>

        <div className="mt-2">
          <div className="fw-bold superadmin-kb-cat-title">
            {category.title}
          </div>
          <div className="text-muted">{category.subtitle}</div>
        </div>

        <div className="superadmin-kb-progress mt-3">
          <div
            className="superadmin-kb-progress-bar"
            style={{ width: `${Math.min(100, category.count * 35)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
