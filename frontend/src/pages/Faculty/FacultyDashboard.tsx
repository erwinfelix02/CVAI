// ✅ src/components/Faculty/Dashboard/FacultyDashboard.tsx

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../../styles/faculty-dashboard.css";
import FacultyStatsGrid from "../../components/Faculty/Dashboard/FacultyStatsGrid";
import TodayClasses from "../../components/Faculty/Dashboard/TodayClasses";
import PendingTasks from "../../components/Faculty/Dashboard/PendingTasks";
import { API_BASE_URL } from "../../config"; // 🟢 Centralized API Configuration

export default function FacultyDashboard() {
  const navigate = useNavigate();

  /* =========================================================
     WELCOME MESSAGE STATE
     ========================================================= */

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  /* =========================================================
     DYNAMIC USER, SEMESTER & ACADEMIC YEAR STATE
     ========================================================= */

  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [facultyName, setFacultyName] = useState("Faculty Member");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [greeting, setGreeting] = useState("Good Morning");
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  /* =========================================================
     BACK NAVIGATION LOGOUT & COUNTDOWN STATES
     ========================================================= */
  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

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

    // Retrieve tokens from storage
    const token =
      localStorage.getItem("sessionToken") || localStorage.getItem("token");

    // 2. Fetch logged-in user profile
    const fetchProfile = async () => {
      try {
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : {};

        if (storedUser.firstName || storedUser.lastName || storedUser.name) {
          setFacultyProfile(storedUser);
          setFacultyName(formatFacultyName(storedUser));
        }

        const queryParams = new URLSearchParams();
        if (storedUser?.id || storedUser?._id) {
          queryParams.append("id", storedUser.id || storedUser._id);
        } else if (storedUser?.email) {
          queryParams.append("email", storedUser.email);
        }

        // 🟢 Uses API_BASE_URL config
        const res = await fetch(`${API_BASE_URL}/users/me?${queryParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFacultyProfile(data);
          setFacultyName(formatFacultyName(data));
        }
      } catch (err) {
        console.error("Failed to fetch signed-in profile:", err);
      }
    };

    // 3. Fetch active Academic Year & Semester saved by the Registrar
    const fetchSettings = async () => {
      setIsSettingsLoading(true);
      try {
        // 🟢 Uses API_BASE_URL config
        const res = await fetch(`${API_BASE_URL}/registrar/settings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const data = await res.json();
          const payload = Array.isArray(data) ? data[0] : data;

          if (payload) {
            setAcademicYear(payload.academicYear || "2023-2024");
            setSemester(payload.semester || "2nd Semester");
          }
        } else {
          console.error("Failed to load registrar settings. HTTP Status:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch registrar settings:", err);
      } finally {
        setIsSettingsLoading(false);
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
     INTERCEPT BACK BUTTON (Trigger Logout Confirmation)
     ========================================================= */
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

  /* =========================================================
     LOGOUT AUDIT & COUNTDOWN HANDLERS
     ========================================================= */
  const logLogoutActivity = async () => {
    try {
      const userEmail = facultyProfile?.email || "faculty@example.com";
      const userRole = facultyProfile?.role || "Faculty";

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
          details: `${userEmail} logged out of the faculty portal via back navigation.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log faculty logout activity:", err);
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

      {/* LOGGING OUT OVERLAY WITH COUNTDOWN */}
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
              {isSettingsLoading ? (
                <span className="d-inline-flex align-items-center gap-1 opacity-75">
                  <Loader2 size={14} className="spinner-border spinner-border-sm" />
                  <span>Loading term...</span>
                </span>
              ) : semester || academicYear ? (
                `${semester}${semester && academicYear ? ", " : ""}${academicYear}`
              ) : (
                "Not Available"
              )}
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
      </div>
    </>
  );
}