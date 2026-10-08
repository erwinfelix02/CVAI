import { ReceiptText } from "lucide-react";

export type FeeItem = { label: string; amount: number };

type Props = {
  items: FeeItem[];
  total: number;
};

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export default function FeeBreakdownCard({ items, total }: Props) {
  return (
    <div className="card border-1 shadow-sm h-100">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ReceiptText size={18} className="text-primary" />
          <h5 className="fw-bold mb-0">Fee Breakdown</h5>
        </div>

        <div className="list-group list-group-flush">
          {items.map((it) => (
            <div
              key={it.label}
              className="list-group-item px-0 d-flex justify-content-between align-items-center"
            >
              <div className="text-truncate">{it.label}</div>
              <div className="fw-semibold">{peso(it.amount)}</div>
            </div>
          ))}

          <div className="list-group-item px-0 d-flex justify-content-between align-items-center pt-3">
            <div className="fw-bold">Total</div>
            <div className="fw-bold text-primary">{peso(total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
