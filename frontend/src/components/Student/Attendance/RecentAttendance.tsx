import { Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { RecentAttendanceRow } from "../../../pages/Student/AttendancePage";

function statusBadge(status: RecentAttendanceRow["status"]) {
  if (status === "Present")
    return (
      <span className="badge rounded-pill text-bg-success-subtle border border-success-subtle text-success d-inline-flex align-items-center gap-1 px-3 py-2">
        <CheckCircle2 size={16} />
        Present
      </span>
    );

  if (status === "Late")
    return (
      <span className="badge rounded-pill text-bg-warning-subtle border border-warning-subtle text-warning d-inline-flex align-items-center gap-1 px-3 py-2">
        <AlertCircle size={16} />
        Late
      </span>
    );

  return (
    <span className="badge rounded-pill text-bg-danger-subtle border border-danger-subtle text-danger d-inline-flex align-items-center gap-1 px-3 py-2">
      <XCircle size={16} />
      Absent
    </span>
  );
}

export default function RecentAttendance({ rows }: { rows: RecentAttendanceRow[] }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Clock size={20} className="text-primary" />
          <h4 className="fw-bold mb-0">Recent Attendance</h4>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted">
                <th style={{ minWidth: 150 }}>Date</th>
                <th style={{ minWidth: 220 }}>Subject</th>
                <th style={{ minWidth: 140 }}>Time In</th>
                <th className="text-end" style={{ minWidth: 160 }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={`${r.date}-${r.subject}-${idx}`}>
                  <td className="fw-semibold">{r.date}</td>
                  <td>{r.subject}</td>
                  <td>{r.timeIn}</td>
                  <td className="text-end">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
