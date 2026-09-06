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
     DYNAMIC USER, SEMESTER & ACADEMIC YEAR STATE
     ========================================================= */

  const [facultyName, setFacultyName] = useState("Faculty Member");
  const [academicYear, setAcademicYear] = useState("2024–2025");
  const [semester, setSemester] = useState("2nd Semester");
  const [greeting, setGreeting] = useState("Good Morning");

  /* =========================================================
     TIME-BASED GREETING CALCULATOR
     ========================================================= */

  const calculateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  /* =========================================================
     FORMAT FACULTY DISPLAY NAME
     ========================================================= */

  const formatFacultyName = (user: {
    lastName?: string;
    firstName?: string;
    name?: string;
  }) => {
    if (user.lastName) {
      return `Prof. ${user.lastName}`;
    }
    if (user.firstName) {
      return `Prof. ${user.firstName}`;
    }
    if (user.name) {
      const parts = user.name.trim().split(" ");
      const lastName = parts[parts.length - 1];
      return `Prof. ${lastName}`;
    }
    return "Faculty Member";
  };

  /* =========================================================
     FETCH SIGNED-IN FACULTY PROFILE & REGISTRAR SETTINGS
     ========================================================= */

  useEffect(() => {
    // 1. Calculate greeting based on local time
    setGreeting(calculateGreeting());

    // 2. Fetch logged-in user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : {};

        // Immediately set name from local session if available
        if (storedUser.firstName || storedUser.lastName || storedUser.name) {
          setFacultyName(formatFacultyName(storedUser));
        }

        // Fetch fresh profile data for signed-in user
        const queryParams = new URLSearchParams();
        if (storedUser?.id || storedUser?._id) {
          queryParams.append("id", storedUser.id || storedUser._id);
        } else if (storedUser?.email) {
          queryParams.append("email", storedUser.email);
        }

        const res = await fetch(`/api/users/me?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFacultyName(formatFacultyName(data));
        }
      } catch (err) {
        console.error("Failed to fetch signed-in profile:", err);
      }
    };

    // 3. Fetch active Academic Year & Semester
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/registrar-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.academicYear) setAcademicYear(data.academicYear);
          if (data.semester) setSemester(data.semester);
        }
      } catch (err) {
        console.error("Failed to fetch registrar settings:", err);
      }
    };

    fetchProfile();
    fetchSettings();
  }, []);

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
            <h1 className="faculty-title mb-1">
              {greeting}, {facultyName}!
            </h1>
            <p className="faculty-subtitle mb-0">
              Here's your teaching overview for today
            </p>
          </div>

          <div className="faculty-academic-year text-md-end">
            <span className="faculty-ay-label">Academic Year</span>
            <span className="faculty-ay-value">
              {semester}, {academicYear}
            </span>
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
