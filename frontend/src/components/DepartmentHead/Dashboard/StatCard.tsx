// ✅ src/components/DepartmentHead/Dashboard/StatCardsRow.tsx
import type { LucideIcon } from "lucide-react";

export type StatCardTone = "purple" | "blue" | "green" | "orange";

export type StatCardItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatCardTone;
};

const toneMap: Record<StatCardTone, { bg: string; border: string }> = {
  purple: { bg: "bg-purple-subtle", border: "border-purple-subtle" },
  blue: { bg: "bg-primary-subtle", border: "border-primary-subtle" },
  green: { bg: "bg-success-subtle", border: "border-success-subtle" },
  orange: { bg: "bg-warning-subtle", border: "border-warning-subtle" },
};

export default function StatCardsRow({ items }: { items: StatCardItem[] }) {
  return (
    <div className="row g-3">
      {items.map((it) => {
        const Icon = it.icon;
        const t = toneMap[it.tone];
        return (
          <div className="col-12 col-sm-6 col-xl-3" key={it.label}>
            <div className="card shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <div className="text-muted mb-1">{it.label}</div>
                  <div className="display-6 fw-bold mb-0">{it.value}</div>
                </div>

                <div
                  className={`d-inline-flex align-items-center justify-content-center rounded-4 border ${t.bg} ${t.border}`}
                  style={{ width: 54, height: 54 }}
                >
                  <Icon size={22} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
