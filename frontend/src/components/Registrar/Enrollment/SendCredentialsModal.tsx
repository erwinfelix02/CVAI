import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, User, IdCard, Phone, GraduationCap, AlertTriangle } from "lucide-react";
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

export default function SendCredentialsModal({
  open,
  onClose,
  students,
  onSend,
}: Props) {
  const [subject, setSubject] = useState("Your CampusHub Account Credentials");
  const [message, setMessage] = useState(
    "Hello! Your student portal account has been created. Please use the credentials provided to log in.",
  );
  const [sending, setSending] = useState(false);

  // ✅ confirmation popup state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const studentIds = useMemo(() => students.map((s) => s._id), [students]);
  const count = students.length;

  // reset + lock scroll
  useEffect(() => {
    if (!open) return;

    setSubject("Your CampusHub Account Credentials");
    setMessage(
      "Hello! Your student portal account has been created. Please use the credentials provided to log in.",
    );

    // ✅ close confirm if modal re-opens
    setConfirmOpen(false);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close (if confirm popup is open, close popup first)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmOpen) setConfirmOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, confirmOpen]);

  if (!open) return null;

  // ✅ original send logic extracted
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

  // ✅ now Send button opens popup instead of sending immediately
  const handleSend = () => {
    if (studentIds.length === 0) return;
    setConfirmOpen(true);
  };

  const modal = (
    <>
      <div
        className="modal-backdrop-custom"
        role="dialog"
        aria-modal="true"
        aria-label="Send Account Credentials"
        onMouseDown={(e) => {
          // click outside closes (but not while confirm popup is open)
          if (e.target === e.currentTarget && !confirmOpen && !sending) onClose();
        }}
      >
        <div className="modal-card-custom" onMouseDown={(e) => e.stopPropagation()}>
          {/* header */}
          <div className="modal-head-custom">
            <div className="d-flex align-items-center gap-2">
              <Mail size={20} />
              <h5 className="mb-0 fw-bold">Send Account Credentials</h5>
            </div>

            <button
              className="modal-x-btn"
              onClick={() => {
                if (!sending) onClose();
              }}
              aria-label="Close"
              disabled={sending}
            >
              <X size={18} />
            </button>
          </div>

          {/* body (scrollable) */}
          <div className="modal-body-custom">
            <p className="text-muted mb-3">
              Send account credentials to <b>{count}</b> selected student{count > 1 ? "s" : ""}.
            </p>

            {/* list */}
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

            {/* details if 1 */}
            {students.length === 1 ? (
              <div className="mt-3">
                <h6 className="fw-bold mb-2">Student Information</h6>

                <div className="info-grid">
                  <InfoItem icon={<User size={16} />} label="Full Name" value={students[0].fullName} />
                  <InfoItem
                    icon={<IdCard size={16} />}
                    label="Student ID"
                    value={students[0].studentIdNumber}
                  />
                  <InfoItem icon={<Phone size={16} />} label="Phone" value={students[0].phone || "—"} />
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
              />
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">Additional Message (optional)</label>
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add instructions for the student..."
              />
            </div>
          </div>

          {/* footer */}
          <div className="modal-foot-custom">
            <button
              className="btn btn-light"
              onClick={() => {
                if (!sending) onClose();
              }}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              className="btn-teal"
              onClick={handleSend}
              disabled={sending || studentIds.length === 0}
            >
              <Mail size={18} />
              {sending ? "Sending..." : `Send Credentials to ${count} Student${count > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ CONFIRMATION POPUP */}
      {confirmOpen ? (
        <div
          className="confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Send Credentials"
          onMouseDown={(e) => {
            // click outside confirmation closes it (optional)
            if (e.target === e.currentTarget && !sending) setConfirmOpen(false);
          }}
        >
          <div className="confirm-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              <h6 className="mb-0 fw-bold">Confirm Send</h6>
            </div>

            <p className="text-muted mb-3">
              Are you sure you want to send credentials to <b>{count}</b> student{count > 1 ? "s" : ""}?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
              >
                Cancel
              </button>

              <button className="btn btn-danger" onClick={doSend} disabled={sending}>
                {sending ? "Sending..." : "Yes, Send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  // ✅ IMPORTANT: Portal fixes sidebar/backdrop z-index issues
  return createPortal(modal, document.body);
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