// ✅ src/components/DepartmentHead/Dashboard/NeedsAttentionCard.tsx

import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type AttentionRow = {
  id: string;
  type: "warning-banner" | "student-card";
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  studentName?: string;
  studentNo?: string;
  year?: string;
  reason?: string;
  badgeTone?: "danger" | "warning" | "info";
  badgeText?: string;
};

interface NeedsAttentionCardProps {
  title: string;
  badgeLabel: string;
  badgeTone?: "warning" | "danger" | "info";
  icon: LucideIcon;
  rows: AttentionRow[];
  actionPath?: string;
}

export default function NeedsAttentionCard({
  title,
  badgeLabel,
  badgeTone = "warning",
  icon: Icon,
  rows,
  actionPath = "/dept-head/sections",
}: NeedsAttentionCardProps) {
  const navigate = useNavigate();

  const badgeClass =
    badgeTone === "danger"
      ? "badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1"
      : badgeTone === "info"
      ? "badge bg-info-subtle text-info rounded-pill px-2.5 py-1"
      : "badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1";

  return (
    <div className="card shadow-sm rounded-4 h-100 border-0">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
            <div className="d-flex align-items-center gap-2 min-width-0">
              <Icon size={18} className="text-warning flex-shrink-0" />
              <h5 className="fw-bold mb-0 text-truncate text-dark">{title}</h5>
            </div>
            <span className={badgeClass}>{badgeLabel}</span>
          </div>

          {rows.length > 0 ? (
            <div
              className="d-flex flex-column gap-3"
              style={{ maxHeight: "310px", overflowY: "auto", scrollbarWidth: "thin" }}
            >
              {rows.map((r) => {
                if (r.type === "warning-banner") {
                  return (
                    <div
                      key={r.id}
                      className="rounded-4 border border-warning-subtle bg-warning-subtle bg-opacity-25 p-3 d-flex align-items-center justify-content-between gap-3"
                    >
                      <div>
                        <div className="fw-semibold text-dark">{r.title}</div>
                        <div className="text-muted small">{r.subtitle}</div>
                      </div>
                      {r.actionLabel && (
                        <button
                          type="button"
                          className="btn btn-light border btn-sm px-3 rounded-pill fw-medium shadow-sm"
                          onClick={() => {
                            if (r.onAction) {
                              r.onAction();
                            } else {
                              navigate(actionPath, { state: { activeTab: "bulk" } });
                            }
                          }}
                        >
                          {r.actionLabel}
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={r.id} className="rounded-4 border bg-white p-3 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-dark">{r.studentName}</span>
                        {r.studentNo && (
                          <span className="text-muted small">({r.studentNo})</span>
                        )}
                      </div>
                      <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1">
                        {r.badgeText || "Workflow Pending"}
                      </span>
                    </div>
                    <div className="text-muted small mt-1">
                      {r.year} · {r.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <h6 className="fw-semibold mb-1 text-dark">No Items Needing Attention</h6>
              <p className="small text-muted mb-0">Everything is running smoothly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}