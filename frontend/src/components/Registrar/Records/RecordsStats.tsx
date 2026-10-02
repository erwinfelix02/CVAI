type Props = {
  stats: { active: number; dropped: number; graduated: number; total: number };
};

function StatMini({ value, label }: { value: number; label: string }) {
  return (
    <div className="card shadow-sm registrar-mini-stat">
      <div className="card-body text-center py-3">
        <div className="fw-bold fs-3">{value}</div>
        <div className="text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function RecordsStats({ stats }: Props) {
  return (
    <div className="row g-3 mb-3 mb-md-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <StatMini value={stats.active} label="Active" />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <StatMini value={stats.dropped} label="Dropped" />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <StatMini value={stats.graduated} label="Graduated" />
      </div>
      <div className="col-12 col-sm-6 col-xl-3">
        <StatMini value={stats.total} label="Total" />
      </div>
    </div>
  );
}
