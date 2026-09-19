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
    onView,
    onEmail,
  } = props;

  const displayInitials =
    initials ||
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");

  const yearLabel = formatYearLevel(year);

  return (
    <div className="student-row">
      {/* LEFT */}
      <div className="student-left">
        <div className="student-avatar">{displayInitials}</div>

        <div>
          <div className="student-name">
            {name}
            <span className={`status-dot ${status}`} />
          </div>
          <div className="student-meta">
            {id} • {yearLabel ? `${yearLabel} - ` : ""}{section || "—"}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="student-metrics d-none d-md-flex">
        <div className="metric">
          <span className={`metric-value ${gpa < 3 ? "warning" : "good"}`}>
            {typeof gpa === "number" ? gpa.toFixed(2) : "0.00"}
          </span>
          <span className="metric-label">GPA</span>
        </div>

        <div className="metric">
          <span className="metric-value">{attendance}%</span>
          <span className="metric-label">Attendance</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="student-actions">
        <button
          type="button"
          className="btn btn-link p-0 text-secondary border-0"
          onClick={() => onView(props)}
          title="View Student"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          className="btn btn-link p-0 text-secondary border-0"
          onClick={() => onEmail(props)}
          title="Email Student"
        >
          <Mail size={18} />
        </button>
      </div>
    </div>
  );
}