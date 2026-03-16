import { Eye, Calendar, Archive, RotateCcw } from "lucide-react";
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

type Props = {
  item: ApplicationRow;
  onReview: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  isApprovedSelected: boolean;
  onToggleApproved: (id: string) => void;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationRow({
  item,
  onReview,
  onArchive,
  onUnarchive,
  isApprovedSelected,
  onToggleApproved,
  onSendSchedule,
}: Props) {
  const isApproved = item.status === "Approved";
  const isRejected = item.status === "Rejected";
  const isArchived = item.status === "Archived";
  const isScheduleSent = Boolean(item.scheduleSent);

  const canSelect = isApproved && !isScheduleSent;
  const showArchiveButton = isRejected || (isApproved && isScheduleSent);

  return (
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
            {item.id} • Submitted {item.submitted}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 registrar-app-actions">
        <StatusPill status={item.status} />

        {isApproved && !isScheduleSent && (
          <button
            type="button"
            className="btn registrar-outline-btn"
            onClick={onSendSchedule}
          >
            <Calendar size={16} />
            <span className="ms-2">Send Schedule</span>
          </button>
        )}

        {isApproved && isScheduleSent && (
          <button type="button" className="btn btn-success text-white" disabled>
            <Calendar size={16} />
            <span className="ms-2">Schedule Sent</span>
          </button>
        )}

        {showArchiveButton && !isArchived && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onArchive(item.id)}
          >
            <Archive size={16} />
            <span className="ms-2">Archive</span>
          </button>
        )}

        {isArchived && (
          <button
            type="button"
            className="btn btn-warning text-dark"
            onClick={() => onUnarchive(item.id)}
          >
            <RotateCcw size={16} />
            <span className="ms-2">Unarchive</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-light border registrar-review-btn"
          onClick={() => onReview(item.id)}
        >
          <Eye size={16} />
          <span className="ms-2">Review</span>
        </button>
      </div>
    </div>
  );
}