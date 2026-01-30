import { Save } from "lucide-react";

export default function GeneralSettings() {
  return (
    <div className="card superadmin-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">General Settings</h3>
        <p className="text-muted mb-4">Configure basic application settings and branding</p>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Site Name</label>
            <input className="form-control" defaultValue="Campus Chatbot" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Support Email</label>
            <input className="form-control" defaultValue="support@university.edu" />
          </div>

          <div className="col-12">
            <label className="form-label">Site Description</label>
            <input className="form-control" defaultValue="Your AI-powered campus assistant" />
          </div>

          <div className="col-12">
            <label className="form-label">AI Welcome Message</label>
            <textarea
              className="form-control"
              rows={4}
              defaultValue={`Hello! I'm your campus assistant. How can I help you today?`}
            />
            <div className="form-text">
              This message will be displayed when users first open the chatbot
            </div>
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
