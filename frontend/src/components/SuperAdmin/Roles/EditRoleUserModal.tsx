import { useEffect, useState, useMemo } from "react";
import { X, Phone, Mail, Hash, User, AlertTriangle } from "lucide-react";
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
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Initialize input state when modal opens or target user changes
  useEffect(() => {
    if (!open || !user) return;

    setFirstName(user.firstName || "");
    setMiddleName(user.middleName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");

    // Ensure initial phone starts with +639 if empty or invalid
    let initialPhone = user.phone || "+639";
    if (!initialPhone.startsWith("+639")) {
      initialPhone = "+639" + initialPhone.replace(/\D/g, "").slice(-9);
    }
    setPhone(initialPhone);

    setConfirmSave(false);
    setConfirmDiscard(false);
  }, [open, user]);

  // Handle phone input changes with strict formatting (+639 prefix + 9 digits max, numbers only)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (!val.startsWith("+639")) {
      val = "+639";
    }

    const prefix = "+63";
    const remainder = val.slice(prefix.length).replace(/\D/g, "");
    const clampedRemainder = remainder.slice(0, 10);

    setPhone(prefix + clampedRemainder);
  };

  // Check if form state differs from original user data
  const hasUnsavedChanges = useMemo(() => {
    if (!user) return false;
    const initialFirst = user.firstName || "";
    const initialMiddle = user.middleName || "";
    const initialLast = user.lastName || "";
    const initialEmail = user.email || "";
    
    let initialPhone = user.phone || "+639";
    if (!initialPhone.startsWith("+639")) {
      initialPhone = "+639" + initialPhone.replace(/\D/g, "").slice(-9);
    }

    return (
      firstName.trim() !== initialFirst ||
      middleName.trim() !== initialMiddle ||
      lastName.trim() !== initialLast ||
      email.trim() !== initialEmail ||
      phone.trim() !== initialPhone
    );
  }, [firstName, middleName, lastName, email, phone, user]);

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
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
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
              Update the selected user's name and contact information.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <Hash size={16} />
                User ID
              </label>
              <input className="form-control" value={user.userId} disabled />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center gap-2">
                  <User size={16} />
                  First Name
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Middle Name</label>
                <input
                  className="form-control"
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle name"
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Last Name</label>
                <input
                  className="form-control"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
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
                Phone Number
              </label>
              <input
                className="form-control"
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+639XXXXXXXXX"
                maxLength={13}
              />
              <div className="form-text text-muted small mt-1">
                Format: +639 followed by 9 digits (Philippine mobile standard).
              </div>
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
              Are you sure you want to update this user's details?
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
              You have unsaved changes. Are you sure you want to exit without saving?
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