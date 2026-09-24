import { useState, useEffect } from "react";
import { Ban, CheckCircle2, Pencil, Trash2, X, Loader2 } from "lucide-react";
import type { UserItem } from "./types";

type Props = {
  roleName: string;
  user: UserItem | null;
  onClear: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
};

const formatDateOnly = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

export default function UserInfoCard({
  roleName,
  user,
  onClear,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoadingAvatar, setIsLoadingAvatar] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Fetch student avatar from the student database when a student is selected
  useEffect(() => {
    if (!user) {
      setAvatarUrl("");
      return;
    }

    // Default to existing user avatar if present
    setAvatarUrl(user.avatarUrl || "");
    setImageError(false);

    // If role is student or user has a student ID, fetch live from student endpoint
    const targetIdentifier = user.userId || user.id;
    if (roleName.toLowerCase() === "student" && targetIdentifier) {
      const fetchStudentAvatar = async () => {
        setIsLoadingAvatar(true);
        try {
          const token = localStorage.getItem("token");
          const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          };

          const res = await fetch(`/api/students/${targetIdentifier}`, { headers });
          if (res.ok) {
            const data = await res.json();
            const student = data.student || data;
            if (student?.avatarUrl) {
              setAvatarUrl(student.avatarUrl);
            }
          }
        } catch (err) {
          console.error("Failed to fetch student avatar for card:", err);
        } finally {
          setIsLoadingAvatar(false);
        }
      };

      fetchStudentAvatar();
    }
  }, [user, roleName]);

  const resolvedAvatarUrl = getFullAvatarUrl(avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

  return (
    <div className="card shadow-sm border-0">
      {/* Header */}
      <div className="card-header bg-white border-0 pb-0">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div>
            <div className="fw-bold">User Information</div>
            <div className="text-muted small">Select a row to preview details</div>
          </div>

          {user && (
            <button
              className="btn btn-light border btn-sm"
              onClick={onClear}
              title="Clear"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-body pt-3">
        {!user ? (
          <div className="text-center py-4">
            <div className="text-muted fw-semibold">No user selected</div>
            <div className="text-muted small">Click a user in the table.</div>
          </div>
        ) : (
          <>
            {/* Avatar + Name */}
            <div className="d-flex flex-column align-items-center text-center mb-3">
              <div
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center mb-2 border shadow-sm position-relative"
                style={{
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  minHeight: 64,
                  background: "rgba(13, 110, 253, 0.10)",
                  color: "#0d6efd",
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {isLoadingAvatar ? (
                  <Loader2 size={24} className="spinner-border spinner-border-sm text-primary" />
                ) : showAvatar ? (
                  <img
                    src={resolvedAvatarUrl}
                    alt={user.fullName}
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
                  user.fullName.trim().slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="fw-bold fs-6">{user.fullName}</div>
              <div className="text-muted small text-break">{user.email}</div>
            </div>

            {/* Meta in 2-column grid */}
            <div className="bg-light rounded-3 p-3 border">
              <div className="row g-2">
                <div className="col-6">
                  <div className="text-muted small">User ID</div>
                  <div className="fw-semibold">{user.userId || "—"}</div>
                </div>

                <div className="col-6 text-end">
                  <div className="text-muted small">Status</div>
                  <span
                    className={`badge rounded-pill ${
                      user.status === "Active"
                        ? "text-bg-success"
                        : "text-bg-secondary"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="col-6">
                  <div className="text-muted small">Role</div>
                  <div className="fw-semibold">{roleName}</div>
                </div>

                <div className="col-6 text-end">
                  <div className="text-muted small">Created</div>
                  <div className="fw-semibold">
                    {formatDateOnly(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - ONE LINE */}
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2 flex-fill"
                onClick={onEdit}
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2 flex-fill"
                onClick={onToggle}
              >
                {user.status === "Active" ? (
                  <Ban size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {user.status === "Active" ? "Disable" : "Enable"}
              </button>

              <button
                className="btn btn-outline-danger d-flex align-items-center gap-2 flex-fill"
                onClick={onDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {/* Small hint */}
            <div className="text-muted small mt-2">
              Actions apply to the selected user.
            </div>
          </>
        )}
      </div>
    </div>
  );
}