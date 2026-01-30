import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "red" | "orange";
  icon: React.ElementType;
}) {
  const Icon = icon;
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card att-stat-card">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`att-stat-ico tone-${tone}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className={`att-stat-value tone-text-${tone}`}>{value}</div>
            <div className="text-muted">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendanceStats({
  total,
  present,
  absent,
  pending,
}: {
  total: number;
  present: number;
  absent: number;
  pending: number;
}) {
  return (
    <div className="row g-3 mb-3">
      <StatCard label="Total" value={total} tone="blue" icon={Users} />
      <StatCard label="Present" value={present} tone="green" icon={CheckCircle2} />
      <StatCard label="Absent" value={absent} tone="red" icon={XCircle} />
      <StatCard label="Pending" value={pending} tone="orange" icon={Clock} />
    </div>
  );
}
