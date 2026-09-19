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
import { STUDENT_COUNT_UPDATED_EVENT } from "../../utils/studentCount";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const FACULTY_ROLE_ID = "faculty";

type NavItem = {
  label: string;
  icon: any;
  path: string;
  badge?: number | string;
  controlled?: boolean;
};

/* =========================================================
   CONTROLLED PERMISSIONS MAPPING
   Matches exact keys from ROLE_ALLOWED.faculty:
   ["grade_management", "class_materials", "attendance"]
   ========================================================= */
const CONTROLLED_PERM: Record<string, string> = {
  "Grade Management": "grade_management",
  "Course Materials": "class_materials",
  Attendance: "attendance",
};

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
     DYNAMIC COUNTS & PERMISSIONS / DATA FETCHING
     ========================================================= */

  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [announcementCount, setAnnouncementCount] = useState<number | null>(null);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

  // Get current user / faculty info from localStorage
  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch faculty role permissions dynamically
  useEffect(() => {
    async function loadPerms() {
      setLoadingPerms(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/roles/${FACULTY_ROLE_ID}`
        );
        if (!res.ok) {
          console.error("Failed to fetch faculty role perms:", res.status);
          setPermissions([]);
          return;
        }

        const role = await res.json();
        setPermissions(Array.isArray(role?.permissions) ? role.permissions : []);
      } catch (e) {
        console.error("Failed to load faculty permissions", e);
        setPermissions([]);
      } finally {
        setLoadingPerms(false);
      }
    }

    loadPerms();
  }, []);

  // Fetch total student count from the student management API
  const fetchStudentCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
      const facultyId = user?.id || user?._id || "";
      const facultyName =
        user?.name ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.email || "");

      const queryParams = new URLSearchParams();
      if (facultyId) queryParams.append("facultyId", facultyId);
      if (facultyName) queryParams.append("facultyName", facultyName);

      const res = await fetch(`/api/students?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const loadedStudents = Array.isArray(data)
          ? data
          : data.students || [];
        setStudentCount(loadedStudents.length);
      }
    } catch (err) {
      console.error("Failed to fetch student count for sidebar:", err);
    }
  }, [user]);

  // Fetch announcements count dynamically from backend
  const fetchAnnouncementCount = useCallback(async () => {
    try {
      const facultyId = user?.id || user?._id || "";
      const department = user?.department || "";

      const queryParams = new URLSearchParams();
      if (facultyId) queryParams.append("facultyId", facultyId);
      if (department) queryParams.append("department", department);

      const res = await fetch(`/api/announcements?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAnnouncementCount(data.length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch announcement count for sidebar:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchStudentCount();
    fetchAnnouncementCount();

    // Listen for custom student count updates emitted from StudentsPage
    const handleStudentCountUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      if (typeof customEvent.detail?.count === "number") {
        setStudentCount(customEvent.detail.count);
      }
    };

    window.addEventListener(
      STUDENT_COUNT_UPDATED_EVENT,
      handleStudentCountUpdate
    );

    return () => {
      window.removeEventListener(
        STUDENT_COUNT_UPDATED_EVENT,
        handleStudentCountUpdate
      );
    };
  }, [fetchStudentCount, fetchAnnouncementCount]);

  /* =========================================================
     MAIN NAVIGATION WITH CONTROLLED PERMISSIONS
     ========================================================= */

  const nav: NavItem[] = useMemo(
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
        badge: studentCount !== null ? studentCount : 0,
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
        controlled: true,
      },
      {
        label: "Attendance",
        icon: CheckSquare,
        path: "/faculty/attendance",
        controlled: true,
      },
      {
        label: "Announcements",
        icon: Bell,
        path: "/faculty/announcements",
        badge: announcementCount !== null ? announcementCount : 0,
      },
      {
        label: "Course Materials",
        icon: FolderOpen,
        path: "/faculty/materials",
        controlled: true,
      },
    ],
    [studentCount, announcementCount]
  );

  /* Filter visible nav items based on granted role permissions */
  const visibleNav = useMemo(() => {
    return nav.filter((item) => {
      if (!item.controlled) return true;
      if (loadingPerms) return false;

      const permKey = CONTROLLED_PERM[item.label];
      return permissions.includes(permKey);
    });
  }, [nav, permissions, loadingPerms]);

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

  const logLogoutActivity = async () => {
    try {
      const userEmail = user?.email || "faculty@example.com";
      const userRole = user?.role || "Faculty";

      await fetch("http://localhost:5000/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("sessionToken") || ""}`,
        },
        body: JSON.stringify({
          action: "Logout",
          user: userEmail,
          role: userRole,
          type: "Security",
          details: `${userEmail} logged out of the system.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log faculty logout activity:", err);
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
          {visibleNav.map(({ label, icon: Icon, badge, path }) => {
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