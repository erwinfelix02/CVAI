import { X } from "lucide-react";
import "../../styles/info-modal.css";
import type { User } from "../../types/User";

interface SchoolInfoModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export default function SchoolInfoModal({
  open,
  onClose,
  user,
}: SchoolInfoModalProps) {
  if (!open || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h2>School Information</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <hr className="info-separator" />

        {/* Details */}
        <div className="details-grid">
          <div>
            <span className="label">User ID</span>
            <p>{user.id}</p>
          </div>

          <div>
            <span className="label">Role</span>
            <p>{user.role}</p>
          </div>

          <div>
            <span className="label">Status</span>
            <div className="status-wrapper">
              <span
                className={`status ${user.status === "active" ? "active" : "inactive"}`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <hr className="info-separator" />

        <div className="details-grid">
          <div>
            <span className="label">Course / Department</span>
            <p>{user.courseOrDept}</p>
          </div>

          <div>
            <span className="label">Year / Position</span>
            <p>{user.yearOrPosition}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
