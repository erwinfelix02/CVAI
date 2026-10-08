// src/components/Registrar/settings/ChangePasswordCard.tsx

import { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import SettingsSectionCard from "./SettingsSectionCard";

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
    <SettingsSectionCard
      icon={<Key size={20} />}
      title="Change Password"
      subtitle="Use a strong password (min 8 characters, 1 capital letter, 1 special character)."
    >
      <div className="row g-3">
        {/* Current Password */}
        <div className="col-12 col-md-4 text-start">
          <label className="form-label rs-label">Current Password</label>
          <div className="input-group">
            <input
              type={showCurrent ? "text" : "password"}
              className="form-control rs-form-control"
              placeholder="********"
              value={currentPassword}
              disabled={!isEditing || saving}
              onChange={(e) =>
                onPasswordChange("currentPassword", e.target.value)
              }
            />
            <button
              type="button"
              className="btn btn-outline-secondary border px-3"
              onClick={() => setShowCurrent(!showCurrent)}
              disabled={!isEditing || saving}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="col-12 col-md-4 text-start">
          <label className="form-label rs-label">New Password</label>
          <div className="input-group">
            <input
              type={showNew ? "text" : "password"}
              className="form-control rs-form-control"
              placeholder="min 8 chars, 1 cap, 1 special"
              value={newPassword}
              disabled={!isEditing || saving}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary border px-3"
              onClick={() => setShowNew(!showNew)}
              disabled={!isEditing || saving}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="col-12 col-md-4 text-start">
          <label className="form-label rs-label">Confirm Password</label>
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control rs-form-control"
              placeholder="repeat new password"
              value={confirmPassword}
              disabled={!isEditing || saving}
              onChange={(e) =>
                onPasswordChange("confirmPassword", e.target.value)
              }
            />
            <button
              type="button"
              className="btn btn-outline-secondary border px-3"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={!isEditing || saving}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  );
}