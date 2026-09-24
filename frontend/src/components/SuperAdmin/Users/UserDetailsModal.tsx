import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

export type UserDetails = {
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
  avatarUrl?: string;
  program?: string;
  section?: string;
  guardian?: string;
  guardianPhone?: string;
  address?: string;
  yearLevel?: string;
};

type Props = {
  open: boolean;
  userId?: string | null;
  user?: UserDetails | null;
  onClose: () => void;
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

const getFullAvatarUrl = (url?: string): string => {
  if (!url) return "";
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function UserDetailsModal({ open, userId, user: initialUser, onClose }: Props) {
  const [user, setUser] = useState<UserDetails | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;

    setImageError(false);
    setError(null);

    if (initialUser) {
      setUser(initialUser);
    }

    const fetchProfile = async (id: string) => {
      setIsLoading(true);
      console.log("Fetching profile inside modal for ID:", id);

      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // 1. Try student endpoint first since students are handled there
        let response = await fetch(`/api/students/${id}`, { headers });
        
        // 2. Fallback to user endpoint if student route didn't match
        if (!response.ok) {
          response = await fetch(`/api/users/${id}`, { headers });
        }

        if (response.ok) {
          const data = await response.json();
          console.log("Profile fetched successfully:", data);

          const raw = data.student || data.user || data;
          const fullName = raw.fullName || raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Unknown";

          setUser({
            id: raw._id || raw.id,
            name: fullName,
            email: raw.email || "",
            phone: raw.phone || raw.phoneNumber || "",
            gender: raw.gender || "N/A",
            role: raw.role || (raw.studentIdNumber || raw.program ? "Student" : "User"),
            department: raw.department || "",
            status: (raw.status || "active").toLowerCase() === "active" ? "active" : "inactive",
            userCode: raw.studentIdNumber || raw.idNumber || raw.userCode || "",
            notes: raw.notes || "",
            createdBy: raw.createdBy || "",
            createdAt: raw.createdAt || raw.enrolledDate || "",
            avatarUrl: raw.avatarUrl || raw.photo || raw.image || "",
            program: raw.program || raw.course || "",
            section: raw.section || "",
            guardian: raw.guardian || "",
            guardianPhone: raw.guardianPhone || "",
            address: raw.address || "",
            yearLevel: raw.yearLevel ? String(raw.yearLevel) : "",
          });
        } else {
          setError("Failed to load profile details.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while fetching profile.");
      } finally {
        setIsLoading(false);
      }
    };

    const targetId = userId || initialUser?.id;
    if (targetId) {
      fetchProfile(targetId);
    }
  }, [open, userId, initialUser]);

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

  if (!open) return null;

  const resolvedAvatarUrl = getFullAvatarUrl(user?.avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

  const getModalTitle = (role?: string) => {
    if (role === "Faculty") return "Faculty Details";
    if (role === "Student") return "Student Details";
    return "User Details";
  };

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
              {getModalTitle(user?.role)}
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
          {isLoading ? (
            <div className="text-center py-5">
              <Loader2 size={32} className="spinner-border spinner-border-sm text-primary mb-2" />
              <p className="text-muted small mb-0">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex align-items-center gap-2 my-3 rounded-3" role="alert">
              <AlertCircle size={20} className="text-danger flex-shrink-0" />
              <div className="small">{error}</div>
            </div>
          ) : !user ? (
            <div className="text-center py-4 text-muted">No profile data available.</div>
          ) : (
            <div className="user-details-card">
              <div className="user-details-top">
                <div
                  className="user-details-avatar overflow-hidden d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                  style={{ width: 60, height: 60, minWidth: 60, minHeight: 60, borderRadius: "50%", backgroundColor: "#3b82f6" }}
                >
                  {showAvatar ? (
                    <img
                      src={resolvedAvatarUrl}
                      alt={user.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "50%",
                      }}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                <div className="user-details-heading">
                  <h4 className="user-details-name">{user.name}</h4>
                  <div className="user-details-code">
                    {user.userCode ? `ID: ${user.userCode}` : "—"}
                  </div>

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
                  <div className="user-details-label">
                    {user.role === "Student" ? "Program / Course" : "Department"}
                  </div>
                  <div className="user-details-value">
                    {user.program || user.department || "—"}
                  </div>
                </div>

                {user.role === "Student" && user.section && (
                  <div className="user-details-item">
                    <div className="user-details-label">Section</div>
                    <div className="user-details-value">{user.section}</div>
                  </div>
                )}

                {user.role === "Student" && user.yearLevel && (
                  <div className="user-details-item">
                    <div className="user-details-label">Year Level</div>
                    <div className="user-details-value">{user.yearLevel}</div>
                  </div>
                )}

                {user.role === "Student" && user.guardian && (
                  <div className="user-details-item">
                    <div className="user-details-label">Guardian</div>
                    <div className="user-details-value">{user.guardian}</div>
                  </div>
                )}

                {user.role === "Student" && user.guardianPhone && (
                  <div className="user-details-item">
                    <div className="user-details-label">Guardian Phone</div>
                    <div className="user-details-value">{user.guardianPhone}</div>
                  </div>
                )}

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
                  <div className="user-details-label">Address</div>
                  <div className="user-details-value">{user.address || "—"}</div>
                </div>

                <div className="user-details-item user-details-item-full">
                  <div className="user-details-label">Notes</div>
                  <div className="user-details-value">{user.notes || "—"}</div>
                </div>
              </div>
            </div>
          )}
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