type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function ConfirmActionModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered courses-modal-dialog">
        <div className="modal-content border-0 shadow-lg courses-modal">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              disabled={isLoading}
            />
          </div>

          <div className="modal-body pt-3">
            <p className="mb-0 text-muted">{message}</p>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button className="btn btn-light" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onConfirm} disabled={isLoading}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}