import { useMemo, useState } from "react";
import ScheduleCard from "../../components/Student/ScheduleCard";
import WeeklySummary from "../../components/Student/WeeklySummary";
import { Calendar } from "lucide-react";
import "./../../styles/student-schedulepage.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function getTodayIndexMonToSat() {
  // JS: Sun=0, Mon=1 ... Sat=6
  const js = new Date().getDay();
  // convert to Mon=0..Sat=5, (Sun -> -1)
  const idx = js - 1;
  // if Sunday -> fallback to Saturday (5)
  return idx < 0 ? 5 : Math.min(idx, 5);
}

export default function StudentSchedulePage() {
  const todayIndex = useMemo(() => getTodayIndexMonToSat(), []);
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);

  const activeDay = days[activeDayIndex];

  return (
    <div className="student-schedule">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 header-container">
        <div className="header-text">
          <h3 className="fw-bold mb-1">Class Schedule</h3>
          <p className="text-muted mb-0">
            2nd Semester, A.Y. 2024–2025 • <span className="fw-semibold">{activeDay}</span>
          </p>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2 mt-3 mt-md-0">
          <Calendar size={16} />
          Export Schedule
        </button>
      </div>

      {/* Day Tabs */}
      <div className="card shadow-sm mb-3">
        <div className="card-body p-2">
          <div className="row g-2">
            {days.map((day, i) => {
              const isActive = i === activeDayIndex;
              const isToday = i === todayIndex;

              return (
                <div key={day} className="col">
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex(i)}
                    className={`w-100 rounded-pill py-2 fw-medium border-0 ${
                      isActive ? "bg-primary text-white" : "bg-light text-secondary"
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span className={`badge ms-2 ${isActive ? "bg-white text-primary" : "bg-primary text-white"}`}>
                        Today
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedule (demo — later you can filter by activeDayIndex) */}
      <ScheduleCard
        time="8:00 – 9:30"
        title="Mathematics 101"
        code="MATH101"
        room="Room 301"
        instructor="Dr. Santos"
        type="Lecture"
      />

      <ScheduleCard
        time="10:00 – 11:30"
        title="Computer Science"
        code="CS201"
        room="Lab 2"
        instructor="Prof. Garcia"
        type="Laboratory"
      />

      <ScheduleCard
        time="1:00 – 2:30"
        title="English Literature"
        code="ENG102"
        room="Room 205"
        instructor="Dr. Reyes"
        type="Lecture"
      />

      {/* Weekly Summary (also date-based) */}
      <WeeklySummary />
    </div>
  );
}
