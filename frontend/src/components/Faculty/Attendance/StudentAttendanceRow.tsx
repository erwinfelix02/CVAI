import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { StudentItem } from "./attendance.types";

type StudentAttendanceRowProps = {
  student: StudentItem;
  isRecorded: boolean;
  onSetPresent: () => void;
  onSetAbsent: () => void;
};

export default function StudentAttendanceRow({
  student,
  isRecorded,
  onSetPresent,
  onSetAbsent,
}: StudentAttendanceRowProps) {
  const [imageError, setImageError] = useState(false);

  const isPresent = student.status === "present";
  const isAbsent = student.status === "absent";
  const isLate = student.status === "late";

  // Helper to format backend local server or absolute avatar URL paths
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

  const resolvedAvatarUrl = getFullAvatarUrl(student.avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

  // Compute initials from name fallback
  const getInitials = (name: string) => {
    const parts = (name || "").trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (name || "").slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`p-3 mb-2 rounded-4 border d-flex align-items-center justify-content-between gap-3 transition-all ${
        isPresent
          ? "bg-emerald-light border-emerald-subtle"
          : isAbsent
          ? "bg-rose-light border-rose-subtle"
          : isLate
          ? "bg-amber-light border-amber-subtle"
          : "bg-white border-light-subtle"
      }`}
    >
      {/* Student Info with Account Profile Avatar */}
      <div className="d-flex align-items-center gap-3 min-w-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 overflow-hidden border"
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            backgroundColor: showAvatar ? "transparent" : "#3b82f6",
          }}
        >
          {showAvatar ? (
            <img
              src={resolvedAvatarUrl}
              alt={student.name}
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
            getInitials(student.name)
          )}
        </div>
        <div className="text-truncate">
          <h6 className="fw-bold text-dark mb-0 text-truncate">
            {student.name}
          </h6>
          <small className="text-muted">{student.studentNo}</small>
        </div>
      </div>

      {/* Interactive Status Toggle Buttons */}
      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        {isLate && (
          <span className="badge bg-amber text-white px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1">
            <Clock size={16} />
            <span>Late</span>
          </span>
        )}

        <button
          type="button"
          onClick={onSetPresent}
          disabled={isRecorded}
          title={isRecorded ? "Record is locked" : "Mark Present"}
          className={`btn d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-medium border transition-all ${
            isPresent
              ? "btn-emerald text-white shadow-sm border-transparent"
              : "btn-white bg-white text-secondary border-light-subtle shadow-sm hover-bg-light"
          } ${isRecorded ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          <CheckCircle2 size={18} />
          <span>Present</span>
        </button>

        <button
          type="button"
          onClick={onSetAbsent}
          disabled={isRecorded}
          title={isRecorded ? "Record is locked" : "Mark Absent"}
          className={`btn d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-medium border transition-all ${
            isAbsent
              ? "btn-rose text-white shadow-sm border-transparent"
              : "btn-white bg-white text-secondary border-light-subtle shadow-sm hover-bg-light"
          } ${isRecorded ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          <XCircle size={18} />
          <span>Absent</span>
        </button>
      </div>
    </div>
  );
}