import "../../styles/registrar-sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRegistrarByRole } from "../../api/userService";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserPlus,
  Layers,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  Bot,
  BookOpen,
  Building2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const REGISTRAR_ROLE_ID = "registrar";

type NavItem = {
  label: string;
  icon: any;
  path: string;
  badge?: string;
  controlled?: boolean;
};

type RegistrarAccount = {
  _id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

const nav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/registrar" },
  {
    label: "Applications",
    icon: FileText,
    path: "/registrar/applications",
    controlled: true,
  },
  {
    label: "Students",
    icon: Users,
    path: "/registrar/students",
    controlled: true,
  },
  {
    label: "Enrollment",
    icon: UserPlus,
    path: "/registrar/enrollment",
    controlled: true,
  },
  {
    label: "Documents",
    icon: FolderOpen,
    path: "/registrar/documents",
    controlled: true,
  },
  { label: "Sections", icon: Layers, path: "/registrar/sections" },
  { label: "Courses", icon: BookOpen, path: "/registrar/courses" },
  { label: "Departments", icon: Building2, path: "/registrar/departments" },
  { label: "Faculty Accounts", icon: Users, path: "/registrar/faculty" },
  { label: "AI Assistant", icon: Bot, path: "/registrar/ai-assistant", badge: "AI" },
];

const CONTROLLED_PERM: Record<string, string> = {
  Applications: "process_applications",
  Students: "manage_students",
  Enrollment: "manage_enrollment",
  Documents: "manage_documents",
};

export default function RegistrarSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

  const [registrarAccount, setRegistrarAccount] =
    useState<RegistrarAccount | null>(null);

  useEffect(() => {
    async function loadPerms() {
      setLoadingPerms(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/roles/${REGISTRAR_ROLE_ID}`,
        );
        if (!res.ok) {
          console.error("Failed to fetch role perms:", res.status);
          setPermissions([]);
          return;
        }

        const role = await res.json();
        setPermissions(Array.isArray(role?.permissions) ? role.permissions : []);
      } catch (e) {
        console.error("Failed to load permissions", e);
        setPermissions([]);
      } finally {
        setLoadingPerms(false);
      }
    }

    loadPerms();
  }, []);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/preregistrations/pending-count",
        );
        const data = await res.json();
        setPendingCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    }

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadRegistrarAccount() {
      try {
        const data = await getRegistrarByRole();
        setRegistrarAccount(data || null);
      } catch (err) {
        console.error("Failed to load registrar account", err);
        setRegistrarAccount(null);
      }
    }

    loadRegistrarAccount();
  }, []);

  const visibleNav = useMemo(() => {
    return nav.filter((item) => {
      if (!item.controlled) return true;
      if (loadingPerms) return false;

      const permKey = CONTROLLED_PERM[item.label];
      return permissions.includes(permKey);
    });
  }, [permissions, loadingPerms]);

  const logLogoutActivity = async () => {
    try {
      const userEmail = registrarAccount?.email || "registrar@example.com";
      const userRole = registrarAccount?.role || "Registrar";

      await fetch("http://localhost:5000/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
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
      console.error("Failed to log logout activity", err);
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

        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");

        if (isMobile && setMobileOpen) setMobileOpen(false);

        setIsLoggingOut(false);
        navigate("/signin");
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
        className={`registrar-sidebar ${
          isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
        } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="registrar-sidebar-header">
          {(!collapsed || isMobile) && (
            <div className="brand-container">
              <span className="brand-icon">
                <GraduationCap size={20} />
              </span>
              <div className="brand-text-container">
                <span className="brand-text fw-bold fs-5">CampusHub</span>
                <span className="sidebar-description text-muted small">
                  Registrar Portal
                </span>
              </div>
            </div>
          )}

          {!isMobile && toggleCollapsed && (
            <button
              className="btn p-0 d-flex align-items-center justify-content-center"
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
              type="button"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}

          {isMobile && mobileOpen && setMobileOpen && (
            <button
              className="btn p-0 d-flex align-items-center justify-content-center"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="registrar-sidebar-nav">
          {visibleNav.map(({ label, icon: Icon, badge, path }) => {
            const isActive =
              path === "/registrar"
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

                  {(!collapsed || isMobile) &&
                    label === "Applications" &&
                    pendingCount > 0 && (
                      <span className="badge bg-warning text-dark">
                        {pendingCount}
                      </span>
                    )}

                  {(!collapsed || isMobile) &&
                    badge &&
                    label !== "Applications" && (
                      <span className="badge bg-primary">{badge}</span>
                    )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="registrar-sidebar-bottom">
          <div className="sidebar-separator" />

          <Link
            to="/registrar/settings"
            className="text-decoration-none"
            onClick={() => {
              if (isMobile && setMobileOpen) setMobileOpen(false);
            }}
          >
            <div
              className={`nav-item ${
                location.pathname.startsWith("/registrar/settings") ? "active" : ""
              }`}
            >
              <div className="nav-label">
                <Settings size={18} />
                {(!collapsed || isMobile) && <span>Settings</span>}
              </div>
            </div>
          </Link>

          <Link
            to="/registrar/help"
            className="text-decoration-none"
            onClick={() => {
              if (isMobile && setMobileOpen) setMobileOpen(false);
            }}
          >
            <div
              className={`nav-item ${
                location.pathname.startsWith("/registrar/help") ? "active" : ""
              }`}
            >
              <div className="nav-label">
                <HelpCircle size={18} />
                {(!collapsed || isMobile) && <span>Help Center</span>}
              </div>
            </div>
          </Link>

          <div
            className="nav-item nav-item-danger"
            role="button"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <div className="nav-label">
              <LogOut size={18} />
              {(!collapsed || isMobile) && <span>Logout</span>}
            </div>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="logout-overlay">
            <div className="logout-modal">
              <h6>Confirm Logout</h6>
              <p>Are you sure you want to logout?</p>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowLogoutConfirm(false)}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {isLoggingOut && (
        <div className="logging-out-overlay">
          <div className="logging-out-box">
            <div className="logging-spinner" />
            <h5>Logging out...</h5>
            <p>Redirecting in {logoutCountdown} second{logoutCountdown !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}
    </>
  );
}