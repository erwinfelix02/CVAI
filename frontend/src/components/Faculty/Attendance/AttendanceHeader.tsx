import { Download, Plus } from "lucide-react";

export default function AttendanceHeader({
  title,
  subtitle,
  onNewRecord,
  onExport,
}: {
  title: string;
  subtitle: string;
  onNewRecord: () => void;
  onExport: () => void;
}) {
  return (
    <div className="attendance-header d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-3">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>

      <div className="attendance-actions d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-light border att-btn d-inline-flex align-items-center"
          onClick={onNewRecord}
        >
          <Plus size={18} className="me-2 text-primary" />
          New Record
        </button>

        <button
          type="button"
          className="btn btn-light border att-btn d-inline-flex align-items-center"
          onClick={onExport}
        >
          <Download size={18} className="me-2 text-secondary" />
          Export
        </button>
      </div>
    </div>
  );
}