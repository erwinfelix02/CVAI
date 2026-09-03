import "../../styles/FacultySidebar.css";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CheckSquare,
  Bell,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

const bottomNav = [
  {
    label: "Settings",
    icon: Settings,
    path: "/faculty/settings",
  },
  {
    label: "Help",
    icon: HelpCircle,
    path: "/faculty/help",
  },
];

export default function FacultySidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================================
     DYNAMIC COUNTS / DATA FETCHING
     ========================================================= */

  const [studentCount, setStudentCount] = useState<number | null>(null);

  // Get current user / faculty info from localStorage
  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchStudentCount = useCallback(async () => {
    try {
      const queryParam = user?.id ? `?facultyId=${encodeURIComponent(user.id)}` : "";
      const res = await fetch(`/api/faculty/students${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStudentCount(data.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch student count for sidebar:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStudentCount();
  }, [fetchStudentCount]);

  /* =========================================================
     MAIN NAVIGATION WITH BADGES
     ========================================================= */

  const nav = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/faculty",
      },
      {
        label: "Students",
        icon: Users,
        path: "/faculty/students",
        badge: studentCount !== null ? studentCount : 120,
      },
      {
        label: "My Classes",
        icon: BookOpen,
        path: "/faculty/classes",
      },
      {
        label: "Schedule",
        icon: Calendar,
        path: "/faculty/schedule",
      },
      {
        label: "Grade Management",
        icon: ClipboardCheck,
        path: "/faculty/grades",
        badge: 18,
      },
      {
        label: "Attendance",
        icon: CheckSquare,
        path: "/faculty/attendance",
      },
      {
        label: "Announcements",
        icon: Bell,
        path: "/faculty/announcements",
        badge: 2,
      },
      {
        label: "Course Materials",
        icon: FolderOpen,
        path: "/faculty/materials",
      },
    ],
    [studentCount]
  );

  /* =========================================================
     LOGOUT STATE
     ========================================================= */

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  /* =========================================================
     ACTIVE NAVIGATION HELPER
     ========================================================= */

  const isActive = (path: string) => {
    return path === "/faculty"
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  /* =========================================================
     MOBILE SIDEBAR CLOSE
     ========================================================= */

  const closeMobile = () => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  /* =========================================================
     LOGOUT HANDLERS & TIMERS
     ========================================================= */

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      // Clear user session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (isMobile && setMobileOpen) {
        setMobileOpen(false);
      }

      setIsLoggingOut(false);
      navigate("/signin", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setLogoutCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown, isMobile, setMobileOpen, navigate]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <aside
        className={`faculty-sidebar ${
          isMobile
            ? "expanded"
            : collapsed
            ? "collapsed"
            : "expanded"
        } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
      >
        {/* ================= HEADER ================= */}
        <div className="faculty-sidebar-header">
          {(!collapsed || isMobile) && (
            <div className="brand-container">
              <span className="brand-icon">
                <GraduationCap size={20} />
              </span>
              <div className="brand-text-container">
                <span className="brand-text fw-bold fs-5">CampusHub</span>
                <span className="sidebar-description text-muted small">
                  Faculty Portal
                </span>
              </div>
            </div>
          )}

          {!isMobile && toggleCollapsed && (
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center faculty-icon-btn"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}

          {isMobile && mobileOpen && setMobileOpen && (
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center faculty-icon-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* ================= MAIN NAV ================= */}
        <nav className="faculty-sidebar-nav">
          {nav.map(({ label, icon: Icon, badge, path }) => {
            const active = isActive(path);

            return (
              <Link
                to={path}
                key={label}
                className="text-decoration-none"
                onClick={closeMobile}
              >
                <div className={`nav-item ${active ? "active" : ""}`}>
                  <div className="nav-label">
                    <Icon size={18} />
                    {(!collapsed || isMobile) && <span>{label}</span>}
                  </div>

                  {(!collapsed || isMobile) && badge !== undefined && (
                    <span
                      className={`badge ${
                        typeof badge === "string" ? "badge-ai" : "bg-primary"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ================= BOTTOM NAV ================= */}
        <div className="faculty-sidebar-bottom">
          <div className="sidebar-separator" />

          {bottomNav.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);

            return (
              <Link
                to={path}
                key={label}
                className="text-decoration-none"
                onClick={closeMobile}
              >
                <div className={`nav-item ${active ? "active" : ""}`}>
                  <div className="nav-label">
                    <Icon size={18} />
                    {(!collapsed || isMobile) && <span>{label}</span>}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* LOGOUT BUTTON */}
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
              {(!collapsed || isMobile) && <span>Log Out</span>}
            </div>
          </div>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div
            className="logout-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-logout-title"
          >
            <div className="logout-modal">
              <h6 id="faculty-logout-title">Confirm Log Out</h6>
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