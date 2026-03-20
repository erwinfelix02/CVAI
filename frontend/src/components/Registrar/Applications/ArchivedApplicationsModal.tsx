import { RotateCcw, Trash2, X, Users } from "lucide-react";
import type { ApplicationRow } from "./types";
import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  items: ApplicationRow[];
  onUnarchive: (id: string) => void;
  onDelete: (ids: string[]) => Promise<void> | void;
};

export default function ArchivedApplicationsModal({
  open,
  onClose,
  items,
  onUnarchive,
  onDelete,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  if (!open) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsDeleting(true);
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setConfirmDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block archived-modal-overlay">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow archived-modal-card">
            <div className="modal-header archived-modal-header">
              <h5 className="modal-title fw-bold">
                Archived Applications ({items.length})
              </h5>

              <button
                type="button"
                className="archived-icon-btn archived-icon-btn-sm"
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: "2rem" }}>📭</div>
                  <h6 className="fw-semibold mt-2 mb-1">
                    No archived items found
                  </h6>
                  <p className="text-muted mb-0">
                    Archived applications will appear here once items are archived.
                  </p>
                </div>
              ) : (
                <>
                  <div className="archived-toolbar">
                    <button
                      type="button"
                      className="archived-select-all"
                      onClick={handleSelectAll}
                    >
                      <Users size={16} />
                      <span className="ms-2">
                        {allSelected ? "Deselect All" : "Select All Archived"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="archived-delete-selected"
                      disabled={selectedCount === 0}
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 size={16} />
                      <span className="ms-2">
                        Delete Selected ({selectedCount})
                      </span>
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {items.map((item) => {
                      const checked = selectedIds.has(item.id);

                      return (
                        <div key={item.id} className="archived-app-card">
                          <div className="archived-app-main">
                            <button
                              type="button"
                              className={`archived-select-circle ${
                                checked ? "is-checked" : ""
                              }`}
                              onClick={() => toggleSelect(item.id)}
                              aria-label={`Select ${item.name}`}
                            />

                            <div className="archived-app-info">
                              <div className="fw-semibold">{item.name}</div>

                              <div className="text-muted">
                                {item.program} • {item.yearLevel}
                              </div>

                              <div className="text-muted small">
                                {item.id} • Submitted {item.submitted}
                              </div>
                            </div>
                          </div>

                          <div className="archived-app-actions">
                            <button
                              type="button"
                              className="archived-icon-btn archived-icon-btn-warning"
                              onClick={() => onUnarchive(item.id)}
                              aria-label={`Unarchive ${item.name}`}
                              title="Unarchive"
                            >
                              <RotateCcw size={16} />
                            </button>

                            <button
                              type="button"
                              className="archived-icon-btn archived-icon-btn-danger"
                              onClick={() => {
                                setSelectedIds(new Set([item.id]));
                                setConfirmDeleteOpen(true);
                              }}
                              aria-label={`Delete ${item.name}`}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer archived-modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />

      {confirmDeleteOpen && (
        <div className="modal fade show d-block delete-confirm-overlay">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow archived-confirm-card">
              <div className="modal-header archived-confirm-header">
                <h5 className="modal-title fw-bold">
                  Permanently Delete Archived Application
                  {selectedCount > 1 ? "s" : ""}
                </h5>

                <button
                  type="button"
                  className="archived-icon-btn archived-icon-btn-sm"
                  onClick={() => setConfirmDeleteOpen(false)}
                  aria-label="Close"
                  title="Close"
                  disabled={isDeleting}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body archived-confirm-body">
                <p>
                  Are you sure you want to permanently delete{" "}
                  <strong>{selectedCount}</strong> archived application
                  {selectedCount > 1 ? "s" : ""}?
                </p>

                <p className="text-danger small">
                  This action cannot be undone.
                </p>

                <div className="small text-muted">
                  {selectedItems.slice(0, 5).map((item) => (
                    <div key={item.id}>
                      {item.name} — {item.id}
                    </div>
                  ))}

                  {selectedItems.length > 5 && (
                    <div>...and {selectedItems.length - 5} more</div>
                  )}
                </div>
              </div>

              <div className="modal-footer archived-confirm-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? "Deleting..." : "Yes, Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}