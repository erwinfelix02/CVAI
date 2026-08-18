// ✅ src/components/DepartmentHead/Settings/ProfileCard.tsx

import { User } from "lucide-react";

type Profile = {
  initials: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
};

type ProfileCardProps = {
  profile: Profile;
  isEditing: boolean;
  onChange: (field: keyof Profile, value: string) => void;
};

export default function ProfileCard({
  profile,
  isEditing,
  onChange,
}: ProfileCardProps) {
  return (
    <div className="card shadow-sm rounded-4 border-0 mb-4">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold"
            style={{
              width: 56,
              height: 56,
              minWidth: 56,
            }}
          >
            {profile.initials}
          </div>

          <div>
            <h5 className="fw-bold mb-1">
              Profile Information
            </h5>

            <p className="text-muted mb-0 small">
              Manage your personal information
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="row g-3">
          {/* Full Name - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Full Name
            </label>

            <input
              type="text"
              className="form-control"
              value={profile.fullName}
              disabled
              readOnly
            />
          </div>

          {/* Email - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              value={profile.email}
              disabled
              readOnly
            />
          </div>

          {/* Phone Number - ONLY EDITABLE FIELD */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Phone Number
            </label>

            <input
              type="text"
              className="form-control"
              value={profile.phone}
              disabled={!isEditing}
              onChange={(e) =>
                onChange("phone", e.target.value)
              }
              placeholder="+63 917 555 0142"
            />
          </div>

          {/* Department - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Department
            </label>

            <input
              type="text"
              className="form-control"
              value={profile.department}
              disabled
              readOnly
            />
          </div>

          {/* Role - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">
              Role
            </label>

            <div className="input-group">
              <span className="input-group-text">
                <User size={16} />
              </span>

              <input
                type="text"
                className="form-control"
                value={profile.role}
                disabled
                readOnly
              />
            </div>

            <small className="text-muted">
              Role is managed by the administrator.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}