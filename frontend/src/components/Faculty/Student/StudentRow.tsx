import { Eye, MoreHorizontal } from "lucide-react";
import type { Student } from "./types";

export default function StudentRow({
  initials,
  name,
  id,
  section,
  gpa,
  attendance,
  status,
}: Student) {
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
        <Eye size={18} />
        <MoreHorizontal size={18} />
      </div>
    </div>
  );
}
