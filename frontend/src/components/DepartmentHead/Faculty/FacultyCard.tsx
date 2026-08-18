// ✅ src/components/DepartmentHead/Faculty/FacultyCard.tsx

import {
  Eye,
  Mail,
} from "lucide-react";

export type FacultyStatus =
  | "Available"
  | "Full Load"
  | "Overloaded";

export interface FacultyRow {
  id: number;

  initials: string;
  name: string;

  position: string;
  specialization: string;

  email: string;

  subjects: string[];

  currentLoad: number;
  maxLoad: number;

  status: FacultyStatus;
}

interface FacultyCardProps {
  faculty: FacultyRow;

  onView?: (faculty: FacultyRow) => void;
}

export default function FacultyCard({
  faculty,
  onView,
}: FacultyCardProps) {
  const loadPercentage = Math.min(
    (faculty.currentLoad / faculty.maxLoad) * 100,
    100
  );

  const statusClass =
    faculty.status === "Available"
      ? "faculty-status-available"
      : faculty.status === "Full Load"
        ? "faculty-status-full"
        : "faculty-status-overloaded";

  const progressClass =
    faculty.status === "Overloaded"
      ? "faculty-progress-overloaded"
      : "faculty-progress-normal";

  return (
    <div className="faculty-card">
      {/* =====================================================
          FACULTY INFORMATION
          ===================================================== */}

      <div className="faculty-information">
        <div className="faculty-avatar">
          {faculty.initials}
        </div>

        <div className="faculty-details">
          {/* Name + Status */}
          <div className="faculty-name-row">
            <h5 className="faculty-name">
              {faculty.name}
            </h5>

            <span
              className={`faculty-status ${statusClass}`}
            >
              {faculty.status}
            </span>
          </div>

          {/* Position */}
          <div className="faculty-position">
            {faculty.position}
            <span className="faculty-dot">·</span>
            {faculty.specialization}
          </div>

          {/* Email */}
          <div className="faculty-email">
            <Mail size={15} />

            <span>{faculty.email}</span>
          </div>

          {/* Subjects */}
          <div className="faculty-subjects">
            {faculty.subjects.map((subject) => (
              <span
                className="faculty-subject"
                key={subject}
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          TEACHING LOAD
          ===================================================== */}

      <div className="faculty-load">
        <div className="faculty-load-header">
          <span>Load</span>

          <span>
            {faculty.currentLoad}/{faculty.maxLoad} units
          </span>
        </div>

        <div className="faculty-progress">
          <div
            className={`faculty-progress-bar ${progressClass}`}
            style={{
              width: `${loadPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          VIEW BUTTON
          ===================================================== */}

      <button
        type="button"
        className="faculty-view-btn"
        onClick={() => onView?.(faculty)}
      >
        <Eye size={19} />

        <span>View</span>
      </button>
    </div>
  );
}