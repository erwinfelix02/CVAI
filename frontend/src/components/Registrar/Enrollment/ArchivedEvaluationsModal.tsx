import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, X, RefreshCw, Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { EnrollmentItem } from "./types";

interface ArchivedEvaluationsModalProps {
  open: boolean;
  onClose: () => void;
  fetchArchived: () => Promise<EnrollmentItem[]>;
  onRestore: (id: string) => Promise<void>;
  onDeleteArchived?: (id: string) => Promise<void>;
}

export default function ArchivedEvaluationsModal({
  open,
  onClose,
  fetchArchived,
  onRestore,
  onDeleteArchived,
}: ArchivedEvaluationsModalProps) {
  const [archivedItems, setArchivedItems] = useState<EnrollmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // State to handle the custom delete confirmation modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchArchived();
      setArchivedItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load archived list", err);
      setArchivedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Prevent background body scrolling & handle Escape key
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmDeleteId) {
          setConfirmDeleteId(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, confirmDeleteId]);

  if (!open) return null;

  const itemPendingDelete = archivedItems.find((s) => s._id === confirmDeleteId);
  const deleteFullName = itemPendingDelete
    ? itemPendingDelete.studentName ||
      `${itemPendingDelete.personal?.firstName ?? ""} ${itemPendingDelete.personal?.lastName ?? ""}`.trim() ||
      "Unknown Student"
    : "";

  const modalContent = (
    <div
      className="modal-backdrop-custom"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !confirmDeleteId) onClose();
      }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 w-100 overflow-hidden position-relative"
        style={{ maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 pb-3 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3 text-warning bg-warning-subtle p-2"
              style={{ width: 40, height: 40 }}
            >
              <Archive size={20} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Archived Evaluations</h5>
              <p className="text-muted small mb-0">Manage and restore expired or lingering pending evaluations</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-light rounded-circle p-2 border-0 d-flex align-items-center justify-content-center text-secondary"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 p-md-4 overflow-auto bg-light" style={{ flex: 1 }}>
          {isLoading ? (
            <div className="text-center py-5">
              <Loader2 size={28} className="spinner-border spinner-border-sm text-primary mb-2" />
              <p className="text-muted small mb-0">Loading archived records...</p>
            </div>
          ) : archivedItems.length > 0 ? (
            <div className="d-flex flex-column gap-2.5">
              {archivedItems.map((s) => {
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
                const isItemBusy = actionLoadingId === s._id;

                return (
                  <div
                    key={s._id}
                    className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-3 shadow-sm transition-all"
                  >
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0 bg-secondary"
                        style={{ width: 42, height: 42, fontSize: "0.9rem" }}
                      >
                        {initials || "ST"}
                      </div>
                      <div className="min-w-0">
                        <div className="fw-bold text-dark text-truncate">{fullName}</div>
                        <div className="small text-muted text-truncate">
                          {s.registrationId} {program ? `• ${program} Year ${yearLevel || "N/A"}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-medium shadow-none"
                        title="Restore Evaluation"
                        disabled={isItemBusy}
                        onClick={async () => {
                          try {
                            setActionLoadingId(s._id);
                            await onRestore(s._id);
                            await loadData();
                          } finally {
                            setActionLoadingId(null);
                          }
                        }}
                      >
                        {isItemBusy ? (
                          <Loader2 size={14} className="spinner-border spinner-border-sm" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        <span>Restore</span>
                      </button>

                      {onDeleteArchived && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-1.5 rounded-3 shadow-none"
                          title="Delete Permanently"
                          disabled={isItemBusy}
                          onClick={() => setConfirmDeleteId(s._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5 bg-white rounded-4 border">
              <div className="fs-1 mb-2">📦</div>
              <h6 className="fw-semibold text-dark mb-1">No archived evaluations</h6>
              <p className="text-muted small mb-0">
                Archived pending evaluations will appear here when archived from the main list.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer border-top bg-white px-4 py-3 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-light border px-4 py-2 rounded-3 text-secondary fw-medium shadow-none"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Custom Confirmation Sub-Modal Overlay */}
        {confirmDeleteId && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(2px)",
              zIndex: 1060,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              className="card shadow border-0 rounded-4 p-4 bg-white text-center"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              <div
                className="mx-auto d-inline-flex align-items-center justify-content-center rounded-circle text-danger bg-danger-subtle mb-3"
                style={{ width: 48, height: 48 }}
              >
                <AlertTriangle size={24} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Confirm Deletion</h5>
              <p className="text-muted small mb-4">
                Are you sure you want to permanently delete the archive for <strong>{deleteFullName}</strong>? This action cannot be undone.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light border px-4 py-2 rounded-3 text-secondary fw-medium shadow-none flex-grow-1"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 rounded-3 fw-medium shadow-none flex-grow-1"
                  onClick={async () => {
                    if (!confirmDeleteId || !onDeleteArchived) return;
                    try {
                      setActionLoadingId(confirmDeleteId);
                      await onDeleteArchived(confirmDeleteId);
                      setConfirmDeleteId(null);
                      await loadData();
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}