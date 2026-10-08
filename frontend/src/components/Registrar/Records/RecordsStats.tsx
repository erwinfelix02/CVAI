type Props = {
  stats: { active: number; dropped: number; total: number };
};

function StatMini({ value, label }: { value: number; label: string }) {
  return (
    <div className="card shadow-sm registrar-mini-stat h-100">
      <div className="card-body text-center py-3 d-flex flex-column justify-content-center">
        <div className="fw-bold fs-3">{value}</div>
        <div className="text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function RecordsStats({ stats }: Props) {
  return (
    <div className="row row-cols-1 row-cols-sm-3 g-3 mb-3 mb-md-4">
      <div className="col">
        <StatMini value={stats.active} label="Active" />
      </div>
      <div className="col">
        <StatMini value={stats.dropped} label="Dropped" />
      </div>
      <div className="col">
        <StatMini value={stats.total} label="Total" />
      </div>
    </div>
  );
}