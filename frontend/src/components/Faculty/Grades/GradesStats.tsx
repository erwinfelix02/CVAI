import { CheckCircle2, CircleDashed, AlertCircle, Percent } from "lucide-react";

type Props = {
  stats: {
    totalStudents: number;
    complete: number;
    pending: number;
    classAverage: number;
  };
};

export default function GradesStats({ stats }: Props) {
  const items = [
    { label: "Total Students", value: stats.totalStudents, icon: CheckCircle2, tone: "blue" },
    { label: "Complete", value: stats.complete, icon: CircleDashed, tone: "green" },
    { label: "Pending", value: stats.pending, icon: AlertCircle, tone: "orange" },
    { label: "Class Average", value: stats.classAverage, icon: Percent, tone: "slate" },
  ] as const;

  return (
    <div className="row g-3 mb-3 mb-md-4">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-sm h-100 faculty-grade-stat">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`grade-stat-icon ${s.tone}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="fw-bold fs-4 grade-stat-value">{s.value}</div>
                  <div className="text-muted">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
