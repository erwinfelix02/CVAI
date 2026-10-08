import { CircleCheck, Download } from "lucide-react";

export type PaymentHistoryRow = {
  date: string;
  description: string;
  method: string;
  reference: string;
  amount: number;
};

type Props = { rows: PaymentHistoryRow[] };

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export default function PaymentHistoryCard({ rows }: Props) {
  return (
    <div className="card border-1 shadow-sm">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <CircleCheck size={18} className="text-success" />
            <h5 className="fw-bold mb-0">Payment History</h5>
          </div>

          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Responsive table wrapper */}
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted">
                <th style={{ minWidth: 120 }}>Date</th>
                <th style={{ minWidth: 220 }}>Description</th>
                <th style={{ minWidth: 170 }}>Method</th>
                <th style={{ minWidth: 160 }}>Reference</th>
                <th className="text-end" style={{ minWidth: 140 }}>
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={`${r.reference}-${idx}`}>
                  <td className="fw-semibold">{r.date}</td>
                  <td>{r.description}</td>
                  <td>
                    <span className="badge text-bg-light border text-dark">
                      {r.method}
                    </span>
                  </td>
                  <td className="text-muted">{r.reference}</td>
                  <td className="text-end fw-bold text-success">
                    {peso(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="text-center text-muted py-4">No payments yet.</div>
        )}
      </div>
    </div>
  );
}
