// src/components/Registrar/Help/SubmitTicketModal.tsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import { API_BASE_URL } from "../../../config";

type SubmitTicketModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  onError?: (message: string) => void;
};

export default function SubmitTicketModal({
  open,
  onClose,
  onSubmitSuccess,
  onError,
}: SubmitTicketModalProps) {
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(""); // 👈 Default to empty/blank
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !description) return;

    try {
      setSubmitting(true);

      // Extract user info from localStorage
      const userJson = localStorage.getItem("user");
      const currentUser = userJson ? JSON.parse(userJson) : null;

      const userEmail = currentUser?.email || "";
      const userIdNumber = currentUser?.idNumber || "GIP-000";
      const userName = [
        currentUser?.firstName,
        currentUser?.middleName,
        currentUser?.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "System User";

      if (!userEmail) {
        throw new Error("Unable to identify signed-in user. Please log in again.");
      }

      // Dynamically resolve ticket endpoint using API_BASE_URL from config.ts
      const cleanBase = API_BASE_URL.replace(/\/+$/, "");
      const response = await fetch(`${cleanBase}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          idNumber: userIdNumber,
          categoryKey: category,
          priority: priority || "Normal", // Fallback to Normal if left blank
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit support ticket.");
      }

      if (onSubmitSuccess) onSubmitSuccess();
      handleClose();
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      if (onError && err instanceof Error) {
        onError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setCategory("");
    setPriority(""); // Reset to blank on close
    setSubject("");
    setDescription("");
    onClose();
  };

  return createPortal(
    <>
      <div
        className="rh-contact-modal-backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !submitting) handleClose();
        }}
      />

      <div className="rh-contact-modal-wrap">
        <div
          className="rh-contact-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-ticket-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="rh-contact-modal-header">
            <div>
              <h3 id="submit-ticket-title" className="rh-contact-modal-title">
                Submit Support Ticket
              </h3>
              <p className="rh-contact-modal-subtitle mb-0">
                Describe your issue and our team will assist you
              </p>
            </div>

            <button
              type="button"
              className="rh-contact-modal-close app-icon-btn app-icon-btn-sm"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body / Form */}
          <div className="rh-contact-modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                {/* Category */}
                <div className="col-12 col-md-6 text-start">
                  <label className="form-label fw-semibold small">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="System Bug">System Bug / Error</option>
                    <option value="Enrollment">Enrollment / Registration</option>
                    <option value="Grades & Records">Grades & Records</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="col-12 col-md-6 text-start">
                  <label className="form-label fw-semibold small">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-3 text-start">
                <label className="form-label fw-semibold small">
                  Subject <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Description */}
              <div className="mb-4 text-start">
                <label className="form-label fw-semibold small">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  required
                  disabled={submitting}
                />
                <div className="text-end text-muted small mt-1">
                  {description.length}/1000
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-light border px-4"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn rh-contact-btn px-4"
                  disabled={submitting}
                >
                  <Send size={16} />
                  <span>{submitting ? "Submitting..." : "Submit Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}