type Props = {
  title: string;
  started: string;
  deadline: string;
  percent: number; // 0-100
  rightLabel: string;
};

export default function EnrollmentStatusCard({
  title,
  started,
  deadline,
  percent,
  rightLabel,
}: Props) {
  return (
    <div className="card shadow-sm registrar-card">
      <div className="card-body p-3 p-md-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="d-flex align-items-center justify-content-between gap-3 mb-2 flex-wrap">
          <div className="text-muted small">Started: {started}</div>
          <div className="d-flex align-items-center gap-2">
            <span className="registrar-check">✓</span>
            <span className="fw-semibold">{rightLabel}</span>
          </div>
        </div>

        <div
          className="progress registrar-progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>

        <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
          <div className="text-muted small">Started: {started}</div>
          <div className="text-muted small">Deadline: {deadline}</div>
        </div>
      </div>
    </div>
  );
}
