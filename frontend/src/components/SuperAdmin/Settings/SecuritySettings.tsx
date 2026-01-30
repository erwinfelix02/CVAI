import { Save } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="card superadmin-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Security Settings</h3>
        <p className="text-muted mb-4">Configure security and authentication settings</p>

        <div className="superadmin-settings-row mb-3">
          <div className="min-w-0">
            <div className="fw-semibold">Require Email Verification</div>
            <div className="text-muted">
              Users must verify their email before accessing the platform
            </div>
          </div>

          {/* ✅ wrap switch so it aligns correctly on mobile */}
          <div className="superadmin-switch-wrap">
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input superadmin-switch"
                type="checkbox"
                defaultChecked
              />
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Session Timeout (minutes)</label>
            <input className="form-control" type="number" defaultValue={30} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Max Login Attempts</label>
            <input className="form-control" type="number" defaultValue={5} />
          </div>
        </div>

        <div className="mt-4">
          <button className="btn btn-primary superadmin-settings-savebtn">
            <Save size={18} className="me-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
