import { Save } from "lucide-react";

function ToggleRow({
  title,
  desc,
  defaultChecked,
}: {
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="faculty-settings-row">
      <div className="min-w-0">
        <div className="fw-semibold">{title}</div>
        <div className="text-muted">{desc}</div>
      </div>

      <div className="form-check form-switch m-0 faculty-switch-wrap">
        <input
          className="form-check-input faculty-switch"
          type="checkbox"
          defaultChecked={defaultChecked}
        />
      </div>
    </div>
  );
}

export default function FacultySecuritySettings() {
  return (
    <div className="card faculty-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Security</h3>
        <p className="text-muted mb-4">Manage password and login protection</p>

        <div className="d-flex flex-column gap-3">
          <ToggleRow
            title="Two-factor authentication"
            desc="Add an extra layer of security to your account"
          />
          <ToggleRow
            title="Login alerts"
            desc="Send an email when a new device signs in"
            defaultChecked
          />
        </div>

        <div className="row g-3 mt-3">
          <div className="col-12 col-md-6">
            <label className="form-label">New Password</label>
            <input className="form-control" type="password" placeholder="••••••••" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Confirm Password</label>
            <input className="form-control" type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className="mt-4">
          <button className="btn btn-primary faculty-settings-savebtn">
            <Save size={18} className="me-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
