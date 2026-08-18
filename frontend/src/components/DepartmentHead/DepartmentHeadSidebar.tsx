// src/components/DepartmentHead/DepartmentHeadSidebar.tsx

import "../../styles/DepartmentHeadSidebar.css";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

/* =========================================================
   MAIN NAVIGATION
   ========================================================= */

const nav = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dept-head",
  },
  {
    label: "Faculty",
    icon: Users,
    path: "/dept-head/faculty",
    badge: 24,
  },
  {
    label: "Subjects",
    icon: BookOpen,
    path: "/dept-head/subjects",
  },
  {
    label: "Schedules",
    icon: CalendarDays,
    path: "/dept-head/schedules",
  },
  {
    label: "Rooms",
    icon: DoorOpen,
    path: "/dept-head/rooms",
  },
];

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

const bottomNav = [
  {
    label: "Settings",
    icon: Settings,
    path: "/dept-head/settings",
  },
  {
    label: "Help",
    icon: HelpCircle,
    path: "/dept-head/help",
  },
];

export default function DepartmentHeadSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================================
     LOGOUT STATE
     ========================================================= */

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [logoutCountdown, setLogoutCountdown] =
    useState(3);

  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  const isActive = (path: string) => {
    return path === "/dept-head"
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  /* =========================================================
     MOBILE CLOSE
     ========================================================= */

  const closeMobile = () => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  /* =========================================================
     LOGOUT COUNTDOWN
     ========================================================= */

  useEffect(() => {
    if (!isLoggingOut) {
      return;
    }

    /* -----------------------------------------------
       Countdown finished
       ----------------------------------------------- */

    if (logoutCountdown <= 0) {
      // Remove authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Close mobile sidebar
      if (isMobile && setMobileOpen) {
        setMobileOpen(false);
      }

      // Stop loading state
      setIsLoggingOut(false);

      // Redirect to sign in
      navigate("/signin", {
        replace: true,
      });

      return;
    }

    /* -----------------------------------------------
       Countdown timer
       ----------------------------------------------- */

    const timer = setTimeout(() => {
      setLogoutCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isLoggingOut,
    logoutCountdown,
    isMobile,
    setMobileOpen,
    navigate,
  ]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside
        className={`dept-sidebar ${
          isMobile
            ? "expanded"
            : collapsed
            ? "collapsed"
            : "expanded"
        } ${
          isMobile && mobileOpen
            ? "mobile-open"
            : ""
        }`}
      >
        {/* =================================================
            SIDEBAR HEADER
            ================================================= */}

        <div className="dept-sidebar-header">

          {/* Brand */}

          {(!collapsed || isMobile) && (
            <div className="brand-container">

              <span className="brand-icon">
                <GraduationCap size={20} />
              </span>

              <div className="brand-text-container">
                <span className="brand-text fw-bold fs-5">
                  CampusHub
                </span>

                <span className="sidebar-description text-muted small">
                  Department Head
                </span>
              </div>

            </div>
          )}

          {/* =================================================
              DESKTOP COLLAPSE BUTTON
              ================================================= */}

          {!isMobile && toggleCollapsed && (
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center dept-icon-btn"
              onClick={toggleCollapsed}
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          )}

          {/* =================================================
              MOBILE CLOSE BUTTON
              ================================================= */}

          {isMobile &&
            mobileOpen &&
            setMobileOpen && (
              <button
                type="button"
                className="btn p-0 d-flex align-items-center justify-content-center dept-icon-btn"
                onClick={() =>
                  setMobileOpen(false)
                }
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
        </div>

        {/* =================================================
            MAIN NAVIGATION
            ================================================= */}

        <nav className="dept-sidebar-nav">

          {nav.map(
            ({
              label,
              icon: Icon,
              badge,
              path,
            }) => {
              const active = isActive(path);

              return (
                <Link
                  to={path}
                  key={label}
                  className="text-decoration-none"
                  onClick={closeMobile}
                >
                  <div
                    className={`nav-item ${
                      active ? "active" : ""
                    }`}
                  >

                    <div className="nav-label">

                      <Icon size={18} />

                      {(!collapsed ||
                        isMobile) && (
                        <span>{label}</span>
                      )}

                    </div>

                    {/* Faculty Badge */}

                    {(!collapsed ||
                      isMobile) &&
                      badge != null && (
                        <span className="badge dept-badge">
                          {badge}
                        </span>
                      )}

                  </div>
                </Link>
              );
            }
          )}

        </nav>

        {/* =================================================
            BOTTOM NAVIGATION
            ================================================= */}

        <div className="dept-sidebar-bottom">

          <div className="sidebar-separator" />

          {/* Settings / Help */}

          {bottomNav.map(
            ({
              label,
              icon: Icon,
              path,
            }) => {
              const active = isActive(path);

              return (
                <Link
                  to={path}
                  key={label}
                  className="text-decoration-none"
                  onClick={closeMobile}
                >
                  <div
                    className={`nav-item ${
                      active ? "active" : ""
                    }`}
                  >

                    <div className="nav-label">

                      <Icon size={18} />

                      {(!collapsed ||
                        isMobile) && (
                        <span>{label}</span>
                      )}

                    </div>

                  </div>
                </Link>
              );
            }
          )}

          {/* =================================================
              LOG OUT
              ================================================= */}

          <div
            className="nav-item nav-item-danger"
            role="button"
            tabIndex={0}
            onClick={() =>
              setShowLogoutConfirm(true)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                setShowLogoutConfirm(true);
              }
            }}
            aria-label="Log out"
          >

            <div className="nav-label">

              <LogOut size={18} />

              {(!collapsed ||
                isMobile) && (
                <span>Log Out</span>
              )}

            </div>

          </div>
        </div>

        {/* =================================================
            LOGOUT CONFIRMATION MODAL
            ================================================= */}

        {showLogoutConfirm && (
          <div
            className="logout-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dept-logout-title"
          >
            <div className="logout-modal">

              <h6 id="dept-logout-title">
                Confirm Log Out
              </h6>

              <p>
                Are you sure you want to log out?
              </p>

              <div className="d-flex gap-2 justify-content-end">

                {/* Cancel */}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setShowLogoutConfirm(false)
                  }
                >
                  Cancel
                </button>

                {/* Confirm */}

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

      {/* =====================================================
          LOGGING OUT OVERLAY
          ===================================================== */}

      {isLoggingOut && (
        <div
          className="logging-out-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="logging-out-box">

            <div
              className="logging-spinner"
              aria-hidden="true"
            />

            <h5>
              Logging out...
            </h5>

            <p>
              Redirecting in{" "}
              {logoutCountdown}{" "}
              second
              {logoutCountdown !== 1
                ? "s"
                : ""}
            </p>

          </div>
        </div>
      )}
    </>
  );
}