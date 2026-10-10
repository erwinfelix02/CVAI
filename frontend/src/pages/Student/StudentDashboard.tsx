// ✅ src/pages/Student/StudentDashboard.tsx

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

import "./../../styles/student-dashboard.css";
import StatsGrid from "../../components/Student/StatsGrid";
import TodaySchedule from "../../components/Student/TodaySchedule";
import Announcements from "../../components/Student/Announcements";
import AcademicProgress from "../../components/Student/AcademicProgress";

interface StudentProfile {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  idNumber?: string;
  email?: string;
  enrolledSubjects?: string[];
  role?: string;
}

interface RegistrarSettings {
  academicYear: string;
  semester: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Live performance stats from grades endpoint
  const [studentGpa, setStudentGpa] = useState<string>("1.00");
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState<number>(0);

  const [academicSettings, setAcademicSettings] = useState<RegistrarSettings>({
    academicYear: "2025-2026",
    semester: "1st Semester",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Back navigation logout & countdown states (matching StudentSidebar logic)
  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  // Parse local storage user fallback
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  // 1. Check for sign-in welcome message in localStorage
  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");
    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  // 2. Auto-fade out the welcome overlay
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

  // 2.5. Intercept browser Back button (custom modal trigger)
  useEffect(() => {
    if (!window.history.state || !window.history.state.guarded) {
      window.history.pushState({ guarded: true }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackLogoutConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 2.6. Handle countdown and session destruction just like the Sidebar logout
  const logLogoutActivity = async () => {
    try {
      const userEmail = studentProfile?.email || parsedUser?.email || "student@example.com";
      const userRole = studentProfile?.role || parsedUser?.role || "Student";

      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") ||
            localStorage.getItem("sessionToken") ||
            ""
          }`,
        },
        body: JSON.stringify({
          action: "Logout",
          user: userEmail,
          role: userRole,
          type: "Security",
          details: `${userEmail} logged out of the student portal via back navigation.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log student logout activity:", err);
    }
  };

  const handleBackLogoutConfirm = () => {
    setShowBackLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      async function finalizeLogout() {
        await logLogoutActivity();

        // Clear user session tokens
        localStorage.removeItem("token");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");

        setIsLoggingOut(false);
        navigate("/signin", { replace: true });
      }

      finalizeLogout();
      return;
    }

    const timer = setTimeout(() => {
      setLogoutCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown, navigate]);

  // 3. Fetch Student Profile and Live Grades Data via Authenticated Session (/users/me)
  useEffect(() => {
    async function fetchStudentData() {
      if (parsedUser) {
        setStudentProfile(parsedUser);
      }

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const userRes = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (userRes.ok) {
          const userData = await userRes.json();
          setStudentProfile(userData);
        }

        const gradesRes = await fetch(`${API_BASE_URL}/students/my-grades`, { headers });
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          if (gradesData.success) {
            if (gradesData.gpa) setStudentGpa(gradesData.gpa);
            if (gradesData.unitsEnrolled !== undefined) {
              setTotalCredits(gradesData.unitsEnrolled);
              setEnrolledCoursesCount(Object.keys(gradesData.grades || {}).length || gradesData.unitsEnrolled / 3);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch student dashboard data", err);
      }
    }

    fetchStudentData();
  }, []);

  // 4. Fetch dynamic Registrar Settings
  useEffect(() => {
    async function fetchRegistrarSettings() {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/registrar-settings`, { headers });
        if (res.ok) {
          const data = await res.json();
          setAcademicSettings({
            academicYear: data?.academicYear || "2025-2026",
            semester: data?.semester || "1st Semester",
          });
        }
      } catch (err) {
        console.error("Failed to fetch registrar settings:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    }

    fetchRegistrarSettings();
  }, []);

  const studentFullName = studentProfile
    ? studentProfile.name ||
      [studentProfile.firstName, studentProfile.middleName, studentProfile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      parsedUser?.firstName ||
      "Student"
    : parsedUser?.firstName
    ? `${parsedUser.firstName} ${parsedUser.lastName || ""}`.trim()
    : "Student";

  const formattedSemester =
    academicSettings.semester && academicSettings.academicYear
      ? `${academicSettings.semester}, A.Y. ${academicSettings.academicYear}`
      : "1st Semester, A.Y. 2025-2026";

  const fallbackEnrolledCount = Array.isArray(studentProfile?.enrolledSubjects)
    ? studentProfile.enrolledSubjects.length
    : 0;

  const finalCoursesCount = enrolledCoursesCount > 0 ? enrolledCoursesCount : fallbackEnrolledCount;

  return (
    <>
      {showWelcome && (
        <div className={`welcome-overlay ${isWelcomeClosing ? "fade-out" : ""}`}>
          <div className={`welcome-box ${isWelcomeClosing ? "fade-out" : ""}`}>
            <div className="welcome-icon-wrap">
              <CheckCircle2 size={34} />
            </div>
            <h4>{welcomeMessage}</h4>
            <p>You have successfully signed in.</p>
          </div>
        </div>
      )}

      {/* BACK NAVIGATION LOGOUT CONFIRMATION MODAL */}
      {showBackLogoutConfirm && (
        <div
          className="logout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="back-logout-title"
        >
          <div className="logout-modal">
            <h6 id="back-logout-title">Confirm Log Out</h6>
            <p>Going back will log you out of your session. Are you sure?</p>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowBackLogoutConfirm(false);
                  window.history.pushState({ guarded: true }, "", window.location.href);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleBackLogoutConfirm}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGGING OUT OVERLAY WITH COUNTDOWN (Matches Sidebar Style) */}
      {isLoggingOut && (
        <div className="logging-out-overlay" role="status" aria-live="polite">
          <div className="logging-out-box">
            <div className="logging-spinner" aria-hidden="true" />
            <h5>Logging out...</h5>
            <p>
              Redirecting in {logoutCountdown} second
              {logoutCountdown !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <header className="student-dashboard-header">
        <div className="welcome-text marquee">
          <div className="marquee-track">
            <div className="marquee-item">
              <h1>Welcome back, {studentFullName || "Student"}!</h1>
              <p>Here's what's happening today</p>
            </div>
            <div className="marquee-item" aria-hidden="true">
              <h1>Welcome back, {studentFullName || "Student"}!</h1>
              <p>Here's what's happening today</p>
            </div>
          </div>
        </div>

        <div className="current-semester">
          <span className="label">Current Semester</span>
          <span className="semester">
            {isLoadingSettings ? "Loading..." : formattedSemester}
          </span>
        </div>
      </header>

      {/* Pass live GPA, Attendance, Courses, and Credits to StatsGrid */}
      <StatsGrid 
        enrolledCoursesCount={finalCoursesCount} 
        liveGpa={studentGpa} 
        liveCredits={totalCredits > 0 ? totalCredits : finalCoursesCount * 3} 
      />

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