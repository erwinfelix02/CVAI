import type { AvailableDoc } from "../../../pages/Student/DocumentsPage";
import { Eye, Download } from "lucide-react";

export default function AvailableDocumentsTable({
  docs,
  onView,
  onDownload,
}: {
  docs: AvailableDoc[];
  onView: (doc: AvailableDoc) => void;
  onDownload: (doc: AvailableDoc) => void;
}) {
  return (
    <div className="card shadow-sm border-1 rounded-4">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
            <span className="fw-bold">📄</span>
          </div>
          <h5 className="fw-bold mb-0">Available Documents</h5>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th style={{ minWidth: 260 }}>Document Name</th>
                <th>Type</th>
                <th>Size</th>
                <th style={{ minWidth: 140 }}>Last Updated</th>
                <th className="text-end" style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.name}</td>
                  <td>
                    <span className="badge rounded-pill text-bg-light border text-dark">
                      {d.type}
                    </span>
                  </td>
                  <td className="text-muted">{d.size}</td>
                  <td className="text-muted">{d.lastUpdated}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-link p-0 me-3"
                      onClick={() => onView(d)}
                      aria-label="View"
                      type="button"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn btn-link p-0"
                      onClick={() => onDownload(d)}
                      aria-label="Download"
                      type="button"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No available documents.
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
