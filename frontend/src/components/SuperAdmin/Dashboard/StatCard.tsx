import type { LucideIcon } from "lucide-react";

export type StatTone = "blue" | "purple" | "green" | "orange";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: StatTone;
};

export default function StatCard({ label, value, icon: Icon, tone }: Props) {
  return (
    <div className="card shadow-sm superadmin-card h-100">
      <div className="card-body p-3 p-md-4 d-flex align-items-center justify-content-between gap-3">
        <div className="min-w-0">
          <div className="text-muted">{label}</div>
          <div className="superadmin-stat-value fw-bold">{value}</div>
        </div>

        <div className={`superadmin-stat-icon ${tone}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
