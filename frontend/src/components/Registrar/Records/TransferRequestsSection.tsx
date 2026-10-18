import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightLeft, CheckCircle, RotateCcw, PencilLine, X, TriangleAlert, User, Hash, FileText } from "lucide-react";

type TransferRequest = {
  id: string;
  studentId?: string;
  studentName?: string;
  transferType?: "internal" | "external" | "Drop";
  requestType?: "transfer" | "drop";
  currentDepartment?: string;
  currentCourse?: string;
  targetDepartment?: string;
  targetCourse?: string;
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
  onApprove: (request: TransferRequest) => void;
  onReturn: (request: TransferRequest) => void;
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
  const visibleRequests = pendingRequests.slice(0, 1);

  const [returnConfirmReq, setReturnConfirmReq] = useState<TransferRequest | null>(null);
  const [approveConfirmReq, setApproveConfirmReq] = useState<TransferRequest | null>(null);

  const handleConfirmReturn = () => {
    if (returnConfirmReq) {
      onReturn(returnConfirmReq);
      setReturnConfirmReq(null);
    }
  };

  const handleConfirmApprove = () => {
    if (approveConfirmReq) {
      onApprove(approveConfirmReq);
      setApproveConfirmReq(null);
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
            <h5 className="fw-bold mb-0">Student Requests & Transfers</h5>
            <p className="text-muted small mb-0">Review program transfer or official drop requests submitted by students.</p>
          </div>
        </div>
        <span className={`badge px-3 py-2 rounded-pill fw-semibold ${pendingRequests.length > 0 ? "bg-warning text-dark" : "bg-light text-muted border"}`}>
          {pendingRequests.length} pending total
        </span>
      </div>

      {pendingRequests.length > 0 ? (
        <>
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
              const isDrop = req.requestType === "drop";

              return (
                <div key={req.id} className="p-3 border rounded-3 bg-light-subtle position-relative">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark fs-6">{studentName}</span>
                        {studentId && <span className="text-muted small">({studentId})</span>}
                        <span className={`badge border text-capitalize px-2 ${isDrop ? "bg-danger-subtle text-danger border-danger-subtle" : "bg-info-subtle text-info border-info-subtle"}`}>
                          {isDrop ? "Official Drop Request" : `${req.transferType || "Program"} Transfer`}
                        </span>
                      </div>

                      <div className="text-secondary small mb-2">
                        {isDrop ? (
                          <span>Student requested official drop from <strong className="text-dark">{req.currentCourse || "Program"}</strong></span>
                        ) : (
                          <>
                            Moving from <strong className="text-dark">{req.currentCourse || "Current Program"}</strong>{" "}
                            <span className="text-primary mx-1">➔</span>{" "}
                            <strong className="text-dark">{req.targetCourse}</strong> ({req.targetDepartment})
                          </>
                        )}
                      </div>

                      {req.reason && (
                        <div className="p-2 bg-white rounded border small text-muted">
                          <span className="fw-semibold text-secondary">Reason:</span>{" "}
                          <span className="fst-italic text-dark">"{req.reason}"</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-nowrap flex-shrink-0 justify-content-end">
                      {!isDrop && (
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
                      )}

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => setReturnConfirmReq(req)}
                        disabled={loading}
                        title="Return request back to student for revision"
                      >
                        <RotateCcw size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => setApproveConfirmReq(req)}
                        disabled={loading}
                        title="Approve & Finalize"
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
          <p className="mb-0 small">No pending transfer or drop requests at this moment.</p>
        </div>
      )}

      {returnConfirmReq && createPortal(
        <div
          className="registrar-confirm-backdrop"
          style={backdropBlurStyle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) setReturnConfirmReq(null);
          }}
        >
          <div className="registrar-confirm-modal p-4" style={{ maxWidth: "440px", width: "100%", borderRadius: "0.875rem", background: "#fff" }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="registrar-confirm-header d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
              <div className="registrar-confirm-title fw-bold fs-5 text-dark">Return Request?</div>
              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => setReturnConfirmReq(null)}
                disabled={loading}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="registrar-confirm-body text-center">
              <div className="registrar-confirm-icon bg-warning-subtle text-warning mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "50px", height: "50px" }}>
                <TriangleAlert size={24} />
              </div>
              <p className="text-muted small mb-3">
                Are you sure you want to return this {returnConfirmReq.requestType === "drop" ? "official drop" : "transfer"} request back to the student?
              </p>

              <div className="p-3 bg-light rounded-3 border text-start small mb-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <User size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">Student Name:</span>
                  <span className="fw-semibold text-dark ms-auto">{returnConfirmReq.studentName || returnConfirmReq.student?.fullName || returnConfirmReq.student?.name || "Unknown"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Hash size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">ID Number:</span>
                  <span className="fw-semibold text-dark ms-auto">{returnConfirmReq.studentId || returnConfirmReq.student?.studentIdNumber || returnConfirmReq.student?.id || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">Request Type:</span>
                  <span className="fw-semibold text-dark ms-auto text-capitalize">{returnConfirmReq.requestType === "drop" ? "Official Drop" : `${returnConfirmReq.transferType || "Program"} Transfer`}</span>
                </div>
              </div>
            </div>

            <div className="registrar-confirm-actions d-flex gap-2 justify-content-end pt-2">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={() => setReturnConfirmReq(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4"
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

      {approveConfirmReq && createPortal(
        <div
          className="registrar-confirm-backdrop"
          style={backdropBlurStyle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) setApproveConfirmReq(null);
          }}
        >
          <div className="registrar-confirm-modal p-4" style={{ maxWidth: "440px", width: "100%", borderRadius: "0.875rem", background: "#fff" }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="registrar-confirm-header d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
              <div className="registrar-confirm-title fw-bold fs-5 text-dark">Approve Request?</div>
              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => setApproveConfirmReq(null)}
                disabled={loading}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="registrar-confirm-body text-center">
              <div className="registrar-confirm-icon bg-primary-subtle text-primary mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "50px", height: "50px" }}>
                <TriangleAlert size={24} />
              </div>
              <p className="text-muted small mb-3">
                Are you sure you want to approve this {approveConfirmReq.requestType === "drop" ? "official drop" : "transfer"} request?
              </p>

              <div className="p-3 bg-light rounded-3 border text-start small mb-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <User size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">Student Name:</span>
                  <span className="fw-semibold text-dark ms-auto">{approveConfirmReq.studentName || approveConfirmReq.student?.fullName || approveConfirmReq.student?.name || "Unknown"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Hash size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">ID Number:</span>
                  <span className="fw-semibold text-dark ms-auto">{approveConfirmReq.studentId || approveConfirmReq.student?.studentIdNumber || approveConfirmReq.student?.id || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FileText size={14} className="text-muted flex-shrink-0" />
                  <span className="text-muted">Request Type:</span>
                  <span className="fw-semibold text-dark ms-auto text-capitalize">{approveConfirmReq.requestType === "drop" ? "Official Drop" : `${approveConfirmReq.transferType || "Program"} Transfer`}</span>
                </div>
              </div>
            </div>

            <div className="registrar-confirm-actions d-flex gap-2 justify-content-end pt-2">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={() => setApproveConfirmReq(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleConfirmApprove}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}