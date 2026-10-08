import { CalendarDays } from "lucide-react";
import type { SubjectAttendance } from "../../../pages/Student/AttendancePage";

function barClass(percent: number) {
  if (percent >= 90) return "bg-success";
  if (percent >= 80) return "bg-warning";
  return "bg-danger";
}

function percentClass(percent: number) {
  if (percent >= 90) return "text-success";
  if (percent >= 80) return "text-warning";
  return "text-danger";
}

export default function AttendanceBySubject({
  items,
}: {
  items: SubjectAttendance[];
}) {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CalendarDays size={20} className="text-primary" />
          <h4 className="fw-bold mb-0">Attendance by Subject</h4>
        </div>

        <div className="d-flex flex-column gap-4">
          {items.map((s) => (
            <div key={s.code} className="att-subject-row">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="min-w-0">
                  <div className="fw-semibold att-subject-name">{s.subject}</div>
                  <div className="text-muted small">{s.code}</div>
                </div>

                <div className="text-end flex-shrink-0">
                  <div className={`fw-bold att-subject-percent ${percentClass(s.percent)}`}>
                    {s.percent}%
                  </div>
                  <div className="text-muted small">
                    {s.present}/{s.totalClasses} classes
                  </div>
                  <div className="att-mini-counts small mt-1">
                    <span className="text-success">{s.present}P</span>
                    <span className="text-danger ms-2">{s.absent}A</span>
                    <span className="text-warning ms-2">{s.late}L</span>
                  </div>
                </div>
              </div>

              <div className="progress att-progress mt-2" role="progressbar" aria-valuenow={s.percent} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`progress-bar ${barClass(s.percent)}`}
                  style={{ width: `${s.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
