import { useState, useEffect } from "react";
import { Mail, Send, AlertTriangle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import type { Student } from "./types";

type Props = {
  student: Student | null;
  onClose: () => void;
};

export default function SendEmailModal({ student, onClose }: Props) {
  const [template, setTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recipientEmail = student
    ? student.email || `${student.name.toLowerCase().replace(/\s+/g, ".")}@university.edu`
    : "";

  useEffect(() => {
    if (template === "warning") {
      setSubject("Academic Performance Alert");
      setMessage(
        `Dear ${student?.name},\n\nWe would like to discuss your academic progress regarding your current GPA and attendance. Please reach out during consultation hours.`
      );
    } else if (template === "praise") {
      setSubject("Great job on your academic standing!");
      setMessage(
        `Dear ${student?.name},\n\nCongratulations on maintaining outstanding academic performance this semester. Keep up the excellent work!`
      );
    } else {
      setSubject("");
      setMessage("");
    }
  }, [template, student]);

  if (!student) return null;

  const isDirty = subject.trim() !== "" || message.trim() !== "";

  const handleAttemptClose = () => {
    if (isDirty && !showSuccessModal && !showSendConfirm && !isSending) {
      setShowExitConfirm(true);
    } else if (!showSendConfirm && !isSending) {
      handleForceClose();
    }
  };

  const handleForceClose = () => {
    setTemplate("custom");
    setSubject("");
    setMessage("");
    setErrorMessage(null);
    setShowExitConfirm(false);
    setShowSendConfirm(false);
    setShowSuccessModal(false);
    setIsSending(false);
    onClose();
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSendConfirm(true);
  };

  const handleFinalSend = async () => {
    setShowSendConfirm(false);
    setIsSending(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/users/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: recipientEmail,
          subject,
          message,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to send email to student.");
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        handleForceClose();
      }, 1800);
    } catch (err: any) {
      console.error("Failed to send email:", err);
      setErrorMessage(err.message || "An unexpected error occurred while sending email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* MAIN EMAIL COMPOSER MODAL */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 1050,
        }}
        onClick={handleAttemptClose}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-md modal-fullscreen-sm-down px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Mail className="text-dark" size={22} />
                <h5 className="modal-title fw-bold text-dark m-0">Send Message</h5>
              </div>
              <button
                type="button"
                className="btn-close shadow-none"
                onClick={handleAttemptClose}
                disabled={isSending}
                aria-label="Close"
              />
            </div>

            {/* Form */}
            <form onSubmit={handlePreSubmit} className="modal-body p-4">
              {errorMessage && (
                <div className="alert alert-danger small mb-3 rounded-3" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* Recipient */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="text-secondary small fw-medium">To</span>
                <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill border border-light-subtle">
                  {recipientEmail}
                </span>
              </div>

              {/* Template */}
              <div className="mb-3">
                <label className="form-label text-dark small fw-medium mb-1">
                  Template
                </label>
                <select
                  className="form-select border-2 shadow-none py-2 px-3 rounded-3"
                  style={{ borderColor: "#0d5c75" }}
                  value={template}
                  disabled={isSending}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option value="custom">Custom message</option>
                  <option value="warning">Academic Warning</option>
                  <option value="praise">Academic Commendation</option>
                </select>
              </div>

              {/* Subject */}
              <div className="mb-3">
                <label className="form-label text-dark small fw-medium mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSending}
                  className="form-control bg-light border-0 py-2 px-3 rounded-3 shadow-none"
                  placeholder="Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="form-label text-dark small fw-medium mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  disabled={isSending}
                  className="form-control bg-light border-0 p-3 rounded-3 shadow-none"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="d-flex justify-content-end align-items-center gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-light px-4 py-2 rounded-3 border-0 fw-medium text-dark"
                  onClick={handleAttemptClose}
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn text-white px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="spinner-border spinner-border-sm me-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* PRE-SEND CONFIRMATION OVERLAY DIALOG */}
      {showSendConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowSendConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px", backgroundColor: "rgba(13, 92, 117, 0.1)", color: "#0d5c75" }}
              >
                <HelpCircle size={30} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Send Email?</h5>
              <p className="text-secondary small mb-4">
                Are you sure you want to send this email to <br />
                <strong className="text-dark">{recipientEmail}</strong>?
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowSendConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap shadow-sm"
                  style={{ backgroundColor: "#0d5c75" }}
                  onClick={handleFinalSend}
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD UNSAVED CHANGES OVERLAY DIALOG */}
      {showExitConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-warning bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <AlertTriangle size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Discard Message?</h5>
              <p className="text-secondary small mb-4">
                You have unsaved changes. Leaving now will discard your message.
              </p>

              <div className="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light flex-fill py-2.5 px-3 rounded-3 text-dark fw-medium border-0 text-nowrap"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-fill py-2.5 px-3 rounded-3 fw-medium text-nowrap"
                  onClick={handleForceClose}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION OVERLAY DIALOG */}
      {showSuccessModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1060,
          }}
        >
          <div className="modal-dialog modal-dialog-centered px-3" style={{ maxWidth: "400px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4">
              <div
                className="mx-auto mb-3 text-success bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Email Sent!</h5>
              <p className="text-secondary small mb-0">
                Message successfully delivered to <br />
                <strong className="text-dark">{recipientEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}