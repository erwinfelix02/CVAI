import { Mail, CheckCircle2, Archive, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EnrollmentItem } from "./types";

type Props = {
  items: EnrollmentItem[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSendCredentialsOne: (enrollmentId: string) => void;
  onArchiveOne: (enrollmentId: string) => void | Promise<void>;
  onDeleteOne: (enrollmentId: string) => void | Promise<void>;
};

export default function EnrolledStudentsList({
  items,
  loading,
  selectedIds,
  onToggleSelect,
  onSendCredentialsOne,
  onArchiveOne,
  onDeleteOne,
}: Props) {
  const [confirmOpenId, setConfirmOpenId] = useState<string | null>(null);
  const [archiveConfirmOpenId, setArchiveConfirmOpenId] = useState<string | null>(
    null,
  );

  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const deletingRef = useRef(false);
  const archivingRef = useRef(false);

  useEffect(() => {
    if (!confirmOpenId && !archiveConfirmOpenId) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (confirmOpenId && !deleting) {
        setConfirmOpenId(null);
      }

      if (archiveConfirmOpenId && !archiving) {
        setArchiveConfirmOpenId(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpenId, archiveConfirmOpenId, deleting, archiving]);

  const handleConfirmDelete = async (enrollmentId: string) => {
    if (deletingRef.current) return;

    deletingRef.current = true;
    setDeleting(true);

    try {
      await onDeleteOne(enrollmentId);
      setConfirmOpenId(null);
    } finally {
      setDeleting(false);
      deletingRef.current = false;
    }
  };

  const handleConfirmArchive = async (enrollmentId: string) => {
    if (archivingRef.current) return;

    archivingRef.current = true;
    setArchiving(true);

    try {
      await onArchiveOne(enrollmentId);
      setArchiveConfirmOpenId(null);
    } finally {
      setArchiving(false);
      archivingRef.current = false;
    }
  };

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
                      className="enrolled-icon-btn enrolled-icon-btn-primary"
                      onClick={() => onSendCredentialsOne(s._id)}
                      aria-label={`Send credentials to ${fullName}`}
                      title="Send Credentials"
                    >
                      <Mail size={18} />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="enrolled-icon-btn enrolled-icon-btn-success"
                        disabled
                        aria-label="Credentials sent"
                        title="Credentials Sent"
                      >
                        <CheckCircle2 size={18} />
                      </button>

                      <button
                        type="button"
                        className="enrolled-icon-btn"
                        onClick={() => setArchiveConfirmOpenId(s._id)}
                        aria-label={`Archive ${fullName}`}
                        title="Archive"
                        disabled={archiving}
                      >
                        <Archive size={18} />
                      </button>

                      <button
                        type="button"
                        className="enrolled-icon-btn enrolled-icon-btn-danger"
                        onClick={() => setConfirmOpenId(s._id)}
                        aria-label={`Delete ${fullName}`}
                        title="Delete"
                        disabled={deleting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>

                {archiveConfirmOpenId === s._id && (
                  <div
                    className="sec-confirm-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm Archive Enrolled Student"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget && !archiving) {
                        setArchiveConfirmOpenId(null);
                      }
                    }}
                  >
                    <div
                      className="sec-confirm-popup"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="sec-confirm-header d-flex align-items-center justify-content-between">
                        <span>Confirm Archive</span>
                        <button
                          type="button"
                          className="enrolled-icon-btn enrolled-icon-btn-sm"
                          onClick={() => setArchiveConfirmOpenId(null)}
                          disabled={archiving}
                          aria-label="Close"
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="sec-confirm-body">
                        <div className="fw-bold mb-1">
                          Archive this enrolled student?
                        </div>
                        <div className="text-muted small">
                          You can restore it later from archived records.
                        </div>

                        <div className="mt-3 small">
                          <div>
                            <span className="text-muted">Student:</span>{" "}
                            <span className="fw-semibold">{fullName}</span>
                          </div>
                          <div>
                            <span className="text-muted">Student ID:</span>{" "}
                            <span className="fw-semibold">
                              {s.studentIdNumber?.trim()
                                ? s.studentIdNumber
                                : s.registrationId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sec-confirm-footer">
                        <button
                          className="btn btn-light"
                          onClick={() => setArchiveConfirmOpenId(null)}
                          disabled={archiving}
                          type="button"
                        >
                          Cancel
                        </button>

                        <button
                          className="btn btn-secondary"
                          onClick={() => handleConfirmArchive(s._id)}
                          disabled={archiving}
                          type="button"
                        >
                          {archiving ? "Archiving..." : "Yes, Archive"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {confirmOpenId === s._id && (
                  <div
                    className="sec-confirm-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm Delete Enrolled Student"
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget && !deleting) {
                        setConfirmOpenId(null);
                      }
                    }}
                  >
                    <div
                      className="sec-confirm-popup"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="sec-confirm-header d-flex align-items-center justify-content-between">
                        <span>Confirm Delete</span>
                        <button
                          type="button"
                          className="enrolled-icon-btn enrolled-icon-btn-sm"
                          onClick={() => setConfirmOpenId(null)}
                          disabled={deleting}
                          aria-label="Close"
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="sec-confirm-body">
                        <div className="fw-bold mb-1">
                          Delete this enrolled student?
                        </div>
                        <div className="text-muted small">
                          This action cannot be undone.
                        </div>

                        <div className="mt-3 small">
                          <div>
                            <span className="text-muted">Student:</span>{" "}
                            <span className="fw-semibold">{fullName}</span>
                          </div>
                          <div>
                            <span className="text-muted">Student ID:</span>{" "}
                            <span className="fw-semibold">
                              {s.studentIdNumber?.trim()
                                ? s.studentIdNumber
                                : s.registrationId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sec-confirm-footer">
                        <button
                          className="btn btn-light"
                          onClick={() => setConfirmOpenId(null)}
                          disabled={deleting}
                          type="button"
                        >
                          Cancel
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => handleConfirmDelete(s._id)}
                          disabled={deleting}
                          type="button"
                        >
                          {deleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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