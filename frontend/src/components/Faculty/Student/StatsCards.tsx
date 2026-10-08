import type { Student } from "./types";

interface StatsCardsProps {
  studentsList?: Student[];
}

export default function StatsCards({ studentsList = [] }: StatsCardsProps) {
  const total = studentsList.length;
  const active = studentsList.filter((s) => s.status === "good").length;
  const probation = studentsList.filter((s) => s.status === "warning").length;

  const avgGpa =
    total > 0
      ? (
          studentsList.reduce((acc, s) => acc + (s.gpa || 0), 0) / total
        ).toFixed(2)
      : "0.00";

  return (
    <div className="row g-3 mb-4">
      {[
        { label: "Total Students", value: total },
        { label: "Active", value: active, badge: "Good", tone: "success" },
        {
          label: "Probation",
          value: probation,
          badge: "Warning",
          tone: "warning",
        },
        { label: "Avg. GPA", value: avgGpa, badge: "Class" },
      ].map((s) => (
        <div key={s.label} className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="fw-bold">{s.value}</h4>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{s.label}</span>
                {s.badge && (
                  <span
                    className={`badge bg-${s.tone ?? "secondary"} bg-opacity-10 text-${
                      s.tone ?? "secondary"
                    }`}
                  >
                    {s.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}