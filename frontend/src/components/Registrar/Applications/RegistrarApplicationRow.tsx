import {
  Eye,
  Send,
  CheckCircle2,
  Archive,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ApplicationRow, ApplicationStatus } from "./types";

function StatusPill({ status }: { status: ApplicationStatus }) {
  const cls =
    status === "Approved"
      ? "approved"
      : status === "Rejected"
      ? "rejected"
      : status === "Archived"
      ? "archived"
      : "pending";

  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

function formatDate(date: string | Date) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Props = {
  item: ApplicationRow;
  onReview: (id: string) => void;
  onArchive: (id: string) => void | Promise<void>;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  isApprovedSelected: boolean;
  onToggleApproved: (id: string) => void;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationRow({
  item,
  onReview,
  onArchive,
  onUnarchive,
  onDelete,
  isApprovedSelected,
  onToggleApproved,
  onSendSchedule,
}: Props) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const deletingRef = useRef(false);
  const archivingRef = useRef(false);

  const isApproved = item.status === "Approved";
  const isRejected = item.status === "Rejected";
  const isArchived = item.status === "Archived";
  const isScheduleSent = Boolean(item.scheduleSent);

  const canSelect = isApproved && !isScheduleSent;

  const showDeleteButton =
    !isArchived && (isRejected || (isApproved && isScheduleSent));

  const showArchiveButton =
    !isArchived && (isRejected || (isApproved && isScheduleSent));

  useEffect(() => {
    if (!deleteConfirmOpen && !archiveConfirmOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      if (deleteConfirmOpen && !deleting) {
        setDeleteConfirmOpen(false);
      }

      if (archiveConfirmOpen && !archiving) {
        setArchiveConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteConfirmOpen, archiveConfirmOpen, deleting, archiving]);

  const confirmDelete = async () => {
    if (deletingRef.current) return;

    deletingRef.current = true;
    setDeleting(true);

    try {
      await onDelete(item.id);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
      deletingRef.current = false;
    }
  };

  const confirmArchive = async () => {
    if (archivingRef.current) return;

    archivingRef.current = true;
    setArchiving(true);

    try {
      await onArchive(item.id);
      setArchiveConfirmOpen(false);
    } finally {
      setArchiving(false);
      archivingRef.current = false;
    }
  };

  return (
    <>
      <div className="registrar-app-card">
        <div className="d-flex align-items-center gap-3 min-w-0">
          {canSelect && (
            <button
              type="button"
              className={`registrar-check ${isApprovedSelected ? "checked" : ""}`}
              onClick={() => onToggleApproved(item.id)}
              aria-label="Select approved application"
            />
          )}

          <div className="registrar-avatar">{item.initials}</div>

          <div className="min-w-0">
            <div className="fw-semibold text-truncate">{item.name}</div>
            <div className="text-muted text-truncate">
              {item.program} • {item.yearLevel}
            </div>
            <div className="text-muted small text-truncate">
              {item.id} • Submitted {formatDate(item.submitted)}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 registrar-app-actions">
          <StatusPill status={item.status} />

          {isApproved && !isScheduleSent && (
            <button
              type="button"
              className="registrar-icon-btn registrar-icon-btn-primary"
              onClick={onSendSchedule}
              aria-label="Send schedule"
              title="Send Schedule"
            >
              <Send size={18} />
            </button>
          )}

          {isApproved && isScheduleSent && (
            <button
              type="button"
              className="registrar-icon-btn registrar-icon-btn-success"
              disabled
              aria-label="Schedule sent"
              title="Schedule Sent"
            >
              <CheckCircle2 size={18} />
            </button>
          )}

          {showArchiveButton && (
            <button
              type="button"
              className="registrar-icon-btn"
              onClick={() => setArchiveConfirmOpen(true)}
              disabled={archiving}
              aria-label="Archive application"
              title="Archive"
            >
              <Archive size={18} />
            </button>
          )}

          {isArchived && (
            <button
              type="button"
              className="registrar-icon-btn"
              onClick={() => onUnarchive(item.id)}
              aria-label="Unarchive application"
              title="Unarchive"
            >
              <RotateCcw size={18} />
            </button>
          )}

          <button
            type="button"
            className="registrar-icon-btn"
            onClick={() => onReview(item.id)}
            aria-label="Review application"
            title="Review"
          >
            <Eye size={18} />
          </button>

          {showDeleteButton && (
            <button
              type="button"
              className="registrar-icon-btn registrar-icon-btn-danger"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete application"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {archiveConfirmOpen && (
        <div
          className="sec-confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Archive Application"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !archiving) {
              setArchiveConfirmOpen(false);
            }
          }}
        >
          <div
            className="sec-confirm-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sec-confirm-header d-flex align-items-center justify-content-between">
              <span>Confirm Archive</span>
              <button
                type="button"
                className="registrar-icon-btn registrar-icon-btn-sm"
                onClick={() => setArchiveConfirmOpen(false)}
                disabled={archiving}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="sec-confirm-body">
              <div className="fw-bold mb-1">Archive this application?</div>
              <div className="text-muted small">
                You can restore it later from archived records.
              </div>

              <div className="mt-3 small">
                <div>
                  <span className="text-muted">Student:</span>{" "}
                  <span className="fw-semibold">{item.name}</span>
                </div>
                <div>
                  <span className="text-muted">ID:</span>{" "}
                  <span className="fw-semibold">{item.id}</span>
                </div>
                <div>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="fw-semibold">{item.status}</span>
                </div>
              </div>
            </div>

            <div className="sec-confirm-footer">
              <button
                className="btn btn-light"
                onClick={() => setArchiveConfirmOpen(false)}
                disabled={archiving}
                type="button"
              >
                Cancel
              </button>

              <button
                className="btn btn-secondary"
                onClick={confirmArchive}
                disabled={archiving}
                type="button"
              >
                {archiving ? "Archiving..." : "Yes, Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div
          className="sec-confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Delete Application"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeleteConfirmOpen(false);
            }
          }}
        >
          <div
            className="sec-confirm-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sec-confirm-header d-flex align-items-center justify-content-between">
              <span>Confirm Delete</span>
              <button
                type="button"
                className="registrar-icon-btn registrar-icon-btn-sm"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="sec-confirm-body">
              <div className="fw-bold mb-1">Delete this application?</div>
              <div className="text-muted small">
                This action cannot be undone.
              </div>

              <div className="mt-3 small">
                <div>
                  <span className="text-muted">Student:</span>{" "}
                  <span className="fw-semibold">{item.name}</span>
                </div>
                <div>
                  <span className="text-muted">ID:</span>{" "}
                  <span className="fw-semibold">{item.id}</span>
                </div>
                <div>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="fw-semibold">{item.status}</span>
                </div>
              </div>
            </div>

            <div className="sec-confirm-footer">
              <button
                className="btn btn-light"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                type="button"
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
                type="button"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}