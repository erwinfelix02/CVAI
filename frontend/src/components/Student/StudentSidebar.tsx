import "../../styles/StudentSidebar.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Home,
  Bot,
  User,
  Calendar,
  Book,
  CheckCircle,
  Bell,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

export default function StudentSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================================
     USER SESSION & LOGOUT STATE
     ========================================================= */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);
  
  // 🟢 Live Announcement Count State for Sidebar Badge
  const [announcementCount, setAnnouncementCount] = useState<number>(0);

  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch actual announcement count for the sidebar badge
  useEffect(() => {
    async function fetchSidebarAnnouncementCount() {
      try {
        const storedUser =
          localStorage.getItem("user") || localStorage.getItem("studentProfile");
        const student = storedUser ? JSON.parse(storedUser) : null;

        const studentSection = student?.section || "BSHTM-01";
        const studentCourses = Array.isArray(student?.enrolledSubjects)
          ? student.enrolledSubjects.join(",")
          : "MAT151";
        const department =
          student?.department || "College of Hospitality Management Technology";

        const params = new URLSearchParams({
          studentSection,
          studentCourses,
          department,
        });

        const res = await fetch(`/api/announcements?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAnnouncementCount(data.length);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sidebar announcement count:", err);
      }
    }

    fetchSidebarAnnouncementCount();
  }, []);

  const nav = [
    { label: "Dashboard", icon: Home, path: "/student" },
    {
      label: "AI Assistant",
      icon: Bot,
      badge: "AI",
      path: "/student/aiassistant",
    },
    { label: "My Profile", icon: User, path: "/student/profile" },
    { label: "Schedule", icon: Calendar, path: "/student/schedule" },
    { label: "Grades", icon: Book, path: "/student/grades" },
    { label: "Attendance", icon: CheckCircle, path: "/student/attendance" },
    {
      label: "Announcements",
      icon: Bell,
      badge: announcementCount > 0 ? announcementCount : undefined,
      path: "/student/announcements",
    },
    {
      label: "My Courses",
      icon: Book,
      path: "/student/courses",
    },
    { label: "Documents", icon: FileText, path: "/student/documents" },
  ];

  /* =========================================================
     LOGOUT AUDIT LOGGING & TIMER HANDLERS
     ========================================================= */
  const logLogoutActivity = async () => {
    try {
      const userEmail = user?.email || "student@example.com";
      const userRole = user?.role || "Student";

      await fetch("http://localhost:5000/api/logs", {
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
          details: `${userEmail} logged out of the student portal.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log student logout activity:", err);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      async function finalizeLogout() {
        await logLogoutActivity();

        // Clear user session
        localStorage.removeItem("token");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");

        if (isMobile && setMobileOpen) {
          setMobileOpen(false);
        }

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
  }, [isLoggingOut, logoutCountdown, isMobile, setMobileOpen, navigate]);

  return (
    <>
      <aside
        className={`student-sidebar ${
          isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
        } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Header */}
        <div className="student-sidebar-header">
          {(!collapsed || isMobile) && (
            <div className="brand-container">
              <span className="brand-icon">
                <GraduationCap size={20} />
              </span>
              <div className="brand-text-container">
                <span className="brand-text fw-bold fs-5">CampusHub</span>
                <span className="sidebar-description text-muted small">
                  Student Portal
                </span>
              </div>
            </div>
          )}

          {/* Desktop collapse button */}
          {!isMobile && toggleCollapsed && (
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}

          {/* Mobile close button */}
          {isMobile && mobileOpen && setMobileOpen && (
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="student-sidebar-nav">
          {nav.map(({ label, icon: Icon, badge, path }) => {
            const isActive =
              path === "/student"
                ? location.pathname === path
                : location.pathname.startsWith(path);

            return (
              <Link
                to={path}
                key={label}
                className="text-decoration-none"
                onClick={() => {
                  if (isMobile && setMobileOpen) setMobileOpen(false);
                }}
              >
                <div className={`nav-item ${isActive ? "active" : ""}`}>
                  <div className="nav-label">
                    <Icon size={18} />
                    {(!collapsed || isMobile) && <span>{label}</span>}
                  </div>
                  {(!collapsed || isMobile) && badge !== undefined && (
                    <span className="badge bg-primary">{badge}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="student-sidebar-bottom">
          <div className="sidebar-separator" />

          {/* Help Center */}
          <Link
            to="/student/help"
            className="text-decoration-none"
            onClick={() => {
              if (isMobile && setMobileOpen) setMobileOpen(false);
            }}
          >
            <div
              className={`nav-item ${
                location.pathname.startsWith("/student/help") ? "active" : ""
              }`}
            >
              <div className="nav-label">
                <HelpCircle size={18} />
                {(!collapsed || isMobile) && <span>Help Center</span>}
              </div>
            </div>
          </Link>

          {/* Logout */}
          <div
            className="nav-item nav-item-danger"
            role="button"
            tabIndex={0}
            onClick={() => setShowLogoutConfirm(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setShowLogoutConfirm(true);
              }
            }}
            aria-label="Log out"
          >
            <div className="nav-label">
              <LogOut size={18} />
              {(!collapsed || isMobile) && <span>Logout</span>}
            </div>
          </div>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div
            className="logout-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-logout-title"
          >
            <div className="logout-modal">
              <h6 id="student-logout-title">Confirm Log Out</h6>
              <p>Are you sure you want to log out?</p>
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* LOGGING OUT OVERLAY */}
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
    </>
  );
}