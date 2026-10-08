import type { LucideIcon } from "lucide-react";

export type StatTone = "blue" | "orange" | "green" | "red";

export type Props = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: StatTone;
};

export default function StatCard({ label, value, helper, icon: Icon, tone }: Props) {
  return (
    <div className="card shadow-sm registrar-stat h-100">
      <div className="card-body p-3 p-md-4 d-flex align-items-center justify-content-between gap-3">
        <div className="min-w-0">
          <div className="text-muted">{label}</div>
          <div className="fw-bold display-6 registrar-stat-value">{value}</div>
          <div className="text-muted small registrar-stat-helper">{helper}</div>
        </div>

        <div className={`registrar-stat-icon ${tone ?? ""}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
