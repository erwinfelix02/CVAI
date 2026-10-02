import { useEffect, useState, useMemo } from "react";
import { X, Phone, Mail, Hash, AlertTriangle } from "lucide-react";
import type { UserItem } from "./types";

type Props = {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
  onSave: (patch: Partial<UserItem>) => void;
};

export default function EditRoleUserModal({
  open,
  user,
  onClose,
  onSave,
}: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Initialize input state when modal opens or target user changes
  useEffect(() => {
    if (!open || !user) return;

    setEmail(user.email || "");
    setPhone(user.phone || "");
    setConfirmSave(false);
    setConfirmDiscard(false);
  }, [open, user]);

  // Check if form state differs from original user data
  const hasUnsavedChanges = useMemo(() => {
    if (!user) return false;
    const initialEmail = user.email || "";
    const initialPhone = user.phone || "";

    return email.trim() !== initialEmail || phone.trim() !== initialPhone;
  }, [email, phone, user]);

  // Request close: show discard prompt if edited, otherwise close directly
  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  // Intercept keyboard Escape key based on active modal layer
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmSave) {
          setConfirmSave(false);
        } else if (confirmDiscard) {
          setConfirmDiscard(false);
        } else {
          handleRequestClose();
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, confirmSave, confirmDiscard, hasUnsavedChanges]);

  if (!open || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      setConfirmSave(true);
    } else {
      onClose();
    }
  };

  const confirmSubmit = () => {
    onSave({
      email: email.trim(),
      phone: phone.trim(),
    });

    setConfirmSave(false);
  };

  return (
    <>
      {/* MAIN EDIT MODAL */}
      <div className="rbac-backdrop" onMouseDown={handleRequestClose}>
        <div
          className="rbac-modal rbac-modal-wide"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="rbac-x"
            onClick={handleRequestClose}
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>

          <div className="rbac-edit-title">
            <div className="fw-bold">Edit User</div>
            <div className="text-muted">
              Update the selected user's contact information.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
              <label className="form-label fw-semibold">User</label>
              <input className="form-control" value={user.fullName} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <Hash size={16} />
                User ID
              </label>
              <input className="form-control" value={user.userId} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <Phone size={16} />
                Phone
              </label>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+639XXXXXXXXX"
              />
            </div>

            <div className="rbac-actions">
              <button
                type="button"
                className="btn btn-light rbac-btn"
                onClick={handleRequestClose}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary rbac-btn">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CONFIRM SAVE POPUP */}
      {confirmSave && (
        <div
          className="rbac-backdrop"
          style={{ zIndex: 1060 }}
          onMouseDown={() => setConfirmSave(false)}
        >
          <div
            className="rbac-modal rbac-modal-dialog"
            style={{ maxWidth: 420 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="fw-bold mb-2">Confirm Update</div>

            <div className="text-muted mb-3">
              Are you sure you want to update this user's contact information?
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setConfirmSave(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD CHANGES EXIT POPUP */}
      {confirmDiscard && (
        <div
          className="rbac-backdrop"
          style={{ zIndex: 1060 }}
          onMouseDown={() => setConfirmDiscard(false)}
        >
          <div
            className="rbac-modal rbac-modal-dialog"
            style={{ maxWidth: 420 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertTriangle className="text-warning" size={20} />
              <div className="fw-bold">Discard changes?</div>
            </div>

            <div className="text-muted mb-3">
              You have unsaved changes to this user's contact details. Are you sure you want to exit without saving?
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep Editing
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmDiscard(false);
                  onClose();
                }}
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}