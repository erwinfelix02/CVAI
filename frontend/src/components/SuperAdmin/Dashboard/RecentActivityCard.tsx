import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export type ActivityTone = "blue" | "green" | "orange";

export type ActivityRow = {
  title: string;
  subtitle: string;
  timeLabel: string;
  icon: LucideIcon;
  tone: ActivityTone;
};

type Props = {
  title: string;
  viewAllLabel: string;
  viewAllTo: string;
  rows: ActivityRow[];
  rightIcon: LucideIcon;
};

export default function RecentActivityCard({
  title,
  viewAllLabel,
  viewAllTo,
  rows,
  rightIcon: RightIcon,
}: Props) {
  return (
    <div className="card shadow-sm superadmin-card h-100">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>

          <Link to={viewAllTo} className="superadmin-link d-inline-flex align-items-center gap-2">
            {viewAllLabel} <RightIcon size={18} />
          </Link>
        </div>

        <div className="d-flex flex-column gap-3">
          {rows.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={`${r.title}-${idx}`} className="superadmin-activity-row">
                <div className="d-flex align-items-center gap-3 min-w-0">
                  <div className={`superadmin-activity-ic ${r.tone}`}>
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">{r.title}</div>
                    <div className="text-muted small text-truncate">{r.subtitle}</div>
                  </div>
                </div>

                <div className="text-muted small d-flex align-items-center gap-2">
                  <span className="superadmin-time-dot">•</span>
                  <span>{r.timeLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
