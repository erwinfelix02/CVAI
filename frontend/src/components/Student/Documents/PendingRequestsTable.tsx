import type { PendingDoc } from "../../../pages/Student/DocumentsPage";
import { Clock } from "lucide-react";

function StatusPill({ status }: { status: PendingDoc["status"] }) {
  if (status === "Ready for Pickup") {
    return <span className="badge rounded-pill text-bg-success">✓ Ready for Pickup</span>;
  }
  return <span className="badge rounded-pill text-bg-warning">⏳ Processing</span>;
}

export default function PendingRequestsTable({ docs }: { docs: PendingDoc[] }) {
  return (
    <div className="card shadow-sm border-1 rounded-4">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
            <Clock size={18} />
          </div>
          <h5 className="fw-bold mb-0">Pending Requests</h5>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th style={{ minWidth: 260 }}>Document</th>
                <th style={{ minWidth: 140 }}>Request Date</th>
                <th style={{ minWidth: 140 }}>Expected Date</th>
                <th className="text-end" style={{ minWidth: 160 }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.name}</td>
                  <td className="text-muted">{d.requestDate}</td>
                  <td className="text-muted">{d.expectedDate}</td>
                  <td className="text-end">
                    <StatusPill status={d.status} />
                  </td>
                </tr>
              ))}

              {docs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No pending requests.
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
