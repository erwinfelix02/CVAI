import { useState, useEffect } from "react";

export default function FacultyAccountSettings() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    async function fetchAccountProfile() {
      try {
        setLoading(true);
        // Get user session data stored in localStorage
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;

        const queryParams = new URLSearchParams();
        if (storedUser?.id || storedUser?._id) {
          queryParams.append("id", storedUser.id || storedUser._id);
        } else if (storedUser?.email) {
          queryParams.append("email", storedUser.email);
        }

        const res = await fetch(`/api/users/me?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const fullName = `${data.firstName || ""} ${
            data.middleName ? data.middleName + " " : ""
          }${data.lastName || ""}`.trim();

          setFormData({
            fullName: fullName || storedUser?.name || "Faculty Member",
            email: data.email || storedUser?.email || "",
            department: data.department || storedUser?.department || "",
          });
        } else if (storedUser) {
          // Fallback to local stored user object if API fetch fails
          const fullName = `${storedUser.firstName || ""} ${
            storedUser.middleName ? storedUser.middleName + " " : ""
          }${storedUser.lastName || ""}`.trim();

          setFormData({
            fullName: fullName || storedUser.name || "Faculty Member",
            email: storedUser.email || "",
            department: storedUser.department || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch account profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountProfile();
  }, []);

  return (
    <div className="card faculty-settings-card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h3 className="fw-bold mb-1">Account</h3>
        <p className="text-muted mb-4">View your profile information</p>

        {loading ? (
          <div className="py-4 text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading profile information...
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Full Name</label>
              <input
                className="form-control bg-light"
                value={formData.fullName}
                readOnly
                disabled
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control bg-light"
                value={formData.email}
                readOnly
                disabled
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Department</label>
              <input
                className="form-control bg-light"
                value={formData.department}
                readOnly
                disabled
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}