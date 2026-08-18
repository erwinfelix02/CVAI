// ✅ src/components/DepartmentHead/Dashboard/TeachingLoadsCard.tsx

import type { ElementType } from "react";

export type TeachingLoadRow = {
  name: string;
  dept: string;
  current: number;
  max: number;
  tone: "ok" | "danger";
};

interface TeachingLoadsCardProps {
  title: string;
  actionLabel: string;
  actionIcon: ElementType;
  rows: TeachingLoadRow[];
}

export default function TeachingLoadsCard({
  title,
  actionLabel,
  actionIcon: ActionIcon,
  rows,
}: TeachingLoadsCardProps) {
  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="d-flex align-items-center justify-content-between mb-3 gap-3">
          <h5 className="fw-bold mb-0">
            {title}
          </h5>

          <button
            type="button"
            className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2 flex-shrink-0"
          >
            {actionLabel}

            <ActionIcon size={18} />
          </button>
        </div>

        {/* =====================================================
            TEACHING LOADS
        ===================================================== */}

        <div className="d-flex flex-column gap-4">

          {rows.map((r) => {
            const pct =
              r.max > 0
                ? Math.min(
                    100,
                    Math.round((r.current / r.max) * 100)
                  )
                : 0;

            const isDanger = r.tone === "danger";

            return (
              <div key={r.name}>

                {/* =================================================
                    FACULTY INFORMATION
                ================================================= */}

                <div className="d-flex align-items-start justify-content-between gap-3">

                  <div className="min-width-0">
                    <div className="fw-semibold">
                      {r.name}
                    </div>

                    <div className="text-muted">
                      {r.dept}
                    </div>
                  </div>

                  {/* =================================================
                      LOAD PILL
                  ================================================= */}

                  <span
                    className={`teaching-load-pill ${
                      isDanger
                        ? "teaching-load-pill-danger"
                        : "teaching-load-pill-ok"
                    }`}
                  >
                    {r.current}/{r.max} hrs
                  </span>

                </div>

                {/* =================================================
                    PROGRESS BAR
                ================================================= */}

                <div
                  className="progress mt-2"
                  style={{ height: 10 }}
                >
                  <div
                    className={`progress-bar ${
                      isDanger
                        ? "bg-danger"
                        : "bg-primary"
                    }`}
                    role="progressbar"
                    style={{
                      width: `${pct}%`,
                    }}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}