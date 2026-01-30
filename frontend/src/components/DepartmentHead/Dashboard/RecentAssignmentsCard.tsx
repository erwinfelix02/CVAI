// ✅ src/components/DepartmentHead/Dashboard/RecentAssignmentsCard.tsx
import type { LucideIcon } from "lucide-react";

export type AssignmentRow = {
  subject: string;
  instructor: string;
  room: string;
  schedule: string;
};

export default function RecentAssignmentsCard({
  title,
  actionLabel,
  actionIcon: ActionIcon,
  rows,
}: {
  title: string;
  actionLabel: string;
  actionIcon: LucideIcon;
  rows: AssignmentRow[];
}) {
  return (
    <div className="card shadow-sm rounded-4">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2">
            {actionLabel} <ActionIcon size={18} />
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {rows.map((r) => (
            <div
              key={r.subject}
              className="rounded-4 bg-body-tertiary p-3 d-flex align-items-center justify-content-between gap-3"
            >
              <div>
                <div className="fw-semibold">{r.subject}</div>
                <div className="text-muted">{r.instructor}</div>
              </div>

              <div className="text-end">
                <div className="fw-semibold">{r.room}</div>
                <div className="text-muted small">{r.schedule}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
