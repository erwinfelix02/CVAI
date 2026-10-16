import { useState } from "react";
import { FileText, Check, X, User, Building } from "lucide-react";
import type { SectionRequest } from "./types";

type Props = {
  requests: SectionRequest[];
  onApproveClick: (request: SectionRequest) => void;
  onReject: (requestId: string, feedback: string) => Promise<void>;
};

export default function SectionRequestsCard({
  requests,
  onApproveClick,
  onReject,
}: Props) {
  const [selectedRejectReq, setSelectedRejectReq] = useState<SectionRequest | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRequests = Array.isArray(requests) ? requests : [];
  const pendingRequests = activeRequests.filter((r) => !r.status || r.status === "Pending");
  const pendingCount = pendingRequests.length;

  const handleOpenReject = (req: SectionRequest) => {
    setSelectedRejectReq(req);
    setRejectFeedback("");
  };

  const confirmReject = async () => {
    if (!selectedRejectReq) return;
    try {
      setIsSubmitting(true);
      await onReject(selectedRejectReq.id, rejectFeedback);
      setSelectedRejectReq(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format the date into readable text
  const formatReadableDate = (dateInput?: string | Date | number) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="card shadow-sm border-0 mb-4 p-3 p-md-4 rounded-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-primary-subtle text-primary rounded-3">
            <FileText size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
              Section Requests from Departments
              <span className="badge bg-primary rounded-pill fs-7 px-2 py-1">
                {pendingCount} pending
              </span>
            </h5>
            <small className="text-muted">
              Check room availability and capacity before officially opening a section
            </small>
          </div>
        </div>
      </div>

      {pendingCount === 0 ? (
        <div className="text-center py-4 text-muted bg-light rounded-3 border border-dashed">
          <p className="mb-0 small">No pending section requests from departments at this time.</p>
        </div>
      ) : (
        <div 
          className="d-flex flex-column gap-3 pe-1"
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {pendingRequests.map((req) => {
            const displayCode = req.sectionName || req.code || req.program;
            const suffix = req.yearLevel === 1 ? "st" : req.yearLevel === 2 ? "nd" : req.yearLevel === 3 ? "rd" : "th";
            const yearStr = req.yearLevel ? `${req.yearLevel}${suffix} Year` : "";
            const capacityVal = req.requestedCapacity ?? req.capacity ?? 40;
            const roomVal = req.preferredRoom || req.room || "TBA";
            const formattedDate = formatReadableDate(req.createdAt);

            return (
              <div
                key={req.id}
                className="p-3 border rounded-3 bg-white d-flex flex-column flex-lg-row align-lg-items-center justify-content-between gap-3 shadow-xs flex-shrink-0"
              >
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="fw-bold text-dark fs-6">{displayCode}</span>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                      {req.status || "Pending"}
                    </span>
                  </div>
                  <div className="text-muted small d-flex align-items-center gap-3 flex-wrap">
                    <span>{req.program} {yearStr ? `• ${yearStr}` : ""}</span>
                    <span>Capacity: {capacityVal}</span>
                    <span className="d-flex align-items-center gap-1">
                      <Building size={13} /> Preferred Room: {roomVal}
                    </span>
                  </div>
                  {req.reason && (
                    <div className="text-muted small mt-1 fst-italic">
                      "{req.reason}"
                    </div>
                  )}
                  {formattedDate && (
                    <div className="text-muted text-xs mt-1 d-flex align-items-center gap-1">
                      <User size={12} /> Requested on {formattedDate}
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-4 py-2 rounded-pill fw-medium"
                    onClick={() => handleOpenReject(req)}
                  >
                    <X size={15} /> Return
                  </button>
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-4 py-2 rounded-pill fw-medium"
                    onClick={() => onApproveClick(req)}
                  >
                    <Check size={15} /> Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RETURN / REJECT MODAL */}
      {selectedRejectReq && (
        <div className="sec-confirm-backdrop" onClick={() => setSelectedRejectReq(null)}>
          <div className="sec-confirm-popup p-4 rounded-4 bg-white shadow-lg mx-3" style={{ maxWidth: 480, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="fw-bold mb-0">Return Request ({selectedRejectReq.sectionName || selectedRejectReq.code})</h5>
              <button className="btn btn-link p-0 text-muted" onClick={() => setSelectedRejectReq(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-muted small mb-3">
              Provide feedback explaining why this section request is being returned or rejected.
            </p>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Feedback to department</label>
              <textarea
                className="form-control"
                rows={3}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="e.g., Room capacity is insufficient or schedule conflict"
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-light px-4 rounded-pill fw-medium" onClick={() => setSelectedRejectReq(null)} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-danger px-4 rounded-pill fw-medium" onClick={confirmReject} disabled={isSubmitting}>
                {isSubmitting ? "Returning..." : "Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}