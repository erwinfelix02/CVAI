// ✅ src/pages/Student/StudentDashboard.tsx

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import "./../../styles/student-dashboard.css";
import StatsGrid from "../../components/Student/StatsGrid";
import TodaySchedule from "../../components/Student/TodaySchedule";
import Announcements from "../../components/Student/Announcements";
import AcademicProgress from "../../components/Student/AcademicProgress";

interface UserProfile {
  firstName: string;
  lastName: string;
  middleName?: string;
  idNumber?: string;
  email?: string;
}

interface RegistrarSettings {
  academicYear: string;
  semester: string;
}

export default function StudentDashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // State initialized with safe fallback values to prevent empty ", A.Y." rendering
  const [academicSettings, setAcademicSettings] = useState<RegistrarSettings>({
    academicYear: "2025-2026",
    semester: "1st Semester",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

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

  // 3. Fetch signed-in student profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userEmail = parsedUser?.email || localStorage.getItem("userEmail");
        const userId = parsedUser?.id || parsedUser?._id || localStorage.getItem("userId");

        let url = "/api/users/me";
        if (userId) {
          url += `?id=${encodeURIComponent(userId)}`;
        } else if (userEmail) {
          url += `?email=${encodeURIComponent(userEmail)}`;
        }

        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
      }
    }

    fetchProfile();
  }, []);

  // 4. Fetch dynamic Registrar Settings (Academic Year & Semester)
  useEffect(() => {
    async function fetchRegistrarSettings() {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/registrar-settings", { headers });
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

  // Construct full student name dynamically
  const studentFullName = userProfile
    ? `${userProfile.firstName} ${userProfile.middleName ? userProfile.middleName + " " : ""}${userProfile.lastName}`.trim()
    : "Student";

  // Formatted Semester String Helper
  const formattedSemester =
    academicSettings.semester && academicSettings.academicYear
      ? `${academicSettings.semester}, A.Y. ${academicSettings.academicYear}`
      : academicSettings.semester || academicSettings.academicYear || "2nd Semester, A.Y. 2025-2026";

  return (
    <>
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

      <header className="student-dashboard-header">
        <div className="welcome-text marquee">
          <div className="marquee-track">
            <div className="marquee-item">
              <h1>Welcome back, {studentFullName}!</h1>
              <p>Here's what's happening today</p>
            </div>
            <div className="marquee-item" aria-hidden="true">
              <h1>Welcome back, {studentFullName}!</h1>
              <p>Here's what's happening today</p>
            </div>
          </div>
        </div>

        {/* Dynamic Current Semester section */}
        <div className="current-semester">
          <span className="label">Current Semester</span>
          <span className="semester">
            {isLoadingSettings ? "Loading..." : formattedSemester}
          </span>
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