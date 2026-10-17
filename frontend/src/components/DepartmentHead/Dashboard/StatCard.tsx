import type { LucideIcon } from "lucide-react";

export type StatCardTone = "purple" | "blue" | "green" | "orange" | "purple-light";

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
  "purple-light": { bg: "bg-purple-subtle", border: "border-purple-subtle" },
};

export default function StatCardsRow({ items }: { items: StatCardItem[] }) {
  return (
    <div className="row g-3 w-100 m-0">
      {items.map((it) => {
        const Icon = it.icon;
        const t = toneMap[it.tone];
        return (
          <div className="col-12 col-sm-6 col-xl-3 px-2" key={it.label}>
            <div className="card shadow-sm rounded-4 h-100 border-0">
              <div className="card-body d-flex align-items-center justify-content-between p-4">
                <div>
                  <div className="text-muted small mb-1">{it.label}</div>
                  <div className="display-6 fw-bold mb-0 text-dark">{it.value}</div>
                </div>
                <div
                  className={`d-inline-flex align-items-center justify-content-center rounded-4 border ${t.bg} ${t.border}`}
                  style={{ width: 54, height: 54 }}
                >
                  <Icon size={22} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}