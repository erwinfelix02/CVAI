type Props = {
  totalSections: number;
  totalEnrolled: number;
  totalCapacity: number;
  utilization: number; // 0-100
};

export default function SectionStatsRow({
  totalSections,
  totalEnrolled,
  totalCapacity,
  utilization,
}: Props) {
  return (
    <div className="row g-3 g-md-4 mb-3 mb-md-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm sections-stat-card">
          <div className="card-body text-center py-4">
            <div className="sections-stat-value">{totalSections}</div>
            <div className="text-muted">Total Sections</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm sections-stat-card">
          <div className="card-body text-center py-4">
            <div className="sections-stat-value">{totalEnrolled}</div>
            <div className="text-muted">Total Enrolled</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm sections-stat-card">
          <div className="card-body text-center py-4">
            <div className="sections-stat-value">{totalCapacity}</div>
            <div className="text-muted">Total Capacity</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm sections-stat-card">
          <div className="card-body text-center py-4">
            <div className="sections-stat-value">{utilization}%</div>
            <div className="text-muted">Utilization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
