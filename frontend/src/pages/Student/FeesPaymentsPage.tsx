import FeeSummaryCard from "../../components/Student/Fees/FeeSummaryCard";
import FeeBreakdownCard, {
  type FeeItem,
} from "../../components/Student/Fees/FeeBreakdownCard";
import PaymentOptionsCard, {
  type PaymentOption,
} from "../../components/Student/Fees/PaymentOptionsCard";
import PaymentHistoryCard, {
  type PaymentHistoryRow,
} from "../../components/Student/Fees/PaymentHistoryCard";
import { CreditCard } from "lucide-react";

export default function FeesPaymentsPage() {
  // ✅ sample data (replace with API later)
  const semesterLabel = "2nd Semester 2024-2025";
  const statusLabel = "Partial Payment";

  const totalFee = 45000;
  const paid = 25000;
  const remaining = totalFee - paid;
  const dueDateLabel = "Due by February 15, 2025";

  const feeItems: FeeItem[] = [
    { label: "Tuition Fee", amount: 35000 },
    { label: "Laboratory Fee", amount: 3500 },
    { label: "Library Fee", amount: 1500 },
    { label: "Athletic Fee", amount: 1000 },
    { label: "Student Council Fee", amount: 500 },
    { label: "Medical/Dental Fee", amount: 1500 },
    { label: "ID Fee", amount: 500 },
    { label: "Registration Fee", amount: 1500 },
  ];

  const paymentOptions: PaymentOption[] = [
    {
      title: "Online Banking",
      subtitle: "BDO, BPI, Metrobank, etc.",
      iconBg: "bg-primary-subtle",
    },
    {
      title: "Credit/Debit Card",
      subtitle: "Visa, Mastercard",
      iconBg: "bg-warning-subtle",
    },
    {
      title: "GCash / Maya",
      subtitle: "E-wallet payment",
      iconBg: "bg-success-subtle",
    },
  ];

  const history: PaymentHistoryRow[] = [
    {
      date: "Jan 10, 2025",
      description: "Partial Payment - 2nd Sem",
      method: "Online Banking",
      reference: "PAY-2025-0010",
      amount: 15000,
    },
    {
      date: "Jan 5, 2025",
      description: "Partial Payment - 2nd Sem",
      method: "Cash",
      reference: "PAY-2025-0005",
      amount: 10000,
    },
    {
      date: "Aug 15, 2024",
      description: "Full Payment - 1st Sem",
      method: "Online Banking",
      reference: "PAY-2024-0815",
      amount: 45000,
    },
    {
      date: "Jan 10, 2024",
      description: "Full Payment - 2nd Sem 2023-2024",
      method: "Credit Card",
      reference: "PAY-2024-0110",
      amount: 42000,
    },
  ];

  return (
    <div className="fees-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold mb-1">Fees &amp; Payments</h3>
          <p className="text-muted mb-0">Manage your tuition and other fees</p>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2">
          <CreditCard size={18} />
          Make Payment
        </button>
      </div>

      {/* Summary */}
      <FeeSummaryCard
        semesterLabel={semesterLabel}
        statusLabel={statusLabel}
        total={totalFee}
        paid={paid}
        remaining={remaining}
        dueLabel={dueDateLabel}
      />

      {/* Two columns (stack on mobile) */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-lg-6">
          <FeeBreakdownCard items={feeItems} total={totalFee} />
        </div>

        <div className="col-12 col-lg-6">
          <PaymentOptionsCard options={paymentOptions} />
        </div>

        <div className="col-12">
          <PaymentHistoryCard rows={history} />
        </div>
      </div>
    </div>
  );
}
