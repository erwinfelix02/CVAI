import { CalendarDays } from "lucide-react";
import type { StudentItem } from "../../../pages/Faculty/AttendanceTrackingPage";
import StudentAttendanceRow from "./StudentAttendanceRow";

export default function AttendanceList({
  subjectLabel,
  dateLabel,
  presentSummary,
  students,
  onSetPresent,
  onSetAbsent,
}: {
  subjectLabel: string;
  dateLabel: string;
  presentSummary: string;
  students: StudentItem[];
  onSetPresent: (id: string) => void;
  onSetAbsent: (id: string) => void;
}) {
  return (
    <div className="card att-list-card">
      <div className="card-body">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <CalendarDays size={18} />
            <div className="fw-bold">
              {subjectLabel} | {dateLabel}
            </div>
          </div>

          <span className="att-pill">{presentSummary}</span>
        </div>

        <div className="att-rows">
          {students.map((s) => (
            <StudentAttendanceRow
              key={s.id}
              student={s}
              onSetPresent={() => onSetPresent(s.id)}
              onSetAbsent={() => onSetAbsent(s.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
