import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import "../../styles/faculty-dashboard.css";
import FacultyStatsGrid from "../../components/Faculty/Dashboard/FacultyStatsGrid";
import TodayClasses from "../../components/Faculty/Dashboard/TodayClasses";
import PendingTasks from "../../components/Faculty/Dashboard/PendingTasks";
import RecentSubmissions from "../../components/Faculty/Dashboard/RecentSubmissions";

export default function FacultyDashboard() {
  /* =========================================================
     WELCOME MESSAGE STATE
     ========================================================= */

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  /* =========================================================
     CHECK WELCOME MESSAGE AFTER LOGIN
     ========================================================= */

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");

    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);

      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  /* =========================================================
     AUTO CLOSE WELCOME OVERLAY
     ========================================================= */

  useEffect(() => {
    if (!showWelcome) return;

    const fadeTimer = setTimeout(() => {
      setIsWelcomeClosing(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsWelcomeClosing(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [showWelcome]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* WELCOME OVERLAY */}
      {showWelcome && (
        <div
          className={`welcome-overlay ${isWelcomeClosing ? "fade-out" : ""}`}
        >
          <div className={`welcome-box ${isWelcomeClosing ? "fade-out" : ""}`}>
            <div className="welcome-icon-wrap">
              <CheckCircle2 size={34} />
            </div>

            <h4>{welcomeMessage}</h4>

            <p>You have successfully signed in.</p>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className="faculty-dashboard-container">
        {/* Header */}
        <header className="faculty-dashboard-header">
          <div>
            <h1 className="faculty-title mb-1">Good morning, Prof. Garcia!</h1>
            <p className="faculty-subtitle mb-0">
              Here's your teaching overview for today
            </p>
          </div>

          <div className="faculty-academic-year text-md-end">
            <span className="faculty-ay-label">Academic Year</span>
            <span className="faculty-ay-value">2nd Semester, 2024–2025</span>
          </div>
        </header>

        {/* Stats Cards */}
        <FacultyStatsGrid />

        {/* Today + Pending */}
        <div className="row g-3 mt-2">
          <div className="col-12 col-xl-8">
            <TodayClasses />
          </div>
          <div className="col-12 col-xl-4">
            <PendingTasks />
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="row g-3 mt-2">
          <div className="col-12">
            <RecentSubmissions />
          </div>
        </div>
      </div>
    </>
  );
}