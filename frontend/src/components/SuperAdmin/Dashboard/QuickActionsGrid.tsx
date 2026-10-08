import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: string;
};

type Props = {
  title: string;
  items: QuickAction[];
};

export default function QuickActionsGrid({ title, items }: Props) {
  return (
    <div className="card shadow-sm superadmin-card">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="row g-3">
          {items.map((it) => {
            const Icon = it.icon;

            return (
              <div key={it.label} className="col-12 col-sm-6 col-lg-3">
                <Link to={it.to} className="superadmin-qa position-relative">
                  {/* ✅ badge floats and DOES NOT change layout */}
                  {it.badge && (
                    <span className="superadmin-qa-badge">{it.badge}</span>
                  )}

                  <div className="superadmin-qa-ic">
                    <Icon size={18} />
                  </div>

                  <div className="fw-semibold text-center">{it.label}</div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
