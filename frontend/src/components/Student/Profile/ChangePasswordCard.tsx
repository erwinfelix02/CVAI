import { useMemo, useRef, useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ChangePasswordCard({
  onSubmit,
}: {
  onSubmit?: (payload: { currentPassword: string; newPassword: string }) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // per-field show toggles (icon inside each input)
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // lock/unlock editing (starts locked)
  const [editing, setEditing] = useState(false);

  // UI states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // modal open/close (no bootstrap JS needed)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  const canProceed = useMemo(() => {
    if (!currentPassword || !newPassword || !confirm) return false;
    if (newPassword.length < 8) return false;
    if (newPassword !== confirm) return false;
    return true;
  }, [currentPassword, newPassword, confirm]);

  function resetAll() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);

    setSaving(false);
    setError("");
    setSuccess(false);

    setEditing(false);
    setConfirmOpen(false);
  }

  // First click unlocks. Second click opens modal.
  function clickUpdate() {
    setError("");

    // first click: unlock fields + eye
    if (!editing) {
      setEditing(true);
      return;
    }

    // second click: validate then open modal
    if (!canProceed) return;
    setConfirmOpen(true);
  }

  function closeModal() {
    setConfirmOpen(false);

    // nice UX: return focus to bottom button
    requestAnimationFrame(() => confirmBtnRef.current?.focus());
  }

  async function confirmUpdate() {
    setSaving(true);
    setError("");

    try {
      await Promise.resolve(onSubmit?.({ currentPassword, newPassword }));

      setSuccess(true);
      closeModal();

      // clear fields + lock again
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setEditing(false);

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
      // keep editing mode so user can correct input
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // disable inputs/eyes unless editing
  const inputsDisabled = !editing || saving || success;
  const eyesDisabled = !editing || saving || success;

  return (
    <>
      <div className="card shadow-sm border-1 profile-card">
        <div className="card-body p-3 p-md-4">
          {/* Header */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="profile-card__icon">
              <KeyRound className="profile-card__icon-svg" />
            </span>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-0">Change Password</h5>
              <div className="text-muted small">
                Use a strong password (min 8 characters).
              </div>
            </div>
          </div>

          {/* Success */}
          {success && (
            <div
              className="alert alert-success d-flex align-items-center gap-2 mb-3"
              role="alert"
            >
              <CheckCircle2 size={18} />
              <div className="flex-grow-1">
                <div className="fw-semibold">Password updated successfully!</div>
                <div className="small">You can now use your new password next login.</div>
              </div>

              <button type="button" className="btn btn-success btn-sm" onClick={resetAll}>
                Done
              </button>
            </div>
          )}

          {/* Form */}
          {!success && (
            <>
              <div className="row g-3">
                {/* Current */}
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">Current Password</label>

                  <div className="profile-input-wrap">
                    <input
                      type={showCurrent ? "text" : "password"}
                      className="form-control profile-input profile-input--with-icon"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={inputsDisabled}
                    />
                    <button
                      type="button"
                      className="profile-input-eye"
                      onClick={() => !eyesDisabled && setShowCurrent((s) => !s)}
                      disabled={eyesDisabled}
                      aria-label={showCurrent ? "Hide password" : "Show password"}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">New Password</label>

                  <div className="profile-input-wrap">
                    <input
                      type={showNew ? "text" : "password"}
                      className="form-control profile-input profile-input--with-icon"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="min 8 characters"
                      disabled={inputsDisabled}
                    />
                    <button
                      type="button"
                      className="profile-input-eye"
                      onClick={() => !eyesDisabled && setShowNew((s) => !s)}
                      disabled={eyesDisabled}
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">Confirm Password</label>

                  <div className="profile-input-wrap">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="form-control profile-input profile-input--with-icon"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="repeat new password"
                      disabled={inputsDisabled}
                    />
                    <button
                      type="button"
                      className="profile-input-eye"
                      onClick={() => !eyesDisabled && setShowConfirm((s) => !s)}
                      disabled={eyesDisabled}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* helper + button */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mt-3">
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <ShieldCheck size={16} />
                  {!editing
                    ? "Click Update Password to unlock the fields."
                    : newPassword && confirm && newPassword !== confirm
                    ? "Passwords do not match."
                    : "Your password will be updated securely."}
                </div>

                <button
                  ref={confirmBtnRef}
                  type="button"
                  className="btn btn-success d-inline-flex align-items-center gap-2"
                  onClick={clickUpdate}
                  disabled={editing ? !canProceed : false}
                >
                  <ShieldCheck size={18} />
                  {editing ? "Confirm" : "Update Password"}
                </button>
              </div>

              {error && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ CONFIRMATION MODAL (popup) */}
      {confirmOpen && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show" />

          {/* Modal */}
          <div
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            style={{ display: "block" }}
            onMouseDown={(e) => {
              // click outside to close
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm password change</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                    disabled={saving}
                  />
                </div>

                <div className="modal-body">
                  <div className="d-flex align-items-start gap-2">
                    <ShieldCheck size={18} className="mt-1" />
                    <div>
                      <div className="fw-semibold mb-1">
                        Are you sure you want to update your password?
                      </div>
                      <div className="text-muted small">
                        This action cannot be undone.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
  type="button"
  className="btn btn-cancel d-inline-flex align-items-center gap-2"
  onClick={closeModal}
  disabled={saving}
>
  <XCircle size={18} />
  Cancel
</button>


                  <button
                    type="button"
                    className="btn btn-success d-inline-flex align-items-center gap-2"
                    onClick={confirmUpdate}
                    disabled={saving}
                  >
                    <ShieldCheck size={18} />
                    {saving ? "Updating..." : "Yes, update password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
