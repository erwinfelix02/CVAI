import { useEffect } from "react";
import { X } from "lucide-react";

type UserDetails = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
  department?: string;
  status: "active" | "inactive";
  userCode?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
};

type Props = {
  open: boolean;
  user: UserDetails | null;
  onClose: () => void;
};

function formatDateTime(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeCreatedBy(value?: string) {
  if (!value) return "—";
  if (value === "SuperAdmin") return "Super Admin";
  return value;
}

function formatStatus(value?: string) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function UserDetailsModal({ open, user, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  return (
    <div
      className="users-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="users-modal users-details-modal"
        role="dialog"
        aria-modal="true"
        aria-label="User Details"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="users-modal-header">
          <div>
            <h3 className="users-modal-title">
              {user.role === "Faculty" ? "Faculty Details" : "User Details"}
            </h3>
          </div>

          <button
            type="button"
            className="users-modal-close app-icon-btn app-icon-btn-sm"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="users-modal-body">
          <div className="user-details-card">
            <div className="user-details-top">
              <div className="user-details-avatar">
                {getInitials(user.name)}
              </div>

              <div className="user-details-heading">
                <h4 className="user-details-name">{user.name}</h4>
                <div className="user-details-code">{user.userCode || "—"}</div>

                <span
                  className={`user-details-status ${
                    user.status === "active" ? "active" : "inactive"
                  }`}
                >
                  {formatStatus(user.status)}
                </span>
              </div>
            </div>

            <hr className="user-details-divider" />

            <div className="user-details-grid">
              <div className="user-details-item">
                <div className="user-details-label">Email</div>
                <div className="user-details-value">{user.email || "—"}</div>
              </div>

              <div className="user-details-item">
                <div className="user-details-label">Phone</div>
                <div className="user-details-value">{user.phone || "—"}</div>
              </div>

              <div className="user-details-item">
                <div className="user-details-label">Gender</div>
                <div className="user-details-value">{user.gender || "—"}</div>
              </div>

              <div className="user-details-item">
                <div className="user-details-label">Department</div>
                <div className="user-details-value">
                  {user.department || "—"}
                </div>
              </div>

              <div className="user-details-item">
                <div className="user-details-label">Role</div>
                <div className="user-details-value">{user.role || "—"}</div>
              </div>

              <div className="user-details-item">
                <div className="user-details-label">Created By</div>
                <div className="user-details-value">
                  {normalizeCreatedBy(user.createdBy)}
                </div>
              </div>

              <div className="user-details-item user-details-item-full">
                <div className="user-details-label">Created At</div>
                <div className="user-details-value">
                  {formatDateTime(user.createdAt)}
                </div>
              </div>

              <div className="user-details-item user-details-item-full">
                <div className="user-details-label">Notes</div>
                <div className="user-details-value">{user.notes || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="users-modal-footer">
  <button
    type="button"
    className="btn btn-light users-btn"
    onClick={onClose}
  >
    Close
  </button>
</div>
      </div>
    </div>
  );
}
