// ✅ src/components/DepartmentHead/Dashboard/SectionEnrollmentCard.tsx

import { Link } from "react-router-dom";

export type SectionEnrollmentRow = {
  name: string;
  room: string;
  schedule: string;
  current: number;
  max: number;
};

interface SectionEnrollmentCardProps {
  title: string;
  actionLabel?: string;
  actionPath?: string;
  onManageClick?: () => void | Promise<void>;
  rows: SectionEnrollmentRow[];
}

export default function SectionEnrollmentCard({
  title,
  actionLabel = "Manage",
  actionPath = "/dept-head/sections",
  onManageClick,
  rows,
}: SectionEnrollmentCardProps) {
  const totalCurrent = rows.reduce((acc, r) => acc + r.current, 0);
  const totalMax = rows.reduce((acc, r) => acc + r.max, 0);
  
  // Cap overall percentage at a maximum of 100%
  const rawPct = totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;
  const overallPct = Math.min(rawPct, 100);

  return (
    <div className="card shadow-sm rounded-4 h-100 border-0">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="fw-bold mb-0 text-dark">{title}</h5>
            
            {onManageClick ? (
              <button
                type="button"
                onClick={onManageClick}
                className="btn btn-link text-primary text-decoration-none fw-semibold small p-0 border-0 bg-transparent"
              >
                {actionLabel}
              </button>
            ) : (
              <Link
                to={actionPath}
                className="text-primary text-decoration-none fw-semibold small"
              >
                {actionLabel}
              </Link>
            )}
          </div>

          <div className="text-muted small mb-2 d-flex justify-content-between">
            <span>Overall capacity used</span>
            <span className="fw-semibold text-dark">
              {totalCurrent}/{totalMax} ({overallPct}%)
            </span>
          </div>

          <div className="progress mb-4" style={{ height: 6 }}>
            <div
              className="progress-bar bg-primary rounded-pill"
              role="progressbar"
              style={{ width: `${overallPct}%` }}
              aria-valuenow={overallPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {rows.length > 0 ? (
            <div
              className="d-flex flex-column gap-3 pe-1"
              style={{ maxHeight: "280px", overflowY: "auto", scrollbarWidth: "thin" }}
            >
              {rows.map((r, index) => {
                const isFull = r.current >= r.max;
                const rowPct = r.max > 0 ? Math.min(100, Math.round((r.current / r.max) * 100)) : 0;

                // Build a clean details string skipping empty fields
                const detailsText = [r.room, r.schedule].filter(Boolean).join(" • ");

                return (
                  <div key={`${r.name}-${index}`} className="pb-3 border-bottom border-light">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div>
                        <div className="fw-semibold text-dark">{r.name}</div>
                        {detailsText && <div className="text-muted small">{detailsText}</div>}
                      </div>
                      <span
                        className={`badge px-2.5 py-1.5 rounded-pill fw-medium ${
                          isFull ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                        }`}
                      >
                        {r.current}/{r.max}
                      </span>
                    </div>

                    {/* Individual Row Progress Bar */}
                    <div className="progress mt-2" style={{ height: 4 }}>
                      <div
                        className={`progress-bar rounded-pill ${isFull ? "bg-danger" : "bg-primary"}`}
                        role="progressbar"
                        style={{ width: `${rowPct}%` }}
                        aria-valuenow={rowPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <p className="small mb-0">No active sections recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}