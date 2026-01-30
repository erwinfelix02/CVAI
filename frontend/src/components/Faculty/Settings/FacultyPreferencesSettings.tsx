import { Save } from "lucide-react";

export default function FacultyPreferencesSettings() {
  return (
    <div className="card faculty-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Preferences</h3>
        <p className="text-muted mb-4">Customize your portal experience</p>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Timezone</label>
            <select className="form-select" defaultValue="Asia/Manila">
              <option value="Asia/Manila">Asia/Manila</option>
              <option value="UTC">UTC</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Default landing page</label>
            <select className="form-select" defaultValue="dashboard">
              <option value="dashboard">Dashboard</option>
              <option value="schedule">Schedule</option>
              <option value="classes">My Classes</option>
            </select>
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
