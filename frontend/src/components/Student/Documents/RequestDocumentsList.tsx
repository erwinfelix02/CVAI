import type { RequestDoc } from "../../../pages/Student/DocumentsPage";
import { Clock } from "lucide-react";

export default function RequestDocumentsList({
  docs,
  onRequest,
}: {
  docs: RequestDoc[];
  onRequest: (doc: RequestDoc) => void;
}) {
  return (
    <div className="card shadow-sm border-1 rounded-4">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
            <span className="fw-bold">🧾</span>
          </div>
          <h5 className="fw-bold mb-0">Request Documents</h5>
        </div>

        <div className="d-flex flex-column gap-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="border rounded-4 p-3 p-md-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3"
            >
              <div className="flex-grow-1">
                <div className="fw-semibold fs-6">{d.name}</div>
                <div className="text-muted small mt-1 d-flex flex-wrap gap-3">
                  <span className="d-inline-flex align-items-center gap-1">
                    <Clock size={16} /> {d.eta}
                  </span>
                  <span>Fee: ₱{d.fee.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary px-4 rounded-pill align-self-md-center"
                onClick={() => onRequest(d)}
                type="button"
              >
                Request
              </button>
            </div>
          ))}

          {docs.length === 0 && (
            <div className="text-center text-muted py-4">
              No documents available for request.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
