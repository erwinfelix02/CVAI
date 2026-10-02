type Props = {
  title: string;
  subtitle: string;

  // ✅ optional now
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
};

export default function RoleHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
}: Props) {
  const showAction = Boolean(actionLabel) && typeof onAction === "function";

  return (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <p className="text-muted mb-0">{subtitle}</p>
      </div>

      {/* ✅ render button ONLY if needed */}
      {showAction && (
        <button
          type="button"
          className="btn btn-primary superadmin-add-btn d-flex align-items-center gap-2"
          onClick={onAction}
        >
          {actionIcon}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
