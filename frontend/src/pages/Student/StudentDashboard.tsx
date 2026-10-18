// ✅ src/pages/Student/StudentDashboard.tsx

import { useState, useEffect } from "react";
import { CheckCircle2, GraduationCap, UserCheck, Bot, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

import "./../../styles/student-dashboard.css";
import MyCalendar from "../../components/Student/MyCalendar";
import Announcements from "../../components/Student/Announcements";

interface StudentProfile {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  fullName?: string;
  idNumber?: string;
  studentIdNumber?: string;
  studentId?: string;
  student_id?: string;
  id_number?: string;
  email?: string;
  enrolledSubjects?: string[];
  role?: string;
  yearLevel?: number | string;
  year_level?: number | string;
  department?: string;
  program?: string;
  course?: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");
    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  useEffect(() => {
    if (!showWelcome) return;
    const fadeTimer = setTimeout(() => setIsWelcomeClosing(true), 1800);
    const removeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsWelcomeClosing(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [showWelcome]);

  useEffect(() => {
    if (!window.history.state || !window.history.state.guarded) {
      window.history.pushState({ guarded: true }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackLogoutConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const logLogoutActivity = async () => {
    try {
      const userEmail = studentProfile?.email || parsedUser?.email || "student@example.com";
      const userRole = studentProfile?.role || parsedUser?.role || "Student";

      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") || localStorage.getItem("sessionToken") || ""
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

    const timer = setTimeout(() => setLogoutCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown, navigate]);

  // Robustly fetch user data AND extended student records on mount
  useEffect(() => {
    async function fetchStudentDashboardData() {
      if (parsedUser) setStudentProfile(parsedUser);

      try {
        const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const userEmail = parsedUser?.email || localStorage.getItem("userEmail");
        const userId = parsedUser?.id || parsedUser?._id || localStorage.getItem("userId");

        let meUrl = `${API_BASE_URL}/users/me`;
        if (userId) meUrl += `?id=${encodeURIComponent(userId)}`;
        else if (userEmail) meUrl += `?email=${encodeURIComponent(userEmail)}`;

        const userRes = await fetch(meUrl, { headers });
        const userData = userRes.ok ? await userRes.json() : {};

        // Query extended Student collection using student ID or email
        const studentQueryId =
          userData.idNumber ||
          userData.studentIdNumber ||
          parsedUser?.studentIdNumber ||
          userId ||
          userEmail;

        let studentData: any = null;
        if (studentQueryId) {
          try {
            const studentRes = await fetch(
              `${API_BASE_URL}/students/${encodeURIComponent(studentQueryId)}`,
              { headers },
            );
            if (studentRes.ok) {
              studentData = await studentRes.json();
            }
          } catch (e) {
            console.warn("Could not fetch extended student record in dashboard", e);
          }
        }

        // Merge user account details and student collection record
        setStudentProfile({
          ...parsedUser,
          ...userData,
          ...(studentData || {}),
        });
      } catch (err) {
        console.error("Failed to fetch student dashboard data", err);
      }
    }

    fetchStudentDashboardData();
  }, []);

  // 1. Robustly resolve Full Name
  const studentFullName =
    studentProfile?.name ||
    studentProfile?.fullName ||
    [studentProfile?.firstName, studentProfile?.middleName, studentProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    parsedUser?.name ||
    parsedUser?.fullName ||
    [parsedUser?.firstName, parsedUser?.lastName].filter(Boolean).join(" ") ||
    "Student";

  // 2. Robustly resolve Student ID Number
  const studentIdDisplay =
    studentProfile?.idNumber ||
    studentProfile?.studentIdNumber ||
    studentProfile?.studentId ||
    studentProfile?.id_number ||
    studentProfile?.student_id ||
    parsedUser?.idNumber ||
    parsedUser?.studentIdNumber ||
    "2024-00001";

  // 3. Robustly resolve Year Level & format it
  const rawYear =
    studentProfile?.yearLevel ||
    studentProfile?.year_level ||
    parsedUser?.yearLevel ||
    parsedUser?.year_level ||
    1;

  const formatYearLevel = (year: number | string) => {
    const y = Number(year);
    if (!y || isNaN(y)) return "1st Year";
    if (y === 1) return "1st Year";
    if (y === 2) return "2nd Year";
    if (y === 3) return "3rd Year";
    if (y >= 4) return `${y}th Year`;
    return `${y} Year`;
  };

  const studentYearLevel = formatYearLevel(rawYear);

  // 4. Robustly resolve Program / Course
  const studentProgram =
    studentProfile?.program ||
    studentProfile?.course ||
    studentProfile?.department ||
    parsedUser?.program ||
    parsedUser?.course ||
    "Bachelor of Science in Information Technology";

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

      {showBackLogoutConfirm && (
        <div className="logout-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal">
            <h6>Confirm Log Out</h6>
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

      {/* HEADER SECTION */}
      <header className="student-dashboard-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1">Welcome back, {studentFullName}!</h1>
          <p className="text-muted mb-0">{studentProgram}</p>
        </div>
        <div className="text-end text-muted small fw-medium">
          {currentDateFormatted}
        </div>
      </header>

      {/* ID NUMBER & YEAR LEVEL CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card border border-secondary-subtle shadow-sm p-3 rounded-4 d-flex flex-row align-items-center gap-3 bg-white">
            <div className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Student ID</span>
              <h5 className="fw-bold text-dark mb-0">{studentIdDisplay}</h5>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border border-secondary-subtle shadow-sm p-3 rounded-4 d-flex flex-row align-items-center gap-3 bg-white">
            <div className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              <UserCheck size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Year Level</span>
              <h5 className="fw-bold text-dark mb-0">{studentYearLevel}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION QUICK BUTTONS */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className="btn btn-light border d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-dark fw-medium bg-white shadow-sm"
          onClick={() => navigate("/student/profile")}
        >
          <User size={16} className="text-secondary" />
          My Profile
        </button>
        <button
          type="button"
          className="btn btn-light border d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-dark fw-medium bg-white shadow-sm"
          onClick={() => navigate("/student/aiassistant")}
        >
          <Bot size={16} className="text-secondary" />
          AI Assistant
        </button>
      </div>

      {/* SIDE-BY-SIDE CARDS FOR CALENDAR AND ANNOUNCEMENTS */}
      <div className="row g-3 my-3">
        <div className="col-12 col-xl-8">
          <div className="card border border-secondary-subtle shadow-sm p-4 rounded-4 bg-white h-100">
            <MyCalendar />
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card border border-secondary-subtle shadow-sm p-4 rounded-4 bg-white h-100">
            <Announcements />
          </div>
        </div>
      </div>
    </>
  );
}