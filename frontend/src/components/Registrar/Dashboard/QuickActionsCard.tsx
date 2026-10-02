import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export type QuickActionItem = {
  label: string;
  icon: LucideIcon;
  badge?: number;
  to: string;
};

type Props = {
  title: string;
  items: QuickActionItem[];
};

export default function QuickActionsCard({ title, items }: Props) {
  return (
    <div className="card shadow-sm registrar-card">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="d-flex flex-column gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link key={it.label} to={it.to} className="registrar-action-row">
                <div className="d-flex align-items-center gap-3 min-w-0">
                  <div className="registrar-action-ic">
                    <Icon size={18} />
                  </div>
                  <div className="fw-semibold text-truncate">{it.label}</div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  {typeof it.badge === "number" && (
                    <span className="registrar-chip">{it.badge}</span>
                  )}
                  <ArrowRight size={18} className="registrar-action-arrow" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
