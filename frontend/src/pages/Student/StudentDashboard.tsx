import "./../../styles/student-dashboard.css";
import StatsGrid from "../../components/Student/StatsGrid";
import TodaySchedule from "../../components/Student/TodaySchedule";
import Announcements from "../../components/Student/Announcements";
import AcademicProgress from "../../components/Student/AcademicProgress";

export default function StudentDashboard() {
  return (
    <>
      <header className="student-dashboard-header">
        <div className="welcome-text marquee">
          <div className="marquee-track">
            <div className="marquee-item">
              <h1>Welcome back, Juan!</h1>
              <p>Here's what's happening today</p>
            </div>
            <div className="marquee-item" aria-hidden="true">
              <h1>Welcome back, Juan!</h1>
              <p>Here's what's happening today</p>
            </div>
          </div>
        </div>

        {/* Current Semester section */}
        <div className="current-semester">
          <span className="label">Current Semester</span>
          <span className="semester">2nd Semester, 2025–2026</span>
        </div>
      </header>

      <StatsGrid />

      <div className="row g-3 my-3">
        <div className="col-12 col-xl-8">
          <TodaySchedule />
        </div>
        <div className="col-12 col-xl-4">
          <Announcements />
        </div>
      </div>

      <AcademicProgress />
    </>
  );
}
