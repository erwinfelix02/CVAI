import { useEffect, useState } from "react";
import { X, Phone, Mail, Hash } from "lucide-react";
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

  useEffect(() => {
    if (!open || !user) return;

    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSave(true);
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
      <div className="rbac-backdrop" onMouseDown={onClose}>
        <div
          className="rbac-modal rbac-modal-wide"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="rbac-x" onClick={onClose} aria-label="Close">
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
                onClick={onClose}
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
        <div className="rbac-backdrop">
          <div className="rbac-modal" style={{ maxWidth: 420 }}>
            <div className="fw-bold mb-2">Confirm Update</div>

            <div className="text-muted mb-3">
              Are you sure you want to update this user's contact information?
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setConfirmSave(false)}
              >
                Cancel
              </button>

              <button className="btn btn-primary" onClick={confirmSubmit}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}