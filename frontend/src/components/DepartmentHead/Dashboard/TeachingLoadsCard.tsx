// ✅ src/components/DepartmentHead/Dashboard/TeachingLoadsCard.tsx
export type TeachingLoadRow = {
  name: string;
  dept: string;
  current: number;
  max: number;
  tone: "ok" | "danger";
};

export default function TeachingLoadsCard({
  title,
  actionLabel,
  actionIcon: ActionIcon,
  rows,
}: {
  title: string;
  actionLabel: string;
  actionIcon: React.ElementType;
  rows: TeachingLoadRow[];
}) {
  return (
    <div className="card shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2">
            {actionLabel} <ActionIcon size={18} />
          </button>
        </div>

        <div className="d-flex flex-column gap-4">
          {rows.map((r) => {
            const pct = Math.min(100, Math.round((r.current / r.max) * 100));
            const barClass =
              r.tone === "danger" ? "bg-danger" : "bg-primary";

            const pillClass =
              r.tone === "danger"
                ? "text-bg-danger-subtle border border-danger-subtle"
                : "text-bg-success-subtle border border-success-subtle";

            return (
              <div key={r.name}>
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <div className="fw-semibold">{r.name}</div>
                    <div className="text-muted">{r.dept}</div>
                  </div>

                  <span className={`badge rounded-pill ${pillClass}`}>
                    {r.current}/{r.max} hrs
                  </span>
                </div>

                <div className="progress mt-2" style={{ height: 10 }}>
                  <div
                    className={`progress-bar ${barClass}`}
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
      </div>
    </div>
  );
}
