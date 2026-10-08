import { Building2, CreditCard, Smartphone, ChevronRight } from "lucide-react";

export type PaymentOption = {
  title: "Online Banking" | "Credit/Debit Card" | "GCash / Maya";
  subtitle: string;
  iconBg: string; // "bg-primary-subtle"
};

type Props = { options: PaymentOption[] };

function OptionIcon({ title }: { title: PaymentOption["title"] }) {
  if (title === "Online Banking") return <Building2 size={18} />;
  if (title === "Credit/Debit Card") return <CreditCard size={18} />;
  return <Smartphone size={18} />;
}

export default function PaymentOptionsCard({ options }: Props) {
  return (
    <div className="card border-1 shadow-sm h-100">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CreditCard size={18} className="text-primary" />
          <h5 className="fw-bold mb-0">Payment Options</h5>
        </div>

        <div className="d-grid gap-3">
          {options.map((op) => (
            <button
              key={op.title}
              className="btn btn-light border text-start p-3 d-flex align-items-center gap-3"
              style={{ borderRadius: 14 }}
              type="button"
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${op.iconBg}`}
                style={{ width: 42, height: 42, flex: "0 0 auto" }}
              >
                <span className="text-primary">
                  <OptionIcon title={op.title} />
                </span>
              </div>

              <div className="flex-grow-1">
                <div className="fw-semibold">{op.title}</div>
                <div className="text-muted small">{op.subtitle}</div>
              </div>

              <ChevronRight size={18} className="text-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
