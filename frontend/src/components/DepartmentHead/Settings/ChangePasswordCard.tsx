// src/components/DepartmentHead/Settings/ChangePasswordCard.tsx

import { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";

type ChangePasswordCardProps = {
  isEditing: boolean;
  saving?: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onPasswordChange: (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    value: string
  ) => void;
};

export default function ChangePasswordCard({
  isEditing,
  saving = false,
  currentPassword,
  newPassword,
  confirmPassword,
  onPasswordChange,
}: ChangePasswordCardProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="card shadow-sm rounded-4 border-0 mb-4">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold"
            style={{ width: 56, height: 56, minWidth: 56 }}
          >
            <Key size={24} />
          </div>
          <div>
            <h5 className="fw-bold mb-1">Change Password</h5>
            <p className="text-muted mb-0 small">
              Use a strong password (min 8 characters).
            </p>
          </div>
        </div>

        {/* Password Fields */}
        <div className="row g-3">
          {/* Current Password */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Current Password</label>
            <div className="input-group">
              <input
                type={showCurrent ? "text" : "password"}
                className="form-control"
                placeholder="********"
                value={currentPassword}
                disabled={!isEditing || saving}
                onChange={(e) =>
                  onPasswordChange("currentPassword", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-secondary border"
                onClick={() => setShowCurrent(!showCurrent)}
                disabled={!isEditing || saving}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">New Password</label>
            <div className="input-group">
              <input
                type={showNew ? "text" : "password"}
                className="form-control"
                placeholder="min 8 characters"
                value={newPassword}
                disabled={!isEditing || saving}
                onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border"
                onClick={() => setShowNew(!showNew)}
                disabled={!isEditing || saving}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Confirm Password</label>
            <div className="input-group">
              <input
                type={showConfirm ? "text" : "password"}
                className="form-control"
                placeholder="repeat new password"
                value={confirmPassword}
                disabled={!isEditing || saving}
                onChange={(e) =>
                  onPasswordChange("confirmPassword", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-secondary border"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={!isEditing || saving}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}