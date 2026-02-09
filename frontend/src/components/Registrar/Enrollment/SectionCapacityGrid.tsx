const sections = [
  {
    code: "BSCS-1A",
    program: "BS Computer Science",
    adviser: "Dr. Maria Garcia",
    used: 35,
    total: 40,
  },
  {
    code: "BSCS-1B",
    program: "BS Computer Science",
    adviser: "Prof. Juan Santos",
    used: 38,
    total: 40,
  },
  {
    code: "BSIT-1A",
    program: "BS Information Technology",
    adviser: "Dr. Ana Cruz",
    used: 40,
    total: 45,
  },
  {
    code: "BSCE-2A",
    program: "BS Civil Engineering",
    adviser: "Engr. Carlos Reyes",
    used: 30,
    total: 35,
  },
];

export default function SectionCapacityGrid() {
  return (
    <div className="card shadow-sm enroll-card">
      <div className="card-body">
        <h5 className="fw-bold mb-3">Section Capacity</h5>

        <div className="row g-3">
          {sections.map((s) => {
            const percent = Math.round((s.used / s.total) * 100);

            return (
              <div key={s.code} className="col-12 col-md-6">
                <div className="capacity-card">
                 <div className="d-flex align-items-start justify-content-between gap-2">
  <div>
    <div className="fw-bold">{s.code}</div>
    <div className="text-muted">{s.program}</div>
  </div>

  <span className="capacity-pill">
    {s.used}/{s.total}
  </span>
</div>


                  <div className="progress my-2">
                    <div
                      className={`progress-bar ${
                        percent >= 90 ? "bg-danger" : "bg-warning"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-muted small">
                    Adviser: {s.adviser}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
