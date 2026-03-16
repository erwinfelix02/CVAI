import { Mail, CheckCircle2, Archive } from "lucide-react";
import type { EnrollmentItem } from "./types";

type Props = {
  items: EnrollmentItem[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSendCredentialsOne: (enrollmentId: string) => void;
  onArchiveOne: (enrollmentId: string) => void;
};

export default function EnrolledStudentsList({
  items,
  loading,
  selectedIds,
  onToggleSelect,
  onSendCredentialsOne,
  onArchiveOne,
}: Props) {
  return (
    <div className="d-flex flex-column gap-3">
      {loading ? (
        <div className="text-muted text-center py-4">Loading...</div>
      ) : (
        <>
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

            const credentialsSent = !!s.credentialsSent;
            const checked = selectedIds.includes(s._id);

            return (
              <div key={s._id} className="enroll-student-row enrolled-row">
                {!credentialsSent ? (
                  <button
                    type="button"
                    className={`enrolled-circle-check ${checked ? "is-checked" : ""}`}
                    onClick={() => onToggleSelect(s._id)}
                    aria-label={`Select ${fullName}`}
                  />
                ) : (
                  <div
                    className="enrolled-circle-check is-disabled"
                    aria-hidden="true"
                  />
                )}

                <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                  <div className="enroll-avatar">{initials}</div>

                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">{fullName}</div>
                    <div className="text-muted small">
                      {s.studentIdNumber?.trim()
                        ? s.studentIdNumber
                        : s.registrationId}
                    </div>
                    {programLine ? (
                      <div className="text-muted small">{programLine}</div>
                    ) : null}
                  </div>
                </div>

                <div className="enrolled-row-actions">
                  <span className="badge rounded-pill bg-success-subtle text-success border">
                    Enrolled
                  </span>

                  {!credentialsSent ? (
                    <button
                      type="button"
                      className="btn-teal"
                      onClick={() => onSendCredentialsOne(s._id)}
                    >
                      <Mail size={18} />
                      Send Credentials
                    </button>
                  ) : (
                    <>
                      <button type="button" className="btn btn-success" disabled>
                        <CheckCircle2 size={18} />
                        Credentials Sent
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onArchiveOne(s._id)}
                      >
                        <Archive size={18} />
                        Archive
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {items.length === 0 ? (
            <div className="text-muted text-center py-4">
              No enrolled students found.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}