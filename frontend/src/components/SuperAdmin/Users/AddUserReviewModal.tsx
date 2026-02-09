import { useMemo } from "react";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import type { AddUserPayload } from "./AddUserModal";

type Props = {
  open: boolean;
  data: Omit<AddUserPayload, "tempPassword">;
  onBack: () => void;
  onConfirm: (payload: AddUserPayload) => void;
  isLoading: boolean; // <--- ✅ NEW PROP
};

// Helper outside component to avoid recreation
function generateTempPassword(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export default function AddUserReviewModal({
  open,
  data,
  onBack,
  onConfirm,
  isLoading, // <--- ✅ Destructured here
}: Props) {
  // ✅ Generate password ONLY when modal opens
  const tempPassword = useMemo(() => {
    if (!open) return "";
    return generateTempPassword(10);
  }, [open]);

  if (!open) return null;

  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const handleSubmit = () => {
    onConfirm({
      ...data,
      // Ensure we send the generated password
      tempPassword,
      // OPTIONAL: If your backend supports it, force a specific flag here
      // forcePasswordChange: true
    });
  };

  return (
    <div className="users-modal-backdrop">
      <div
        className="users-modal users-modal-compact"
        role="dialog"
        aria-modal="true"
      >
        <div className="users-modal-header">
          <div className="users-review-title">
            <h3 className="users-modal-title">
              Review Application
              <CheckCircle size={20} className="users-review-check" />
            </h3>
          </div>

          <button
            type="button"
            className="users-modal-close"
            onClick={isLoading ? undefined : onBack} // Disable close if loading
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="users-modal-body space-y-6">
          <div className="users-review-grid">
            {/* Personal Information */}
            <section className="users-review-card">
              <h4>Personal Information</h4>
              <p>
                <b>Name:</b> {fullName}
              </p>
              <p>
                <b>Email:</b> {data.email}
              </p>
              <p>
                <b>Phone:</b> {data.phone}
              </p>
              <p>
                <b>Gender:</b> {data.gender}
              </p>
              <p>
                <b>ID Number:</b> {data.idNumber}
              </p>
            </section>

            {/* Portal Information */}
            <section className="users-review-card">
              <h4>Portal Information</h4>
              <p>
                <b>Role:</b> {data.role}
              </p>
              <p>
                <b>Department:</b> {data.department}
              </p>

              {/* Visual check for status */}
              <p>
                <b>Initial Status: </b>
                <span
                  className={
                    data.status === "active" ? "text-green-600" : "text-red-600"
                  }
                >
                  {data.status === "active"
                    ? "Active (Ready to Login)"
                    : "Inactive (Login Disabled)"}
                </span>
              </p>
            </section>
          </div>

          {/* Temporary Password Display */}
          <section className="users-review-card highlight users-temp-centered">
            <h4 className="temp-label">
              <AlertTriangle
                size={16}
                style={{ marginBottom: -2, marginRight: 6 }}
              />
              Temporary Password
            </h4>

            <div className="temp-password-centered">
              <span className="temp-password">{tempPassword}</span>
            </div>

            <p className="temp-password-note">
              Share this with the user securely. They will be required to change
              it upon first login.
            </p>
          </section>

          {/* Notes */}
          {data.notes?.trim() && (
            <section className="users-review-card">
              <h4>Notes</h4>
              <p>{data.notes}</p>
            </section>
          )}

          <section className="users-review-disclaimer">
            By confirming, the account will be created immediately.
          </section>
        </div>

        <div className="users-modal-footer">
          <button
            className="btn btn-light"
            onClick={onBack}
            disabled={isLoading} // ✅ Disabled while loading
          >
            Back to Edit
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading} // ✅ Disabled while loading
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Confirm & Create User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}