import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export type RecentApplicationStatus = "Pending" | "Approved" | "Rejected";

export type RecentApplication = {
  initials: string;
  name: string;
  program: string;
  ref: string;
  date: string;
  status: RecentApplicationStatus;
};

type Props = {
  title: string;
  viewAllLabel: string;
  viewAllTo: string;
  items: RecentApplication[];
};

function StatusPill({ status }: { status: RecentApplicationStatus }) {
  const cls =
    status === "Approved"
      ? "approved"
      : status === "Rejected"
      ? "rejected"
      : "pending";

  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

const RecentApplicationsCard = forwardRef<HTMLDivElement, Props>(
  ({ title, viewAllLabel, viewAllTo, items }, ref) => {
    return (
      <div
        ref={ref}
        className="card shadow-sm registrar-card d-flex flex-column"
      >
        <div className="card-body p-3 p-md-4 d-flex flex-column h-100">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">{title}</h5>
            <Link to={viewAllTo} className="registrar-link">
              {viewAllLabel}
            </Link>
          </div>

          {/* Scrollable list */}
          <div className="registrar-recent-scroll flex-grow-1 d-flex flex-column gap-3">
            {items.map((a) => (
              <div key={a.ref} className="registrar-app-row">
                <div className="d-flex align-items-center gap-3 min-w-0">
                  <div className="registrar-avatar">{a.initials}</div>

                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">{a.name}</div>
                    <div className="text-muted small text-truncate">
                      {a.program}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end registrar-app-meta">
                    <div className="small text-muted">{a.ref}</div>
                    <div className="small text-muted d-flex align-items-center gap-1">
                      <Clock size={14} />
                      <span>{a.date}</span>
                    </div>
                  </div>

                  <StatusPill status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default RecentApplicationsCard;
