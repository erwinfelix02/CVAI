// ✅ src/components/DepartmentHead/Dashboard/RecentAssignmentsCard.tsx

import type { ElementType } from "react";
import { CalendarDays } from "lucide-react";

export type AssignmentRow = {
  subject: string;
  instructor: string;
  room: string;
  schedule: string;
};

interface RecentAssignmentsCardProps {
  title: string;
  actionLabel: string;
  actionIcon: ElementType;
  rows: AssignmentRow[];
}

export default function RecentAssignmentsCard({
  title,
  actionLabel,
  actionIcon: ActionIcon,
  rows,
}: RecentAssignmentsCardProps) {
  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
          <h5 className="fw-bold mb-0">{title}</h5>

          {rows.length > 0 && (
            <button
              type="button"
              className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2 flex-shrink-0"
            >
              {actionLabel}
              <ActionIcon size={18} />
            </button>
          )}
        </div>

        {/* ASSIGNMENTS TABLE OR EMPTY STATE */}
        {rows.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Instructor</th>
                  <th scope="col">Room</th>
                  <th scope="col">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={`${r.subject}-${idx}`}>
                    <td className="fw-semibold text-dark">{r.subject}</td>
                    <td className="text-muted">{r.instructor}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {r.room}
                      </span>
                    </td>
                    <td className="text-muted small">{r.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <div className="bg-light d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-2">
              <CalendarDays size={30} className="text-secondary" />
            </div>
            <h6 className="fw-semibold mb-1 text-dark">No Recent Assignments</h6>
            <p className="small text-muted mb-0">
              There are no recent schedule or room assignments recorded for this department.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}