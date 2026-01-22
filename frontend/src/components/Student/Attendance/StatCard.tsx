import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  iconBgClass,
  iconClass,
  value,
  label,
}: {
  icon: LucideIcon;
  iconBgClass: string; // e.g. "bg-success-subtle"
  iconClass: string;   // e.g. "text-success"
  value: string;
  label: string;
}) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`att-stat-icon ${iconBgClass}`}>
          <Icon size={22} className={iconClass} />
        </div>

        <div className="min-w-0">
          <div className="att-stat-value">{value}</div>
          <div className="text-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}
