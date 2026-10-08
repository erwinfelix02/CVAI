import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "warning" | "primary" | "success" | "muted";
};

export default function DocStatsRow({ items }: { items: StatItem[] }) {
  return (
    <div className="row g-3 g-md-4 mb-3 mb-md-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm docs-stat-card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <div className="docs-stat-label">{it.label}</div>
                  <div className={`docs-stat-value tone-${it.tone}`}>{it.value}</div>
                </div>

                <div className={`docs-stat-ic tone-${it.tone}`}>
                  <Icon size={26} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
