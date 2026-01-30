import { CheckCircle2, AlertTriangle, XCircle, User } from "lucide-react";
import type { LogRow } from "./types";

function RolePill({ role }: { role: LogRow["role"] }) {
  const cls =
    role === "admin" ? "admin" : role === "faculty" ? "faculty" : role === "student" ? "student" : "neutral";
  return <span className={`superadmin-logs-pill role ${cls}`}>{role}</span>;
}

function TypePill({ type }: { type: LogRow["type"] }) {
  const cls = type === "Auth" ? "auth" : type === "Data" ? "data" : type === "Security" ? "security" : "system";
  return <span className={`superadmin-logs-pill type ${cls}`}>{type}</span>;
}

function StatusPill({ status }: { status: LogRow["status"] }) {
  const Icon = status === "success" ? CheckCircle2 : status === "warning" ? AlertTriangle : XCircle;
  return (
    <span className={`superadmin-logs-pill status ${status}`}>
      <Icon size={16} className="me-2" />
      {status}
    </span>
  );
}

export default function LogsTable({ rows }: { rows: LogRow[] }) {
  return (
    <div className="card shadow-sm superadmin-logs-card">
      <div className="card-body p-0">
        <div className="table-responsive superadmin-logs-tablewrap">
          <table className="table align-middle mb-0 superadmin-logs-table">
            <thead>
              <tr>
                <th className="ps-4">Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Type</th>
                <th>Details</th>
                <th>IP Address</th>
                <th className="pe-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="ps-4">
                    <div className="text-muted small">{r.date}</div>
                    <div className="text-muted small">{r.time}</div>
                  </td>
                  <td className="fw-semibold">{r.action}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="superadmin-logs-useric">
                        <User size={14} />
                      </span>
                      <span className="fw-semibold">{r.user}</span>
                      <RolePill role={r.role} />
                    </div>
                  </td>
                  <td><TypePill type={r.type} /></td>
                  <td className="text-muted superadmin-logs-details">{r.details}</td>
                  <td className="text-muted superadmin-logs-mono">{r.ip}</td>
                  <td className="pe-4"><StatusPill status={r.status} /></td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
