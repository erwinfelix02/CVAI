import { CalendarDays } from "lucide-react";


export default function FacultyScheduleHeader({
  title,
  subtitle,
  pillText,
}: {
  title: string;
  subtitle: string;
  pillText: string;
}) {
  return (
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <div className="text-muted">{subtitle}</div>
      </div>

      <div className="faculty-schedule-pill">
        <CalendarDays size={18} />
        <span className="fw-semibold">{pillText}</span>
      </div>
    </div>
  );
}
