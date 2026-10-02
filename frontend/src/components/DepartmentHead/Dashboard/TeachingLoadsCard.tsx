// ✅ src/components/DepartmentHead/Dashboard/TeachingLoadsCard.tsx

import { Users } from "lucide-react";

export type TeachingLoadRow = {
  name: string;
  dept: string;
  current: number;
  max: number;
  tone: "ok" | "danger";
};

interface TeachingLoadsCardProps {
  title: string;
  rows: TeachingLoadRow[];
}

export default function TeachingLoadsCard({
  title,
  rows,
}: TeachingLoadsCardProps) {
  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          {/* HEADER */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">{title}</h5>
          </div>

          {/* TEACHING LOADS OR EMPTY STATE */}
          {rows.length > 0 ? (
            <div
              className="d-flex flex-column gap-4 pe-2"
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              {rows.map((r, index) => {
                const pct =
                  r.max > 0
                    ? Math.min(100, Math.round((r.current / r.max) * 100))
                    : 0;

                const isDanger = r.tone === "danger";

                return (
                  <div key={`${r.name}-${index}`}>
                    {/* FACULTY INFORMATION */}
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div className="min-width-0">
                        <div className="fw-semibold">{r.name}</div>
                        <div className="text-muted small">{r.dept}</div>
                      </div>

                      {/* LOAD PILL */}
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

                    {/* PROGRESS BAR */}
                    <div className="progress mt-2" style={{ height: 10 }}>
                      <div
                        className={`progress-bar ${
                          isDanger ? "bg-danger" : "bg-primary"
                        }`}
                        role="progressbar"
                        style={{ width: `${pct}%` }}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted my-auto">
              <div className="bg-light d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-2">
                <Users size={28} className="text-secondary" />
              </div>
              <h6 className="fw-semibold mb-1 text-dark">
                No Teaching Loads Recorded
              </h6>
              <p className="small text-muted mb-0">
                There are currently no active teaching loads assigned to faculty in
                this department.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}