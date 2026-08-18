// ✅ src/components/DepartmentHead/Dashboard/ScheduleConflictsCard.tsx

import type { LucideIcon } from "lucide-react";

export type ConflictRow = {
  room: string;
  time: string;
  details: string;
};

interface ScheduleConflictsCardProps {
  title: string;
  badgeLabel: string;
  badgeTone?: "warning" | "danger" | "info";
  icon: LucideIcon;
  rows: ConflictRow[];
  actionLabel: string;
}

export default function ScheduleConflictsCard({
  title,
  badgeLabel,
  badgeTone = "warning",
  icon: Icon,
  rows,
  actionLabel,
}: ScheduleConflictsCardProps) {
  /* =========================================================
     BADGE STYLE
     ========================================================= */

  const badgeClass =
    badgeTone === "danger"
      ? "conflict-badge conflict-badge-danger"
      : badgeTone === "info"
      ? "conflict-badge conflict-badge-info"
      : "conflict-badge conflict-badge-warning";

  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">

          <div className="d-flex align-items-center gap-2 min-width-0">
            <Icon
              size={18}
              strokeWidth={2}
              className="flex-shrink-0"
            />

            <h5 className="fw-bold mb-0 text-truncate">
              {title}
            </h5>
          </div>

          {/* =================================================
              ISSUE PILL
              ================================================= */}

          <span className={badgeClass}>
            {badgeLabel}
          </span>
        </div>

        {/* ===================================================
            CONFLICT LIST
            =================================================== */}

        <div className="d-flex flex-column gap-3">

          {rows.map((r, idx) => (
            <div
              key={`${r.room}-${idx}`}
              className="
                rounded-4
                border
                border-warning-subtle
                bg-warning-subtle
                bg-opacity-25
                p-3
              "
            >
              {/* Room + Time */}

              <div className="d-flex align-items-center justify-content-between gap-3">

                <div className="fw-semibold text-dark">
                  {r.room}
                </div>

                <div className="text-muted small text-nowrap">
                  {r.time}
                </div>

              </div>

              {/* Details */}

              <div className="text-muted mt-1">
                {r.details}
              </div>
            </div>
          ))}

          {/* =================================================
              ACTION BUTTON
              ================================================= */}

          <button
            type="button"
            className="btn btn-light border rounded-3 mt-1"
          >
            {actionLabel}
          </button>

        </div>
      </div>
    </div>
  );
}