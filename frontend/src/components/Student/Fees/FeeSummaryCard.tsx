import { AlertTriangle } from "lucide-react";

type Props = {
  semesterLabel: string;
  statusLabel: string;
  total: number;
  paid: number;
  remaining: number;
  dueLabel: string;
};

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export default function FeeSummaryCard({
  semesterLabel,
  statusLabel,
  total,
  paid,
  remaining,
  dueLabel,
}: Props) {
  const progress = Math.round((paid / total) * 100);

  return (
    <div className="card border-1 shadow-sm">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h5 className="fw-bold mb-0">{semesterLabel}</h5>
              <span className="badge rounded-pill text-bg-warning">
                {statusLabel}
              </span>
            </div>

            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-muted fw-semibold">Payment Progress</div>
                <div className="fw-semibold">{progress}%</div>
              </div>

              <div className="progress" style={{ height: 10 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              <div className="d-flex justify-content-between mt-2 small text-muted">
                <span>{peso(paid)} paid</span>
                <span>{peso(remaining)} remaining</span>
              </div>
            </div>
          </div>

          <div className="text-md-end">
            <div className="text-muted">Balance Due</div>
            <div className="display-6 fw-bold mb-1">{peso(remaining)}</div>

            <div className="small text-muted d-flex gap-2 justify-content-md-end align-items-center">
              <AlertTriangle size={16} className="text-warning" />
              <span>{dueLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
