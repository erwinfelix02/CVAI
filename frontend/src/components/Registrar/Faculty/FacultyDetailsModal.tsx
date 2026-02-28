import { X } from "lucide-react";
import "../../../styles/faculty.css";

export type FacultyDB = {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  status: "active" | "inactive";
  department: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
};

type Props = {
  open: boolean;
  faculty: FacultyDB | null;
  loading: boolean;
  onClose: () => void;
};

export default function FacultyDetailsModal({
  open,
  faculty,
  loading,
  onClose,
}: Props) {
  if (!open) return null;

  /* ===============================
     FORMAT DATE (Readable Text)
  ================================ */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " • " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  };

  const fullName = faculty
    ? [faculty.firstName, faculty.middleName, faculty.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "--";

  const statusText =
    faculty?.status === "active"
      ? "Active"
      : faculty?.status === "inactive"
      ? "Inactive"
      : "—";

  return (
    <div className="fdm-backdrop" onClick={onClose} role="presentation">
      <div
        className="fdm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Faculty Details"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fdm-header">
          <h5 className="mb-0 fw-bold">Faculty Details</h5>
          <button className="fdm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="fdm-body">
          {loading ? (
            <div className="text-muted">Loading faculty details…</div>
          ) : !faculty ? (
            <div className="text-muted">No details found.</div>
          ) : (
            <div className="fdm-card">
              {/* Top Section */}
              <div className="d-flex align-items-center gap-3">
                <div className="fdm-avatar">{initials}</div>

                <div className="flex-grow-1">
                  <div className="fw-semibold fdm-name">{fullName}</div>
                  <div className="text-muted small">{faculty.idNumber}</div>

                  <span
                    className={`status-pill mt-2 d-inline-block ${
                      statusText === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>

              <hr className="my-3" />

              {/* Grid Details */}
              <div className="fdm-grid">
                <div className="fdm-item">
                  <div className="fdm-label">Email</div>
                  <div className="fdm-value">{faculty.email}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Phone</div>
                  <div className="fdm-value">{faculty.phone}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Gender</div>
                  <div className="fdm-value">{faculty.gender}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Department</div>
                  <div className="fdm-value">{faculty.department}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Role</div>
                  <div className="fdm-value">{faculty.role}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Created By</div>
                  <div className="fdm-value">{faculty.createdBy || "—"}</div>
                </div>

                <div className="fdm-item">
                  <div className="fdm-label">Created At</div>
                  <div className="fdm-value">
                    {formatDate(faculty.createdAt)}
                  </div>
                </div>

                <div className="fdm-item" style={{ gridColumn: "1 / -1" }}>
                  <div className="fdm-label">Notes</div>
                  <div className="fdm-value">{faculty.notes || "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fdm-footer">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}