interface Props {
  title: string;
  value: string;
  change: string;
}

export default function StatCard({ title, value, change }: Props) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className="stat-card">
        <p className="stat-title">{title}</p>
        <h2 className="stat-value">{value}</h2>
        <span className="stat-change">{change}</span>
      </div>
    </div>
  );
}
