import { useEffect } from "react";
import { X, Send, Mail, User, IdCard } from "lucide-react";
import type { UserRow } from "../../../pages/SuperAdmin/UsersPage";

type Props = {
  open: boolean;
  user: UserRow | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export default function SendCredentialsModal({
  open,
  user,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose, isLoading]);

  if (!open || !user) return null;

  return (
    <div
      className="users-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="users-modal users-modal-compact modern-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Send Login Credentials"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="users-modal-header modern-header">
          <div>
            <h3 className="modal-title">Send Login Credentials</h3>
            <p className="modal-subtitle">
              The user will receive a temporary password via email. The account
              will be activated immediately.
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn app-icon-btn app-icon-btn-sm"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="users-modal-body">
          <div className="modern-info-card">
            <div className="info-row">
              <User size={16} />
              <span className="info-label">Name</span>
              <span className="info-value">{user.name}</span>
            </div>

            <div className="info-row">
              <Mail size={16} />
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>

            <div className="info-row">
              <IdCard size={16} />
              <span className="info-label">ID</span>
              <span className="info-value">{user.userCode}</span>
            </div>
          </div>

          <div className="modern-notice-box">
            The user will be required to change their password upon first login.
          </div>
        </div>

        <div className="users-modal-footer modern-footer">
          <button
            type="button"
            className="btn btn-light modern-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary modern-send-btn"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Send size={16} />
            {isLoading ? "Sending..." : "Send & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
