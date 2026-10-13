import type { Student } from "./types";

interface StatsCardsProps {
  studentsList?: Student[];
}

export default function StatsCards({ studentsList = [] }: StatsCardsProps) {
  const total = studentsList.length;
  
  // Active students count (status is 'good')
  const active = studentsList.filter((s) => s.status === "good").length;

  // Probation students count (checking common status fields/values)
  const probation = studentsList.filter(
    (s) => 
      s.status === "warning" || 
      s.status === "probation" || 
      s.standing === "probation" ||
      (s as Record<string, unknown>).isProbation === true
  ).length;

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
      ].map((s) => (
        <div key={s.label} className="col-12 col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex flex-column justify-content-between p-3 p-sm-4">
              <h3 className="fw-bold mb-2 text-dark fs-3 text-truncate">
                {s.value}
              </h3>
              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <span className="text-muted small fw-semibold">
                  {s.label}
                </span>
                {s.badge && (
                  <span
                    className={`badge bg-${s.tone ?? "secondary"} bg-opacity-10 text-${
                      s.tone ?? "secondary"
                    } px-2 py-1`}
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