import type { DaySchedule } from "../../../pages/Faculty/TeachingSchedulePage";
import FacultyClassCard from "./FacultyClassCard";

export default function FacultyDayColumn({ day }: { day: DaySchedule }) {
  return (
    <div className={`faculty-day card ${day.isToday ? "is-today" : ""}`}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="fw-bold">{day.label}</div>
          {day.isToday && <span className="faculty-today-badge">Today</span>}
        </div>

        <div className="d-flex flex-column gap-3">
          {day.items.map((it) => (
            <FacultyClassCard key={it.id} item={it} />
          ))}
        </div>
      </div>
    </div>
  );
}
