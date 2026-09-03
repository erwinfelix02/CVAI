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
  saving?: boolean;
  onChange: (field: keyof Profile, value: string) => void;
};

export default function ProfileCard({
  profile,
  isEditing,
  saving = false,
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
            <h5 className="fw-bold mb-1">Profile Information</h5>

            <p className="text-muted mb-0 small">
              Manage your personal information
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="row g-3">
          {/* Full Name - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">Full Name</label>

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
            <label className="form-label fw-semibold">Email Address</label>

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
            <label className="form-label fw-semibold">Phone Number</label>

            <input
              type="tel"
              className="form-control"
              value={profile.phone || "+639"}
              disabled={!isEditing || saving}
              maxLength={13}
              onChange={(e) => {
                // Strip all non-digit characters
                const digitsOnly = e.target.value.replace(/\D/g, "");

                // Ensure it always starts with 639
                let rest = digitsOnly;
                if (rest.startsWith("639")) {
                  rest = rest.slice(3);
                } else if (rest.startsWith("63")) {
                  rest = rest.slice(2);
                } else if (rest.startsWith("6")) {
                  rest = rest.slice(1);
                }

                // Append up to 9 remaining digits
                const cleaned = "+639" + rest.slice(0, 9);
                onChange("phone", cleaned);
              }}
            />
          </div>

          {/* Department - READ ONLY */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold">Department</label>

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
            <label className="form-label fw-semibold">Role</label>

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