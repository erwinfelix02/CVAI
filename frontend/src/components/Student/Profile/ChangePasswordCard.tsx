// ✅ src/components/Student/Profile/ChangePasswordCard.tsx

import { useState, useRef, useMemo, useEffect } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import AuthAlert from "../../../components/Authentication/AuthAlert";

export default function ChangePasswordCard({
  onSubmit,
}: {
  onSubmit?: (payload: { currentPassword: string; newPassword: string }) => Promise<void> | void;
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

  // modal open/close states
  const [confirmOpen, setConfirmOpen] = useState(false); // Save confirmation modal
  const [discardOpen, setDiscardOpen] = useState(false); // Discard/Cancel changes confirmation modal
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const hasTypedSomething = useMemo(() => {
    return Boolean(currentPassword || newPassword || confirm);
  }, [currentPassword, newPassword, confirm]);

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
    setDiscardOpen(false);
  }

  // First click unlocks. Second click opens save confirmation modal.
  function clickUpdate() {
    setError(""); // Clear error when clicking update

    // first click: unlock fields + eye
    if (!editing) {
      setEditing(true);
      return;
    }

    // second click: validate then open modal
    if (!canProceed) return;
    setConfirmOpen(true);
  }

  // Cancel button trigger
  function handleCancelClick() {
    if (hasTypedSomething) {
      // Prompt exit confirmation if user typed text
      setDiscardOpen(true);
    } else {
      // Just close immediately if fields are empty
      cancelEditing();
    }
  }

  // Actual discard execution
  function cancelEditing() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError(""); // Clear error on cancel
    setEditing(false);
    setDiscardOpen(false);
  }

  function closeModal() {
    setConfirmOpen(false);
    requestAnimationFrame(() => confirmBtnRef.current?.focus());
  }

  async function confirmUpdate() {
    setSaving(true);
    setError("");

    try {
      await Promise.resolve(onSubmit?.({ currentPassword, newPassword }));

      // Close confirmation modal and open success modal
      setConfirmOpen(false);
      setSuccess(true);

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
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // disable inputs/eyes unless editing
  const inputsDisabled = !editing || saving;
  const eyesDisabled = !editing || saving;

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

          {/* Form */}
          <>
            {/* AuthAlert integrated with automatic state clearing */}
            {(error || saving) && (
              <div className="mb-3">
                <AuthAlert
                  message={error || "Updating password securely"}
                  type={error ? "error" : "success"}
                  visible={Boolean(error || saving)}
                  loading={saving}
                />
              </div>
            )}

            <div className="row g-3">
              {/* Current */}
              <div className="col-12 col-md-4">
                <label className="form-label small text-muted">Current Password</label>

                <div className="profile-input-wrap">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="form-control profile-input profile-input--with-icon"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (error) setError("");
                    }}
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
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError("");
                    }}
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
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (error) setError("");
                    }}
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

            {/* helper + buttons */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mt-3">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <ShieldCheck size={16} />
                {!editing
                  ? "Click Update Password to unlock the fields."
                  : newPassword && confirm && newPassword !== confirm
                  ? "Passwords do not match."
                  : "Your password will be updated securely."}
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Cancel Button (Visible only when unlocked/editing) */}
                {editing && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                    onClick={handleCancelClick}
                    disabled={saving}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}

                {/* Update Password / Confirm Button Styled in Blue */}
                <button
                  ref={confirmBtnRef}
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center gap-2"
                  onClick={clickUpdate}
                  disabled={editing ? !canProceed : false}
                >
                  <ShieldCheck size={18} />
                  {editing ? "Confirm" : "Update Password"}
                </button>
              </div>
            </div>
          </>
        </div>
      </div>

      {/* SAVE CONFIRMATION MODAL */}
      {confirmOpen && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            style={{ display: "block" }}
            onMouseDown={(e) => {
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
                    <ShieldCheck size={18} className="mt-1 text-primary" />
                    <div>
                      <div className="fw-semibold mb-1">
                        Are you sure you want to update your password?
                      </div>
                      <div className="text-muted small">
                        This action will replace your old password securely.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light border d-inline-flex align-items-center gap-2"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    <XCircle size={18} />
                    Back
                  </button>

                  {/* Modal Confirm Button Styled in Blue */}
                  <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
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

      {/* SUCCESS MODAL */}
      {success && (
        <div
          className="modal-backdrop fade show"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        >
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "transparent" }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
              <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center bg-white">
                
                {/* Centered Green Success Icon Box */}
                <div 
                  className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: "64px", height: "64px", backgroundColor: "#e6f4ea" }}
                >
                  <CheckCircle2 size={34} style={{ color: "#137333" }} />
                </div>

                {/* Title */}
                <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.25rem" }}>
                  Password Updated!
                </h4>

                {/* Subtitle Message */}
                <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.5" }}>
                  Your password has been changed successfully. You can now use your new password on your next login.
                </p>

                {/* Done Button */}
                <button
                  type="button"
                  className="btn btn-primary py-2 px-4 rounded-3 fw-medium w-100 text-white shadow-none border-0"
                  onClick={resetAll}
                >
                  Got it
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD / EXIT CONFIRMATION MODAL */}
      {discardOpen && (
        <div
          className="modal-backdrop fade show"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        >
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "transparent" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDiscardOpen(false);
            }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
              <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center bg-white">
                
                {/* Centered Yellow Warning Icon Box */}
                <div 
                  className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: "64px", height: "64px", backgroundColor: "#fdf8e2" }}
                >
                  <AlertTriangle size={30} style={{ color: "#f59e0b" }} />
                </div>

                {/* Title */}
                <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.25rem" }}>
                  Unsaved Changes
                </h4>

                {/* Subtitle Message */}
                <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.5" }}>
                  You have drafted changes. Are you sure you want to discard them?
                </p>

                {/* Action Buttons Row */}
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-primary py-2 px-3 rounded-3 fw-medium flex-grow-1 text-white shadow-none border-0"
                    onClick={() => setDiscardOpen(false)}
                  >
                    Keep Editing
                  </button>

                  <button
                    type="button"
                    className="btn py-2 px-3 rounded-3 fw-medium flex-grow-1 text-white shadow-none"
                    style={{ backgroundColor: "#dc2626", border: "none" }}
                    onClick={cancelEditing}
                  >
                    Discard & Exit
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}