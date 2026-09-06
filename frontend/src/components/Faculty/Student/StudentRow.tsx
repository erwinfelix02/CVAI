import { Eye, Mail } from "lucide-react";
import type { Student } from "./types";

type StudentRowProps = Student & {
  onView: (student: Student) => void;
  onEmail: (student: Student) => void;
};

export default function StudentRow(props: StudentRowProps) {
  const { initials, name, id, section, gpa, attendance, status, onView, onEmail } = props;

  return (
    <div className="student-row">
      {/* LEFT */}
      <div className="student-left">
        <div className="student-avatar">{initials}</div>

        <div>
          <div className="student-name">
            {name}
            <span className={`status-dot ${status}`} />
          </div>
          <div className="student-meta">
            {id} • {section}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="student-metrics d-none d-md-flex">
        <div className="metric">
          <span className={`metric-value ${gpa < 3 ? "warning" : "good"}`}>
            {gpa.toFixed(2)}
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
          className="btn btn-link p-0 text-secondary border-0"
          onClick={() => onView(props)}
          title="View Student"
        >
          <Eye size={18} />
        </button>
        <button
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