import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightLeft, CheckCircle, RotateCcw, PencilLine, X, TriangleAlert } from "lucide-react";

type TransferRequest = {
  id: string;
  studentId?: string;
  studentName?: string;
  transferType: "internal" | "external";
  currentDepartment: string;
  currentCourse: string;
  targetDepartment: string;
  targetCourse: string;
  reason: string;
  status: "Pending" | "Approved" | "Returned" | "Rejected";
  createdAt?: string;
  student?: {
    id: string;
    name?: string;
    fullName?: string;
    email: string;
    studentIdNumber?: string;
  };
};

type Props = {
  requests: TransferRequest[];
  onOpenEditModal: (request: TransferRequest) => void;
  onApprove: (id: string) => void;
  onReturn: (id: string) => void;
  loading?: boolean;
};

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function TransferRequestsSection({
  requests,
  onOpenEditModal,
  onApprove,
  onReturn,
  loading = false,
}: Props) {
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const visibleRequests = pendingRequests.slice(0, 1); // Show only 1 pending request at a time

  const [returnConfirmId, setReturnConfirmId] = useState<string | null>(null);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);

  const handleConfirmReturn = () => {
    if (returnConfirmId) {
      onReturn(returnConfirmId);
      setReturnConfirmId(null);
    }
  };

  const handleConfirmApprove = () => {
    if (approveConfirmId) {
      onApprove(approveConfirmId);
      setApproveConfirmId(null);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4 p-3 p-md-4 rounded-4 bg-white">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-primary-subtle text-primary rounded-3">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0">Student Transfer Requests</h5>
            <p className="text-muted small mb-0">Review program or department transfer requests submitted by students.</p>
          </div>
        </div>
        <span className={`badge px-3 py-2 rounded-pill fw-semibold ${pendingRequests.length > 0 ? "bg-warning text-dark" : "bg-light text-muted border"}`}>
          {pendingRequests.length} pending total
        </span>
      </div>

      {pendingRequests.length > 0 ? (
        <>
          {/* Scrollable Container */}
          <div 
            className="d-flex flex-column gap-3"
            style={{
              maxHeight: "340px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {visibleRequests.map((req) => {
              const studentName = req.studentName || req.student?.fullName || req.student?.name || "Unknown Student";
              const studentId = req.studentId || req.student?.studentIdNumber || req.student?.id || "";

              return (
                <div key={req.id} className="p-3 border rounded-3 bg-light-subtle position-relative">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark fs-6">{studentName}</span>
                        {studentId && <span className="text-muted small">({studentId})</span>}
                        <span className="badge bg-info-subtle text-info border border-info-subtle text-capitalize px-2">
                          {req.transferType} Transfer
                        </span>
                      </div>

                      <div className="text-secondary small mb-2">
                        Moving from <strong className="text-dark">{req.currentCourse || "Current Program"}</strong>{" "}
                        <span className="text-primary mx-1">➔</span>{" "}
                        <strong className="text-dark">{req.targetCourse}</strong> ({req.targetDepartment})
                      </div>

                      {req.reason && (
                        <div className="p-2 bg-white rounded border small text-muted">
                          <span className="fw-semibold text-secondary">Reason for Transfer:</span>{" "}
                          <span className="fst-italic text-dark">"{req.reason}"</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-nowrap flex-shrink-0 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => onOpenEditModal(req)}
                        disabled={loading}
                        title="Edit student info or program before approval"
                      >
                        <PencilLine size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => setReturnConfirmId(req.id)}
                        disabled={loading}
                        title="Return request back to student for revision"
                      >
                        <RotateCcw size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => setApproveConfirmId(req.id)}
                        disabled={loading}
                        title="Approve & Transfer"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pendingRequests.length > 1 && (
            <div className="text-center text-muted small mt-3">
              Showing 1 of {pendingRequests.length} pending requests. Resolve this request to review the next one.
            </div>
          )}
        </>
      ) : (
        <div className="py-4 text-center text-muted border border-dashed rounded-3 bg-light-subtle">
          <p className="mb-0 small">No pending transfer requests at this moment.</p>
        </div>
      )}

      {/* Return Request Confirmation Modal */}
      {returnConfirmId && createPortal(
        <div
          className="registrar-confirm-backdrop"
          style={backdropBlurStyle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) setReturnConfirmId(null);
          }}
        >
          <div className="registrar-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="registrar-confirm-header">
              <div className="registrar-confirm-title">Return Transfer Request?</div>
              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => setReturnConfirmId(null)}
                disabled={loading}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="registrar-confirm-body">
              <div className="registrar-confirm-icon bg-warning-subtle text-warning">
                <TriangleAlert size={22} />
              </div>
              <p className="text-muted text-center mb-0">
                Are you sure you want to return this transfer request back to the student for revision?
              </p>
            </div>
            <div className="registrar-confirm-actions">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => setReturnConfirmId(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmReturn}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Return Request"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Approve Transfer Confirmation Modal */}
      {approveConfirmId && createPortal(
        <div
          className="registrar-confirm-backdrop"
          style={backdropBlurStyle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) setApproveConfirmId(null);
          }}
        >
          <div className="registrar-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="registrar-confirm-header">
              <div className="registrar-confirm-title">Approve Transfer Request?</div>
              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => setApproveConfirmId(null)}
                disabled={loading}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="registrar-confirm-body">
              <div className="registrar-confirm-icon">
                <TriangleAlert size={22} />
              </div>
              <p className="text-muted text-center mb-0">
                Are you sure you want to approve this student transfer request?
              </p>
            </div>
            <div className="registrar-confirm-actions">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => setApproveConfirmId(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmApprove}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Approve & Transfer"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}