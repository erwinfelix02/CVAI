import { CheckCircle2, XCircle } from "lucide-react";
import type { StudentItem } from "../../../pages/Faculty/AttendanceTrackingPage";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "S") + (parts[parts.length - 1]?.[0] ?? "T");
}

export default function StudentAttendanceRow({
  student,
  onSetPresent,
  onSetAbsent,
}: {
  student: StudentItem;
  onSetPresent: () => void;
  onSetAbsent: () => void;
}) {
  const rowTone =
    student.status === "present"
      ? "row-present"
      : student.status === "absent"
      ? "row-absent"
      : "row-pending";

  return (
    <div className={`att-row ${rowTone}`}>
      <div className="d-flex align-items-center gap-3">
        <div className="att-avatar">{initials(student.name)}</div>
        <div>
          <div className="fw-semibold">{student.name}</div>
          <div className="text-muted">{student.studentNo}</div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button
          className={`btn att-toggle ${student.status === "present" ? "is-on is-present" : ""}`}
          onClick={onSetPresent}
          type="button"
        >
          <CheckCircle2 size={18} className="me-2" />
          Present
        </button>

        <button
          className={`btn att-toggle ${student.status === "absent" ? "is-on is-absent" : ""}`}
          onClick={onSetAbsent}
          type="button"
        >
          <XCircle size={18} className="me-2" />
          Absent
        </button>
      </div>
    </div>
  );
}
