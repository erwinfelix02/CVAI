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
  const isPresent = student.status === "present";
  const isAbsent = student.status === "absent";
  const isLate = student.status === "late";

  // Compute initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
      {/* Student Info with Avatar */}
      <div className="d-flex align-items-center gap-3 min-w-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            backgroundColor: isPresent
              ? "#10b981"
              : isAbsent
              ? "#f43f5e"
              : isLate
              ? "#f59e0b"
              : "#475569",
          }}
        >
          {getInitials(student.name)}
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
        {/* Late indicator badge if status was saved as late via modal */}
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