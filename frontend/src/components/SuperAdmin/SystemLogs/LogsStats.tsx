import type { StatCard } from "./types";

export default function LogsStats({ items }: { items: StatCard[] }) {
  return (
    <div className="row g-3 mb-3">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="col-12 col-md-6 col-xl-3">
            <div className="card shadow-sm superadmin-logs-card">
              <div className="card-body p-3 d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className={`superadmin-logs-stat-ic ${s.tone}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-muted small">{s.label}</div>
                    <div className="superadmin-logs-stat-val">{s.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
