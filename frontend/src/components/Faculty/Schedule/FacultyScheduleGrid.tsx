import type { DaySchedule } from "../../../pages/Faculty/TeachingSchedulePage";
import FacultyDayColumn from "./FacultyDayColumn";

export default function FacultyScheduleGrid({ days }: { days: DaySchedule[] }) {
  return (
    <div className="faculty-schedule-scroll mb-4">
      <div className="faculty-schedule-grid">
        {days.map((d) => (
          <FacultyDayColumn key={d.key} day={d} />
        ))}
      </div>
    </div>
  );
}
