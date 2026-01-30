import { Eye } from "lucide-react";
import type { ApplicationRow, ApplicationStatus } from "./types";

function StatusPill({ status }: { status: ApplicationStatus }) {
  const cls =
    status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : "pending";
  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

type Props = {
  item: ApplicationRow;
  onReview: (id: string) => void;
};

export default function RegistrarApplicationRow({ item, onReview }: Props) {
  return (
    <div className="registrar-app-card">
      <div className="d-flex align-items-center gap-3 min-w-0">
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
