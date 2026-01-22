import { CalendarClock } from "lucide-react";

const schedule = [
  { time: "8:00 AM", title: "Mathematics 101", room: "Room 301", status: "completed" },
  { time: "10:00 AM", title: "Computer Science", room: "Lab 2", status: "ongoing" },
  { time: "1:00 PM", title: "English Literature", room: "Room 205", status: "upcoming" },
  { time: "3:00 PM", title: "Physics", room: "Room 401", status: "upcoming" },
  { time: "3:00 PM", title: "Physics", room: "Room 401", status: "upcoming" },
  { time: "3:00 PM", title: "Physics", room: "Room 401", status: "upcoming" },
];

export default function TodaySchedule() {
  return (
    <div className="card schedule-card shadow-sm p-3 d-flex flex-column h-100">
      {/* Title with icon */}
      <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2 flex-shrink-0">
        <CalendarClock size={20} className="text-primary" />
        Today's Schedule
      </h5>

      {/* Scrollable content */}
      <div className="schedule-list flex-grow-1">
  {schedule.map((c) => (
    <div
      key={c.time}
      className={`d-flex justify-content-between align-items-center p-2 mb-2 border rounded ${
        c.status === "ongoing" ? "border-primary bg-primary bg-opacity-10" : ""
      }`}
    >
      <div className="d-flex align-items-center gap-3">
        <span
          className="text-muted small"
          style={{ minWidth: 60, textAlign: "right" }}
        >
          {c.time}
        </span>
        <div>
          <p className="mb-1 fw-medium">{c.title}</p>
          <p className="small text-muted mb-0">{c.room}</p>
        </div>
      </div>

      <span className="badge bg-secondary text-white">
        {c.status}
      </span>
    </div>
  ))}
</div>

    </div>
  );
}
