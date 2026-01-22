export default function StatsCards() {
  return (
    <div className="row g-3 mb-4">
      {[
        { label: "Total Students", value: 6 },
        { label: "Active", value: 5, badge: "Good", tone: "success" },
        { label: "Probation", value: 1, badge: "Warning", tone: "warning" },
        { label: "Avg. GPA", value: "3.42", badge: "Class" },
      ].map((s) => (
        <div key={s.label} className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="fw-bold">{s.value}</h4>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{s.label}</span>
                {s.badge && (
                  <span className={`badge bg-${s.tone ?? "secondary"} bg-opacity-10 text-${s.tone ?? "secondary"}`}>
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
