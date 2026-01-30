import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: LucideIcon;
  onAction: () => void;
};

export default function RecordsHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon: Icon,
  onAction,
}: Props) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>

      <button
        type="button"
        className="btn btn-primary d-inline-flex align-items-center gap-2 registrar-export-btn"
        onClick={onAction}
      >
        <Icon size={18} />
        {actionLabel}
      </button>
    </div>
  );
}
