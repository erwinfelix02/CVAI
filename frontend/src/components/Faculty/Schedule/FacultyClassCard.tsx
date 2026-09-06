import { Clock, MapPin, Users } from "lucide-react";
import type { ScheduleItem } from "../../../pages/Faculty/TeachingSchedulePage";

export default function FacultyClassCard({ item }: { item: ScheduleItem }) {
  return (
    <div className={`faculty-class-card tone-${item.tone}`}>
      <div className="d-flex align-items-center gap-2 faculty-class-time">
        <Clock size={16} />
        <span>
          {item.start} - {item.end} {item.meridiem}
        </span>
      </div>

      <div className="faculty-class-code">{item.code}</div>
      <div className="faculty-class-title">{item.title}</div>

      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="d-flex align-items-center gap-2 faculty-class-meta">
          <MapPin size={16} />
          <span>{item.locationLabel}</span>
        </div>

        <div className="d-flex align-items-center gap-2 faculty-class-meta">
          <Users size={16} />
          <span>{item.students}</span>
        </div>
      </div>
    </div>
  );
}