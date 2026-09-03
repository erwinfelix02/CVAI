import type { DaySchedule } from "../../../pages/Faculty/TeachingSchedulePage";
import FacultyClassCard from "./FacultyClassCard";
import { CalendarX } from "lucide-react";

export default function FacultyDayColumn({ day }: { day: DaySchedule }) {
  const hasItems = day.items && day.items.length > 0;

  return (
    <div className={`faculty-day card h-100 ${day.isToday ? "is-today" : ""}`}>
      <div className="card-body d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="fw-bold">{day.label}</div>
          {day.isToday && <span className="faculty-today-badge">Today</span>}
        </div>

        {hasItems ? (
          <div className="d-flex flex-column gap-3">
            {day.items.map((it) => (
              <FacultyClassCard key={it.id} item={it} />
            ))}
          </div>
        ) : (
          /* Centered Empty State Container */
          <div className="faculty-empty-day flex-grow-1 my-auto">
            <CalendarX size={24} className="text-muted mb-2 opacity-50" />
            <div className="text-muted small fw-medium">No classes scheduled</div>
          </div>
        )}
      </div>
    </div>
  );
}