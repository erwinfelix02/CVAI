export default function FacultyStats() {
  return (
    <div className="row g-4 mb-4">
      <StatCard title="Total Faculty" value={3} />
      <StatCard title="Active" value={2} tone="success" />
      <StatCard title="Pending Activation" value={1} tone="warning" />
    </div>
  );
}

function StatCard({
  title,
  value,
  tone = "primary",
}: {
  title: string;
  value: number;
  tone?: "primary" | "success" | "warning";
}) {
  return (
    <div className="col-12 col-md-4">
      <div className="card stat-card shadow-sm h-100">
        <div className="card-body text-center">
          <h2 className={`fw-bold mb-1 text-${tone}`}>{value}</h2>
          <span className="text-muted">{title}</span>
        </div>
      </div>
    </div>
  );
}
