import { RefreshCw, Download, Activity } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  onExport: () => void;
  refreshing?: boolean;
};

export default function LogsHeader({
  title,
  subtitle,
  onRefresh,
  onExport,
  refreshing = false,
}: Props) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3">
      <div className="d-flex align-items-start gap-2">
        <div className="superadmin-logs-titleicon">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="fw-bold mb-1">{title}</h2>
          <p className="text-muted mb-0">{subtitle}</p>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          className="btn btn-light border superadmin-logs-btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={18}
            className={`me-2 ${refreshing ? "superadmin-logs-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

        <button
          className="btn btn-light border superadmin-logs-btn"
          onClick={onExport}
        >
          <Download size={18} className="me-2" />
          Export Logs
        </button>
      </div>
    </div>
  );
}