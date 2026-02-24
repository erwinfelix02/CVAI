import  { forwardRef } from "react";
import { Link } from "react-router-dom";

export type RecentApplication = {
  initials: string;
  name: string;
  program: string;
  ref: string;
  date: string;
  status: "pending" | "approved" | "rejected" | string;
};

export type Props = {
  title: string;
  viewAllLabel?: string;
  viewAllTo?: string;
  items: RecentApplication[];
};

const RecentApplicationsCard = forwardRef<HTMLDivElement, Props>(
  ({ title, viewAllLabel, viewAllTo, items }, ref) => {
    return (
      <div className="card registrar-card shadow-sm border-0 h-100" ref={ref}>
        <div className="card-body p-4 d-flex flex-column">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">{title}</h5>

            {viewAllLabel && viewAllTo && (
              <Link to={viewAllTo} className="registrar-link">
                {viewAllLabel}
              </Link>
            )}
          </div>

          {/* ✅ EMPTY STATE */}
          {items.length === 0 ? (
            <div className="registrar-empty-state flex-grow-1">
              <div className="registrar-empty-icon">📭</div>
              <h6 className="fw-semibold mb-1">No recent applications</h6>
              <p className="text-muted mb-0">
                New preregistrations will appear here once submitted.
              </p>
            </div>
          ) : (
            // ✅ LIST
            <div className="registrar-recent-scroll flex-grow-1">
              <div className="d-flex flex-column gap-2">
                {items.map((a) => (
                  <div key={a.ref} className="registrar-app-row">
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <div className="registrar-avatar">{a.initials}</div>

                      <div className="min-w-0">
                        <div className="fw-semibold text-truncate">{a.name}</div>
                        <div className="text-muted small text-truncate">
                          {a.program} • {a.ref}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-muted small text-end registrar-app-meta">
                        <div>{a.date}</div>
                      </div>

                      <span className={`registrar-status ${a.status}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

RecentApplicationsCard.displayName = "RecentApplicationsCard";
export default RecentApplicationsCard;