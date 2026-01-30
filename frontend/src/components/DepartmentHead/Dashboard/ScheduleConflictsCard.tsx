// ✅ src/components/DepartmentHead/Dashboard/ScheduleConflictsCard.tsx
import type { LucideIcon } from "lucide-react";

export type ConflictRow = {
  room: string;
  time: string;
  details: string;
};

export default function ScheduleConflictsCard({
  title,
  badgeLabel,
  badgeTone = "warning",
  icon: Icon,
  rows,
  actionLabel,
}: {
  title: string;
  badgeLabel: string;
  badgeTone?: "warning" | "danger" | "info";
  icon: LucideIcon;
  rows: ConflictRow[];
  actionLabel: string;
}) {
  const badgeClass =
    badgeTone === "danger"
      ? "text-bg-danger-subtle border border-danger-subtle"
      : badgeTone === "info"
      ? "text-bg-info-subtle border border-info-subtle"
      : "text-bg-warning-subtle border border-warning-subtle";

  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Icon size={18} />
            <h5 className="fw-bold mb-0">{title}</h5>
          </div>
          <span className={`badge rounded-pill ${badgeClass}`}>{badgeLabel}</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {rows.map((r, idx) => (
            <div
              key={idx}
              className="rounded-4 border border-warning-subtle bg-warning-subtle bg-opacity-25 p-3"
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-semibold">{r.room}</div>
                <div className="text-muted small">{r.time}</div>
              </div>
              <div className="text-muted mt-1">{r.details}</div>
            </div>
          ))}

          <button className="btn btn-light border rounded-3 mt-1">
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
