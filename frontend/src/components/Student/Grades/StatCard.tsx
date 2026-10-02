import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  tone,
  value,
  label,
  bigTitle = false,
}: {
  icon: LucideIcon;
  tone: "neutral" | "blue" | "green" | "orange";
  value: string;
  label: string;
  bigTitle?: boolean;
}) {
  return (
    <div className="card shadow-sm grades-stat h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`grades-stat-icon ${tone}`}>
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <div className={`grades-stat-value ${bigTitle ? "big" : ""}`}>
            {value}
          </div>
          <div className="text-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}
