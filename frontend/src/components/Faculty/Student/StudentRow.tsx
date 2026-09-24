// src/components/Faculty/Student/StudentRow.tsx

import { useState } from "react";
import { Eye, Mail } from "lucide-react";
import { formatYearLevel, type Student } from "./types";

type StudentRowProps = Student & {
  onView: (student: Student) => void;
  onEmail: (student: Student) => void;
};

export default function StudentRow(props: StudentRowProps) {
  const {
    initials,
    name,
    id,
    section,
    year,
    gpa = 0,
    attendance = 0,
    status,
    avatarUrl,
    onView,
    onEmail,
  } = props;

  const [imageError, setImageError] = useState(false);

  const displayInitials =
    initials ||
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");

  const yearLabel = formatYearLevel(year);

  // Helper to format proper image source URL
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
    // Prepend http://localhost:5000 if running Vite dev proxy without path rewrite
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolvedAvatarUrl = getFullAvatarUrl(avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

  return (
    <div className="student-row d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
      {/* LEFT */}
      <div className="student-left d-flex align-items-center gap-3">
        {/* Avatar Circle Container */}
        <div
          className="student-avatar-wrap d-flex align-items-center justify-content-center flex-shrink-0 text-dark fw-bold rounded-circle overflow-hidden bg-light border position-relative"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
          }}
        >
          {showAvatar ? (
            <img
              src={resolvedAvatarUrl}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                borderRadius: "50%",
              }}
              onError={(_e) => {
                console.warn(`Failed to load avatar image for ${name}:`, resolvedAvatarUrl);
                setImageError(true);
              }}
            />
          ) : (
            <span style={{ fontSize: "14px" }}>{displayInitials}</span>
          )}
        </div>

        <div>
          <div className="student-name fw-semibold d-flex align-items-center gap-2">
            {name}
            <span className={`status-dot ${status}`} />
          </div>
          <div className="student-meta text-muted small">
            {id} • {yearLabel ? `${yearLabel} - ` : ""}{section || "—"}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="student-metrics d-none d-md-flex align-items-center gap-4">
        <div className="metric text-center">
          <span className={`metric-value fw-bold ${gpa < 3 ? "text-warning" : "text-success"}`}>
            {typeof gpa === "number" ? gpa.toFixed(2) : "0.00"}
          </span>
          <span className="metric-label d-block text-muted small">GPA</span>
        </div>

        <div className="metric text-center">
          <span className="metric-value fw-bold text-dark">{attendance}%</span>
          <span className="metric-label d-block text-muted small">Attendance</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="student-actions d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-link p-1 text-secondary border-0"
          onClick={() => onView(props)}
          title="View Student"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          className="btn btn-link p-1 text-secondary border-0"
          onClick={() => onEmail(props)}
          title="Email Student"
        >
          <Mail size={18} />
        </button>
      </div>
    </div>
  );
}