import { CalendarDays, ClipboardX, FolderSearch, Lock } from "lucide-react";
import type { StudentItem } from "./attendance.types";
import StudentAttendanceRow from "./StudentAttendanceRow";

type AttendanceListProps = {
  subjectSelected: boolean;
  dateSelected: boolean;
  subjectLabel: string;
  dateLabel: string;
  presentSummary: string;
  students: StudentItem[];
  isRecorded: boolean;
  onSetPresent: (id: string) => void;
  onSetAbsent: (id: string) => void;
  onOpenModal: () => void;
};

export default function AttendanceList({
  subjectSelected,
  dateSelected,
  subjectLabel,
  dateLabel,
  presentSummary,
  students,
  isRecorded,
  onSetPresent,
  onSetAbsent,
}: AttendanceListProps) {
  if (!subjectSelected || !dateSelected) {
    return (
      <div className="card att-list-card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <FolderSearch size={48} className="text-muted mb-3" />
          <h5 className="fw-bold">Select Course and Date</h5>
          <p className="text-muted mb-0">
            Please select both a course and a date above to view attendance records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card att-list-card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        {/* Header summary info */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2 mb-4">
          <div className="d-flex align-items-center gap-2">
            <CalendarDays size={20} className="text-secondary" />
            <div className="fw-bold fs-5 text-dark">
              {subjectLabel} | {dateLabel}
            </div>
            {isRecorded && (
              <span className="badge bg-secondary d-inline-flex align-items-center gap-1 ms-2">
                <Lock size={12} /> Recorded
              </span>
            )}
          </div>

          <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fs-6 fw-semibold">
            {presentSummary}
          </span>
        </div>

        {/* Student Row Cards or Clean Empty State */}
        {students.length > 0 ? (
          <div className="att-rows d-flex flex-column gap-1">
            {students.map((s) => (
              <StudentAttendanceRow
                key={s.id}
                student={s}
                isRecorded={isRecorded}
                onSetPresent={() => onSetPresent(s.id)}
                onSetAbsent={() => onSetAbsent(s.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <ClipboardX size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Attendance Records Found</h5>
            <p className="text-muted mb-0">
              There are no attendance records for <strong>{subjectLabel}</strong> on{" "}
              <strong>{dateLabel}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}