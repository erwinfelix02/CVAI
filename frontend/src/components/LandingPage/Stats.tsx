import "../../styles/stats.css";

export function Stats() {
  const stats = [
    { label: "Students Helped", value: "10K+" },
    { label: "Questions Answered", value: "50K+" },
    { label: "Student Rating", value: "4.9" },
    { label: "Availability", value: "24/7" },
  ];

  return (
    <section className="stats-section">
      <div className="container py-5">
        <div className="stats-inner mx-auto">
          <div className="row text-center">
            {stats.map((s) => (
              <div key={s.label} className="col-6 col-md-3 mb-4 stats-item">
                <div className="stats-value">{s.value}</div>
                <div className="stats-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
