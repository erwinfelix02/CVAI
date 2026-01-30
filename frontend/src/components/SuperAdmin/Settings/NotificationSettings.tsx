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
    <div className="superadmin-settings-row">
      <div className="min-w-0">
        <div className="fw-semibold">{title}</div>
        <div className="text-muted">{desc}</div>
      </div>

      {/* ✅ wrap switch so it aligns correctly on mobile */}
      <div className="superadmin-switch-wrap">
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input superadmin-switch"
            type="checkbox"
            defaultChecked={defaultChecked}
          />
        </div>
      </div>
    </div>
  );
}

export default function NotificationSettings() {
  return (
    <div className="card superadmin-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Notification Settings</h3>
        <p className="text-muted mb-4">Configure how you receive alerts and updates</p>

        <div className="d-flex flex-column gap-3">
          <ToggleRow
            title="Email Notifications"
            desc="Receive notifications via email"
            defaultChecked
          />
          <ToggleRow
            title="New User Alerts"
            desc="Get notified when new users register"
            defaultChecked
          />
          <ToggleRow
            title="Help Request Alerts"
            desc="Get notified when users submit help requests"
            defaultChecked
          />
          <ToggleRow
            title="Weekly Reports"
            desc="Receive weekly summary reports via email"
          />
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
