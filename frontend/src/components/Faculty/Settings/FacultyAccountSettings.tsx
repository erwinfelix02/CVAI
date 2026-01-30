import { Save } from "lucide-react";

export default function FacultyAccountSettings() {
  return (
    <div className="card faculty-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Account</h3>
        <p className="text-muted mb-4">Update your profile information</p>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Full Name</label>
            <input className="form-control" defaultValue="Dr. Juan Dela Cruz" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Email</label>
            <input className="form-control" defaultValue="juan.delacruz@university.edu" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Department</label>
            <input className="form-control" defaultValue="Computer Science" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Office</label>
            <input className="form-control" defaultValue="Room 302" />
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
