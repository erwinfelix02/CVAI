import { useState } from "react";
import { ClipboardCheck, Archive } from "lucide-react";
import type { EnrollmentItem } from "./types";
import ArchivedEvaluationsModal from "./ArchivedEvaluationsModal";

type Props = {
  items: EnrollmentItem[];
  loading: boolean;
  titleCount: number;
  onEvaluate: (item: EnrollmentItem) => void;
  onArchive: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onDeleteArchived?: (id: string) => Promise<void>;
  fetchArchived: () => Promise<EnrollmentItem[]>;
};

export default function PendingEnrollmentList({
  items,
  loading,
  titleCount,
  onEvaluate,
  onArchive,
  onRestore,
  onDeleteArchived,
  fetchArchived,
}: Props) {
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const hasItems = items.length > 0;

  return (
    <>
      <div className="card shadow-sm enroll-card">
        <div className="card-body">
          {/* Header with Styled Archive Modal Trigger Button */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <ClipboardCheck size={18} />
              Pending Evaluation ({titleCount})
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-light border d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold text-dark shadow-sm transition-all hover-shadow"
              style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
              onClick={() => setArchiveModalOpen(true)}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded-circle"
                style={{ width: 22, height: 22 }}
              >
                <Archive size={13} />
              </div>
              <span>View Archives</span>
            </button>
          </div>

          {/* PENDING LIST VIEW */}
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
                  <div key={s._id} className="enroll-student-row d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <div className="enroll-avatar flex-shrink-0">{initials}</div>

                      <div className="min-w-0">
                        <div className="fw-semibold text-truncate">{fullName}</div>
                        <div className="text-muted small">{s.registrationId}</div>
                        {programLine ? (
                          <div className="text-muted small text-truncate">{programLine}</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning text-dark border d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-3 shadow-none bg-white"
                        title="Archive Evaluation"
                        onClick={() => onArchive(s._id)}
                      >
                        <Archive size={15} />
                        <span className="d-none d-sm-inline">Archive</span>
                      </button>

                      <button
                        type="button"
                        className="btn enroll-eval-btn d-flex align-items-center gap-1 py-1.5 shadow-none"
                        onClick={() => onEvaluate(s)}
                      >
                        <ClipboardCheck size={16} />
                        Evaluate
                      </button>
                    </div>
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

      {/* Archived Evaluations Blur Backdrop Modal */}
      <ArchivedEvaluationsModal
        open={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        fetchArchived={fetchArchived}
        onRestore={onRestore}
        onDeleteArchived={onDeleteArchived}
      />
    </>
  );
}