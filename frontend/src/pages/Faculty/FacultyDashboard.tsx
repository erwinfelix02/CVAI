import "./../../styles/faculty-dashboard.css";
import FacultyStatsGrid from "../../components/Faculty/Dashboard/FacultyStatsGrid";
import TodayClasses from "../../components/Faculty/Dashboard/TodayClasses";
import PendingTasks from "../../components/Faculty/Dashboard/PendingTasks";
import RecentSubmissions from "../../components/Faculty/Dashboard/RecentSubmissions";

export default function FacultyDashboard() {
  return (
    <>
      {/* Header */}
      <header className="faculty-dashboard-header">
        <div>
          <h1 className="faculty-title mb-1">Good morning, Prof. Garcia!</h1>
          <p className="text-muted mb-0">Here's your teaching overview for today</p>
        </div>

        <div className="faculty-academic-year text-md-end">
          <span className="label">Academic Year</span>
          <span className="value">2nd Semester, 2024–2025</span>
        </div>
      </header>

      <FacultyStatsGrid />

      {/* Today + Pending */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-xl-8">
          <TodayClasses />
        </div>
        <div className="col-12 col-xl-4">
          <PendingTasks />
        </div>
      </div>

      {/* Recent submissions */}
      <div className="row g-3 mt-1">
        <div className="col-12">
          <RecentSubmissions />
        </div>
      </div>
    </>
  );
}
