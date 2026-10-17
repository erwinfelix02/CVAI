import { ArrowRight, Users } from "lucide-react";

export type SectionAssignmentRow = {
  student: string;
  studentNo: string;
  section: string;
  assignedDate: string;
};

interface RecentSectionAssignmentsCardProps {
  title: string;
  actionLabel?: string;
  onViewStudentsClick?: () => void;
  rows: SectionAssignmentRow[];
}

export default function RecentSectionAssignmentsCard({
  title,
  actionLabel = "View Students",
  onViewStudentsClick,
  rows,
}: RecentSectionAssignmentsCardProps) {
  return (
    <div className="card shadow-sm rounded-4 h-100 border-0">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0 text-dark">{title}</h5>
          {onViewStudentsClick && (
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 fw-medium small d-inline-flex align-items-center gap-1"
              onClick={onViewStudentsClick}
            >
              <span>{actionLabel}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {rows.length > 0 ? (
          <div
            className="d-flex flex-column gap-3"
            style={{ maxHeight: "250px", overflowY: "auto", scrollbarWidth: "thin" }}
          >
            {rows.map((r, idx) => (
              <div key={`${r.studentNo}-${idx}`} className="p-3 border rounded-3 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-dark">{r.student}</span>
                  <span className="badge bg-primary-subtle text-primary">{r.section}</span>
                </div>
                <div className="text-muted small mt-1">
                  {r.studentNo} · Assigned {r.assignedDate}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <div className="bg-light d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-2">
              <Users size={26} className="text-secondary" />
            </div>
            <h6 className="fw-semibold mb-1 text-dark">Recent Section Assignments</h6>
            <p className="small text-muted mb-0">No assignments recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}