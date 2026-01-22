import { CalendarDays } from "lucide-react";
import ClassRow from "./ClassRow";

const classes = [
  { time: "8:00 AM", code: "CS 101", title: "Intro to Programming", meta: "Lab 1 • 35 students", status: "completed" as const },
  { time: "10:00 AM", code: "CS 201", title: "Data Structures", meta: "Room 302 • 42 students", status: "ongoing" as const },
  { time: "1:00 PM", code: "CS 301", title: "Algorithms", meta: "Room 401 • 28 students", status: "upcoming" as const },
  { time: "3:00 PM", code: "CS 401", title: "Software Engineering", meta: "Lab 2 • 19 students", status: "upcoming" as const },
];

export default function TodayClasses() {
  return (
    <div className="card shadow-sm faculty-card">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="section-icon">
            <CalendarDays size={18} />
          </span>
          <h5 className="mb-0 fw-bold">Today's Classes</h5>
        </div>

        {/* ✅ Scrollable list */}
        <div className="faculty-class-list">
          {classes.map((c) => (
            <ClassRow key={`${c.time}-${c.code}`} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}

