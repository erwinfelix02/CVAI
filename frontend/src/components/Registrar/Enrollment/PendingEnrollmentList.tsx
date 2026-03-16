import { ClipboardCheck } from "lucide-react";
import type { EnrollmentItem } from "./types";

type Props = {
  items: EnrollmentItem[];
  loading: boolean;
  titleCount: number;
  onEvaluate: (item: EnrollmentItem) => void;
};

export default function PendingEnrollmentList({
  items,
  loading,
  titleCount,
  onEvaluate,
}: Props) {
  const hasItems = items.length > 0;

  return (
    <div className="card shadow-sm enroll-card">
      <div className="card-body">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <ClipboardCheck size={18} />
          Pending Evaluation ({titleCount})
        </h5>

        {loading ? (
          <div className="text-muted text-center py-4">Loading...</div>
        ) : hasItems ? (
          <div className="d-flex flex-column gap-3">
            {items.map((s) => {
              const fullName =
                s.studentName ||
                `${s.personal?.firstName ?? ""} ${s.personal?.lastName ?? ""}`.trim() ||
                "Unknown Student";

              const initials = fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((x) => x[0]?.toUpperCase())
                .join("");

              const program = s.academic?.program?.trim();
              const yearLevel = s.academic?.yearLevel?.toString().trim();

              const programLine =
                program && yearLevel
                  ? `${program} • Year ${yearLevel}`
                  : program
                    ? program
                    : "";

              return (
                <div key={s._id} className="enroll-student-row">
                  <div className="d-flex align-items-center gap-3">
                    <div className="enroll-avatar">{initials}</div>

                    <div className="min-w-0">
                      <div className="fw-semibold">{fullName}</div>
                      <div className="text-muted small">{s.registrationId}</div>
                      {programLine ? (
                        <div className="text-muted small">{programLine}</div>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn enroll-eval-btn"
                    onClick={() => onEvaluate(s)}
                  >
                    <ClipboardCheck size={16} />
                    Evaluate
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="users-empty-state">
            <div className="users-empty-icon">📭</div>
            <h5 className="fw-semibold mb-1">No pending students</h5>
            <p className="text-muted mb-0">
              You&apos;re all caught up. Pending evaluations will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}