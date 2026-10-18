type Props = {
  stats: { active: number; dropped: number; total: number };
  onCardClick?: (type: "active" | "dropped" | "total") => void;
};

function StatMini({ 
  value, 
  label, 
  clickable = false, 
  onClick 
}: { 
  value: number; 
  label: string; 
  clickable?: boolean; 
  onClick?: () => void; 
}) {
  return (
    <div 
      className={`card shadow-sm registrar-mini-stat h-100 ${clickable ? "cursor-pointer border-danger-subtle" : ""}`}
      onClick={onClick}
      style={clickable ? { cursor: "pointer", transition: "all 0.2s ease" } : undefined}
      title={clickable ? "Click to view dropped students list" : undefined}
    >
      <div className="card-body text-center py-3 d-flex flex-column justify-content-center">
        <div className={`fw-bold fs-3 ${clickable ? "text-danger" : ""}`}>{value}</div>
        <div className="text-muted">{label}</div>
        {clickable && <div className="text-danger small mt-1" style={{ fontSize: "11px" }}>View list &rarr;</div>}
      </div>
    </div>
  );
}

export default function RecordsStats({ stats, onCardClick }: Props) {
  return (
    <div className="row row-cols-1 row-cols-sm-3 g-3 mb-3 mb-md-4">
      <div className="col">
        <StatMini value={stats.active} label="Active" />
      </div>
      <div className="col">
        <StatMini 
          value={stats.dropped} 
          label="Dropped" 
          clickable={true} 
          onClick={() => onCardClick?.("dropped")} 
        />
      </div>
      <div className="col">
        <StatMini value={stats.total} label="Total" />
      </div>
    </div>
  );
}