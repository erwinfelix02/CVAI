import { Eye, Calendar } from "lucide-react";
import type { ApplicationRow, ApplicationStatus } from "./types";

function StatusPill({ status }: { status: ApplicationStatus }) {
  const cls =
    status === "Approved"
      ? "approved"
      : status === "Rejected"
        ? "rejected"
        : "pending";
  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

type Props = {
  item: ApplicationRow;
  onReview: (id: string) => void;
  isApprovedSelected: boolean;
  onToggleApproved: (id: string) => void;
  onSendSchedule: () => void;
};

export default function RegistrarApplicationRow({
  item,
  onReview,
  isApprovedSelected,
  onToggleApproved,
  onSendSchedule,
}: Props) {
  const isApproved = item.status === "Approved";
  const isScheduleSent = Boolean(item.scheduleSent);

  const canSelect = isApproved && !isScheduleSent;
  const canSendSchedule = isApproved && !isScheduleSent;

  return (
    <div className="registrar-app-card">
      <div className="d-flex align-items-center gap-3 min-w-0">
        {/* ✅ checkbox only for approved AND not sent */}
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

        {/* ✅ Button changes when schedule is sent */}
        {isApproved && (
          <button
            type="button"
            className={`btn ${
              isScheduleSent
                ? "btn-success text-white"
                : "registrar-outline-btn"
            }`}
            onClick={canSendSchedule ? onSendSchedule : undefined}
            disabled={!canSendSchedule}
          >
            <Calendar size={16} />
            <span className="ms-2">
              {isScheduleSent ? "Schedule Sent" : "Send Schedule"}
            </span>
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
