import type { ApplicationRow } from "./types";
import RegistrarApplicationRow from "./RegistrarApplicationRow";
import {
  Users,
  Archive,
  Trash2,
  X,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  items: ApplicationRow[];
  onReview: (id: string) => void;
  onArchive: (id: string) => void;
  onBulkArchive: (ids: string[]) => Promise<void>;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  selectedApprovedIds: Set<string>;
  onToggleApproved: (id: string) => void;
  onDeselectAllApproved: () => void;
  selectedGroupIds: Set<string>;
  setSelectedGroupIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onToggleGroupSelect: (id: string) => void;
  onDeselectAllGroup: () => void;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationsList({
  title,
  items,
  onReview,
  onArchive,
  onBulkArchive,
  onUnarchive,
  onDelete,
  onBulkDelete,
  selectedApprovedIds,
  onToggleApproved,
  onDeselectAllApproved,
  selectedGroupIds,
  setSelectedGroupIds,
  onToggleGroupSelect,
  onDeselectAllGroup,
  onSendSchedule,
}: Props) {
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter items eligible for group actions
  const approvedItems = items.filter((a) => a.status === "Approved");
  const rejectedItems = items.filter((a) => a.status === "Rejected");
  const eligibleGroupItems = items.filter(
    (a) => a.status === "Approved" || a.status === "Rejected",
  );

  const selectedGroupCount = items.filter(
    (a) =>
      (a.status === "Approved" || a.status === "Rejected") &&
      selectedGroupIds.has(a.id),
  ).length;

  // Selective group helpers
  const selectOnlyByStatus = (
    statusTarget: "Approved" | "Rejected" | "Both",
  ) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);

      if (statusTarget === "Approved") {
        // Toggle approved items
        const allApprovedSelected = approvedItems.every((a) => next.has(a.id));
        approvedItems.forEach((a) => {
          if (allApprovedSelected) next.delete(a.id);
          else next.add(a.id);
        });
      } else if (statusTarget === "Rejected") {
        // Toggle rejected items
        const allRejectedSelected = rejectedItems.every((a) => next.has(a.id));
        rejectedItems.forEach((a) => {
          if (allRejectedSelected) next.delete(a.id);
          else next.add(a.id);
        });
      } else {
        // Toggle all eligible (Approved & Rejected)
        const allEligibleSelected = eligibleGroupItems.every((a) =>
          next.has(a.id),
        );
        eligibleGroupItems.forEach((a) => {
          if (allEligibleSelected) next.delete(a.id);
          else next.add(a.id);
        });
      }

      return next;
    });
    setDropdownOpen(false);
  };

  const selectedApprovedScheduleCount = items.filter(
    (a) =>
      a.status === "Approved" &&
      !a.scheduleSent &&
      selectedApprovedIds.has(a.id),
  ).length;

  const hasItems = items.length > 0;

  const handleConfirmBulkArchive = async () => {
    const ids = Array.from(selectedGroupIds).filter((id) =>
      eligibleGroupItems.some((a) => a.id === id),
    );
    if (ids.length === 0) return;

    try {
      setIsSubmitting(true);
      await onBulkArchive(ids);
      setBulkArchiveOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedGroupIds).filter((id) =>
      eligibleGroupItems.some((a) => a.id === id),
    );
    if (ids.length === 0) return;

    try {
      setIsSubmitting(true);
      await onBulkDelete(ids);
      setBulkDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm registrar-card">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h5 className="fw-bold mb-0">{title}</h5>

            <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
              {/* Group Action Dropdown Selector Button */}
              {eligibleGroupItems.length > 0 && (
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 rounded-3 px-3 fw-bold"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    style={{ borderRadius: "10px" }}
                  >
                    <Users size={16} />
                    <span>Select Group Actions</span>
                    <ChevronDown size={14} />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-menu show shadow border-0 position-absolute end-0 mt-1 p-2"
                      style={{
                        minWidth: "220px",
                        zIndex: 1000,
                        borderRadius: "12px",
                      }}
                    >
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 small fw-semibold"
                        onClick={() => selectOnlyByStatus("Approved")}
                        disabled={approvedItems.length === 0}
                      >
                        <CheckCircle size={15} className="text-success" />
                        <span>
                          Select All Approved ({approvedItems.length})
                        </span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 small fw-semibold"
                        onClick={() => selectOnlyByStatus("Rejected")}
                        disabled={rejectedItems.length === 0}
                      >
                        <XCircle size={15} className="text-danger" />
                        <span>
                          Select All Rejected ({rejectedItems.length})
                        </span>
                      </button>

                      <div className="dropdown-divider my-1" />

                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 small fw-semibold text-primary"
                        onClick={() => selectOnlyByStatus("Both")}
                      >
                        <Users size={15} />
                        <span>Select Both ({eligibleGroupItems.length})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Trigger Buttons for Selected Group */}
              {selectedGroupCount > 0 && (
                <>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm d-inline-flex align-items-center gap-1 rounded-pill px-3 fw-semibold"
                    onClick={() => setBulkArchiveOpen(true)}
                  >
                    <Archive size={15} />
                    <span>Archive Selected ({selectedGroupCount})</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm d-inline-flex align-items-center gap-1 rounded-pill px-3 fw-semibold"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 size={15} />
                    <span>Delete Selected ({selectedGroupCount})</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-link registrar-link-action text-muted small"
                    onClick={onDeselectAllGroup}
                  >
                    Clear Selection
                  </button>
                </>
              )}

              {selectedApprovedScheduleCount > 0 && (
                <button
                  type="button"
                  className="btn btn-link registrar-link-action"
                  onClick={onDeselectAllApproved}
                >
                  <Users size={16} />
                  <span>Deselect All Approved Schedule</span>
                </button>
              )}
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {hasItems ? (
              items.map((a) => (
                <RegistrarApplicationRow
                  key={a.id}
                  item={a}
                  onReview={onReview}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  onDelete={onDelete}
                  isApprovedSelected={
                    a.status === "Approved" &&
                    !a.scheduleSent &&
                    selectedApprovedIds.has(a.id)
                  }
                  onToggleApproved={onToggleApproved}
                  isGroupSelected={
                    (a.status === "Approved" || a.status === "Rejected") &&
                    selectedGroupIds.has(a.id)
                  }
                  onToggleGroupSelect={onToggleGroupSelect}
                  onSendSchedule={onSendSchedule}
                />
              ))
            ) : (
              <div className="users-empty-state py-5 text-center">
                <div className="users-empty-icon mb-2">📭</div>
                <h5 className="fw-semibold mb-1">No applications found</h5>
                <p className="text-muted mb-0">
                  Applications will appear here once submitted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BULK ARCHIVE MODAL */}
      {bulkArchiveOpen && (
        <div className="sec-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="sec-confirm-popup">
            <div className="sec-confirm-header d-flex align-items-center justify-content-between">
              <span>Confirm Bulk Archive</span>
              <button
                type="button"
                className="registrar-icon-btn registrar-icon-btn-sm"
                onClick={() => setBulkArchiveOpen(false)}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
            <div className="sec-confirm-body">
              <div className="fw-bold mb-1">
                Archive {selectedGroupCount} selected application(s)?
              </div>
              <div className="text-muted small">
                You can restore them later from the Archived applications modal.
              </div>
            </div>
            <div className="sec-confirm-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setBulkArchiveOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleConfirmBulkArchive}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Archiving..." : "Yes, Archive Selected"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE MODAL */}
      {bulkDeleteOpen && (
        <div className="sec-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="sec-confirm-popup">
            <div className="sec-confirm-header d-flex align-items-center justify-content-between">
              <span>Confirm Bulk Delete</span>
              <button
                type="button"
                className="registrar-icon-btn registrar-icon-btn-sm"
                onClick={() => setBulkDeleteOpen(false)}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
            <div className="sec-confirm-body">
              <div className="fw-bold mb-1">
                Permanently delete {selectedGroupCount} selected application(s)?
              </div>
              <div className="text-danger small">
                This action cannot be undone.
              </div>
            </div>
            <div className="sec-confirm-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setBulkDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmBulkDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Yes, Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
