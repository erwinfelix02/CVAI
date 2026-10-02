import { RotateCcw, Trash2, X, CheckSquare, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { EnrollmentItem } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  items: EnrollmentItem[];
  onUnarchive: (id: string) => void;
  onDeleteOne: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
};

export default function ArchivedEnrolledStudentsModal({
  open,
  onClose,
  items,
  onUnarchive,
  onDeleteOne,
  onDeleteSelected,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("multiple");

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setConfirmOpen(false);
      setDeleteMode("multiple");
    }
  }, [open]);

  const allIds = useMemo(() => items.map((item) => item._id), [items]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const openDeleteSelectedConfirm = () => {
    if (selectedIds.length === 0) return;
    setDeleteMode("multiple");
    setConfirmOpen(true);
  };

  const openDeleteOneConfirm = (id: string) => {
    setSelectedIds([id]);
    setDeleteMode("single");
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedIds.length === 0) return;

    if (deleteMode === "single") {
      onDeleteOne(selectedIds[0]);
    } else {
      onDeleteSelected(selectedIds);
    }

    setConfirmOpen(false);
    setSelectedIds([]);
    setDeleteMode("multiple");
  };

  const formatSubmittedDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!open) return null;

  return (
    <>
      <div
        className="modal fade show d-block archived-enrolled-modal"
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="w-100">
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h5 className="modal-title">
                    Archived Applications ({items.length})
                  </h5>

                  <button
                    type="button"
                    className="archived-close-btn"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-body">
              {items.length > 0 && (
                <div className="archived-toolbar">
                  <button
                    type="button"
                    className="archived-select-btn"
                    onClick={handleSelectAll}
                  >
                    {allSelected ? (
                      <>
                        <CheckSquare size={18} />
                        <span>Unselect All Archived</span>
                      </>
                    ) : (
                      <>
                        <Square size={18} />
                        <span>Select All Archived</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="archived-delete-selected-btn"
                    onClick={openDeleteSelectedConfirm}
                    disabled={selectedIds.length === 0}
                  >
                    <Trash2 size={18} />
                    <span>Delete Selected ({selectedIds.length})</span>
                  </button>
                </div>
              )}

              {items.length === 0 ? (
                <div className="archived-empty">
                  <div style={{ fontSize: "2rem" }}>📭</div>
                  <h6 className="fw-semibold mt-2 mb-1">No archived students</h6>
                  <p className="text-muted mb-0">
                    Archived enrolled students will appear here.
                  </p>
                </div>
              ) : (
                <div className="archived-list">
                  {items.map((item) => {
                    const fullName =
                      item.studentName ||
                      `${item.personal?.firstName ?? ""} ${item.personal?.lastName ?? ""}`.trim() ||
                      "Unknown Student";

                    const program = item.academic?.program?.trim();
                    const yearLevel = item.academic?.yearLevel?.toString().trim();
                    const isSelected = selectedIds.includes(item._id);
                    const submittedDate = formatSubmittedDate(item.createdAt);

                    return (
                      <div
                        key={item._id}
                        className={`archived-card ${isSelected ? "is-selected" : ""}`}
                      >
                        <div className="archived-card-left">
                          <input
                            type="checkbox"
                            className="archived-check"
                            checked={isSelected}
                            onChange={() => toggleSelect(item._id)}
                            aria-label={`Select ${fullName}`}
                          />

                          <div className="archived-student-info">
                            <div className="archived-student-name">{fullName}</div>

                            <div className="archived-student-meta">
                              {program || "—"}
                              {yearLevel ? ` • ${yearLevel}` : ""}
                            </div>

                            <div className="archived-student-submeta">
                              {item.studentIdNumber?.trim()
                                ? item.studentIdNumber
                                : item.registrationId}
                              {submittedDate ? ` • Submitted ${submittedDate}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="archived-actions">
                          <button
                            type="button"
                            className="archived-unarchive-btn"
                            onClick={() => onUnarchive(item._id)}
                          >
                            <RotateCcw size={18} />
                            <span>Unarchive</span>
                          </button>

                          <button
                            type="button"
                            className="archived-delete-btn"
                            onClick={() => openDeleteOneConfirm(item._id)}
                          >
                            <Trash2 size={18} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="archived-footer-close-btn"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} />

      {confirmOpen && (
        <>
          <div
            className="modal fade show d-block archived-confirm-modal"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold mb-0">Confirm Delete</h5>
                  <button
                    type="button"
                    className="archived-close-btn"
                    onClick={() => setConfirmOpen(false)}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  {deleteMode === "single" ? (
                    <>
                      <p className="mb-2">
                        Are you sure you want to permanently delete this archived
                        student?
                      </p>
                      <p className="text-danger small mb-0">
                        This action cannot be undone.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">
                        Are you sure you want to permanently delete{" "}
                        <strong>{selectedIds.length}</strong> archived student
                        {selectedIds.length > 1 ? "s" : ""}?
                      </p>
                      <p className="text-danger small mb-0">
                        This action cannot be undone.
                      </p>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="confirm-cancel-btn"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="confirm-delete-btn"
                    onClick={confirmDelete}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setConfirmOpen(false)}
          />
        </>
      )}
    </>
  );
}