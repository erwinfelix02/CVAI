import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Mail,
  User,
  IdCard,
  Phone,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import type { StudentItem } from "./studentTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentItem[];
  onSend: (payload: {
    studentIds: string[];
    subject?: string;
    message?: string;
  }) => Promise<void> | void;
};

const DEFAULT_SUBJECT = "Your CampusHub Account Credentials";
const DEFAULT_MESSAGE =
  "Hello! Your student portal account has been created. Please use the credentials provided to log in.";

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function SendCredentialsModal({
  open,
  onClose,
  students,
  onSend,
}: Props) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Exit confirmation state
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const studentIds = useMemo(() => students.map((s) => s._id), [students]);
  const count = students.length;

  // Check if form was edited
  const isDirty = useMemo(() => {
    return subject !== DEFAULT_SUBJECT || message !== DEFAULT_MESSAGE;
  }, [subject, message]);

  // Reset values when modal opens
  useEffect(() => {
    if (!open) return;

    setSubject(DEFAULT_SUBJECT);
    setMessage(DEFAULT_MESSAGE);
    setConfirmOpen(false);
    setExitConfirmOpen(false);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Attempt close with check for dirty form
  const handleAttemptClose = () => {
    if (sending) return;

    if (isDirty) {
      setExitConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    setExitConfirmOpen(false);
    setConfirmOpen(false);
    onClose();
  };

  // Keyboard navigation & ESC key
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sending) return;

        if (exitConfirmOpen) {
          setExitConfirmOpen(false);
        } else if (confirmOpen) {
          setConfirmOpen(false);
        } else {
          handleAttemptClose();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirmOpen, exitConfirmOpen, sending, isDirty]);

  if (!open) return null;

  const doSend = async () => {
    if (studentIds.length === 0) return;
    try {
      setSending(true);
      await onSend({ studentIds, subject, message });
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to send account credentials.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (studentIds.length === 0) return;
    setConfirmOpen(true);
  };

  const modalContent = (
    <>
      {/* MAIN SEND MODAL BACKDROP (Base zIndex: 10000) */}
      <div
        className="modal-backdrop-custom"
        style={{ ...backdropBlurStyle, zIndex: 10000 }}
        role="dialog"
        aria-modal="true"
        aria-label="Send Account Credentials"
        onMouseDown={(e) => {
          if (
            e.target === e.currentTarget &&
            !confirmOpen &&
            !exitConfirmOpen &&
            !sending
          ) {
            handleAttemptClose();
          }
        }}
      >
        <div
          className="modal-card-custom"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-head-custom">
            <div className="d-flex align-items-center gap-2">
              <Mail size={20} />
              <h5 className="mb-0 fw-bold">Send Account Credentials</h5>
            </div>

            <button
              type="button"
              className="modal-x-btn"
              onClick={handleAttemptClose}
              aria-label="Close"
              disabled={sending}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-custom">
            <p className="text-muted mb-3">
              Send account credentials to <b>{count}</b> selected student
              {count > 1 ? "s" : ""}.
            </p>

            {/* Student List */}
            <div className="selected-students-box">
              {students.map((s) => (
                <div key={s._id} className="selected-student-row">
                  <div className="d-flex flex-column">
                    <div className="fw-semibold">{s.fullName}</div>
                    <div className="text-muted small">{s.studentIdNumber}</div>
                  </div>
                  <div className="text-muted small">{s.email || "—"}</div>
                </div>
              ))}
            </div>

            {/* Single Student Detail */}
            {students.length === 1 ? (
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Student Information</h6>
                <div className="info-grid">
                  <InfoItem
                    icon={<User size={16} />}
                    label="Full Name"
                    value={students[0].fullName}
                  />
                  <InfoItem
                    icon={<IdCard size={16} />}
                    label="Student ID"
                    value={students[0].studentIdNumber}
                  />
                  <InfoItem
                    icon={<Phone size={16} />}
                    label="Phone"
                    value={students[0].phone || "—"}
                  />
                  <InfoItem
                    icon={<GraduationCap size={16} />}
                    label="Program / Year"
                    value={`${students[0].program} • Year ${students[0].yearLevel}`}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-3">
              <label className="form-label fw-semibold">Subject</label>
              <input
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                disabled={sending}
              />
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">
                Additional Message (optional)
              </label>
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add instructions for the student..."
                disabled={sending}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-foot-custom">
            <button
              type="button"
              className="btn btn-light"
              onClick={handleAttemptClose}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-teal"
              onClick={handleSend}
              disabled={sending || studentIds.length === 0}
            >
              <Mail size={18} />
              {sending
                ? "Sending..."
                : `Send Credentials to ${count} Student${count > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION POPUP (Elevated zIndex: 10050 to sit cleanly on top) */}
      {confirmOpen && (
        <div
          className="confirm-backdrop"
          style={{ ...backdropBlurStyle, zIndex: 10050 }}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Send Credentials"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !sending) {
              setConfirmOpen(false);
            }
          }}
        >
          <div
            className="confirm-card"
            style={{ zIndex: 10051 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-warning" />
              <h6 className="mb-0 fw-bold">Confirm Send</h6>
            </div>

            <p className="text-muted mb-3">
              Are you sure you want to send credentials to <b>{count}</b>{" "}
              student
              {count > 1 ? "s" : ""}?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={doSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXIT CONFIRMATION MODAL (Elevated zIndex: 10060) */}
      {exitConfirmOpen && (
        <div
          className="confirm-backdrop"
          style={{ ...backdropBlurStyle, zIndex: 10060 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel Sending"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !sending) {
              setExitConfirmOpen(false);
            }
          }}
        >
          <div
            className="confirm-card"
            style={{ zIndex: 10061 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-danger" />
              <h6 className="mb-0 fw-bold">Discard Changes?</h6>
            </div>

            <p className="text-muted mb-3">
              Are you sure you want to exit? Your custom subject and message
              will be lost.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setExitConfirmOpen(false)}
                disabled={sending}
              >
                Continue Editing
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmExit}
                disabled={sending}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="info-item">
      <div className="info-label">
        <span className="info-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="info-value">{value}</div>
    </div>
  );
}
