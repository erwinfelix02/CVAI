// ✅ src/components/Faculty/Help/SubmitTicketModal.tsx

import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../../../config"; // Adjust relative path based on where config.ts is located

interface TicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function SubmitTicketModal({
  onClose,
  onSuccess,
  onError,
}: TicketModalProps) {
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject.trim() || !description.trim()) return;

    setSubmitting(true);

    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) {
        onError("Session expired. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(userStr);

      const facultyEmail = user.email || "faculty@campus.edu.ph";
      const facultyName = user.fullName || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Faculty Member";
      const facultyIdNumber = user.facultyId || user.idNumber || user._id || "FAC-001";

      // Updated payload matching the new backend schema requirements (email, name, idNumber)
      const payload = {
        email: facultyEmail,
        name: facultyName,
        idNumber: facultyIdNumber,
        categoryKey: category,
        priority: priority || "Normal",
        subject: subject.trim(),
        description: description.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        const errData = await res.json();
        onError(errData.message || "Failed to submit support ticket.");
      }
    } catch (err) {
      console.error("❌ Ticket submission network error:", err);
      onError("Network error while submitting support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex={-1} 
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)", 
        backdropFilter: "blur(2px)",
        zIndex: 1055,
        pointerEvents: "auto"
      }}
    >
      <div 
        className="modal-dialog modal-dialog-centered" 
        style={{ maxWidth: "600px", pointerEvents: "auto" }}
      >
        <div
          className="card border-0 shadow-lg rounded-4 bg-white w-100 p-4 position-relative"
          style={{ maxHeight: "90vh", overflowY: "auto", pointerEvents: "auto" }}
        >
          <button
            type="button"
            className="btn btn-sm p-1 position-absolute top-0 end-0 m-3 text-muted border-0 bg-transparent shadow-none"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            style={{ zIndex: 10, cursor: "pointer" }}
          >
            <X size={20} />
          </button>

          {submitted ? (
            <div className="text-center py-5">
              <CheckCircle2 size={48} className="text-success mb-3" />
              <h4 className="fw-bold text-dark">Ticket Submitted Successfully!</h4>
              <p className="text-muted small mb-0">
                Our support team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h5 className="fw-bold mb-1">Submit Support Ticket</h5>
              <p className="text-muted small mb-4">
                Describe your issue and our team will assist you
              </p>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Category *
                  </label>
                  <select
                    className="form-select shadow-none py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    style={{ borderRadius: "8px", borderColor: "#ced4da", cursor: "pointer" }}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Grades">Grades & Records</option>
                    <option value="Classes">Classes & Attendance</option>
                    <option value="Technical">Technical / System Issue</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-dark">Priority</label>
                  <select
                    className="form-select shadow-none py-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ borderRadius: "8px", borderColor: "#ced4da", cursor: "pointer" }}
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

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Subject *</label>
                <input
                  type="text"
                  className="form-control shadow-none py-2"
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={{ borderRadius: "8px", borderColor: "#ced4da" }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Description *</label>
                <textarea
                  className="form-control shadow-none"
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ borderRadius: "8px", borderColor: "#ced4da" }}
                />
                <div className="text-end text-muted small mt-1">
                  {description.length}/1000
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-light px-4 py-2 border"
                  style={{ borderRadius: "8px", fontWeight: 500 }}
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn text-white px-4 py-2 d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: "#0b4d6b", borderRadius: "8px", fontWeight: 500 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}