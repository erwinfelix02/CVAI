import { Eye, Clock } from "lucide-react";
import type { DocRequest, DocStatus } from "./types";

function Peso({ value }: { value: number }) {
  return <span>₱{value.toLocaleString()}</span>;
}

function StatusPill({ status }: { status: DocStatus }) {
  const cls =
    status === "Ready" ? "ready" : status === "Processing" ? "processing" : "pending";

  const Icon = status === "Pending" ? Clock : null;

  return (
    <span className={`docs-status ${cls}`}>
      {Icon ? <Icon size={14} /> : null}
      <span>{status}</span>
    </span>
  );
}

export default function DocRequestsTable({
  rows,
  onView,
}: {
  rows: DocRequest[];
  onView: (id: string) => void;
}) {
  return (
    <div className="card shadow-sm docs-table-card">
      <div className="card-body p-0">
        {/* ✅ responsive table wrapper */}
        <div className="table-responsive">
          <table className="table mb-0 align-middle docs-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Document</th>
                <th className="text-center">Copies</th>
                <th className="text-center">Fee</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="fw-semibold">{r.id}</td>

                  <td>
                    <div className="fw-semibold">{r.studentName}</div>
                    <div className="text-muted small">{r.studentNo}</div>
                  </td>

                  <td>
                    <div className="fw-semibold">{r.documentName}</div>
                    <div className="text-muted small">{r.purpose}</div>
                  </td>

                  <td className="text-center">{r.copies}</td>

                  <td className="text-center">
                    <Peso value={r.fee} />
                  </td>

                  <td>
                    <StatusPill status={r.status} />
                  </td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-link docs-action"
                      onClick={() => onView(r.id)}
                    >
                      <Eye size={18} />
                      <span className="ms-2">View</span>
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No matching requests.
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
