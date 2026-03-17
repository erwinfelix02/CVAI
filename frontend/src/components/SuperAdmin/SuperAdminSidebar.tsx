import "../../styles/superadmin-sidebar.css";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Brain,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/superadmin" },
  { label: "Portal Users", icon: Users, path: "/superadmin/users" },
  { label: "Role Management", icon: Shield, path: "/superadmin/roles" },
  {
    label: "AI Knowledge",
    icon: Brain,
    path: "/superadmin/aiknowledge",
    badge: "AI",
  },
  { label: "System Logs", icon: Activity, path: "/superadmin/logs" },
  { label: "Settings", icon: Settings, path: "/superadmin/settings" },
];

export default function SuperAdminSidebar({
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

  const isActive = (path: string) =>
    path === "/superadmin"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (isMobile && setMobileOpen) setMobileOpen(false);

      setIsLoggingOut(false);
      navigate("/signin");
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
        className={`superadmin-sidebar ${
          isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
        } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="superadmin-sidebar-header">
          {(!collapsed || isMobile) && (
            <div className="brand-container">
              <span className="brand-icon">
                <Crown size={18} />
              </span>
              <div className="brand-text-container">
                <span className="brand-text fw-bold fs-5">CampusHub</span>
                <span className="sidebar-description text-muted small">
                  Super Admin
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

        <nav className="superadmin-sidebar-nav">
          {nav.map(({ label, icon: Icon, badge, path }) => (
            <Link
              to={path}
              key={label}
              className="text-decoration-none"
              onClick={() => {
                if (isMobile && setMobileOpen) setMobileOpen(false);
              }}
            >
              <div className={`nav-item ${isActive(path) ? "active" : ""}`}>
                <div className="nav-label">
                  <Icon size={18} />
                  {(!collapsed || isMobile) && <span>{label}</span>}
                </div>

                {(!collapsed || isMobile) && badge && (
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
          ))}
        </nav>

        <div className="superadmin-sidebar-bottom">
          <div className="sidebar-separator" />

          <div
            className="nav-item nav-item-danger"
            role="button"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <div className="nav-label">
              <LogOut size={18} />
              {(!collapsed || isMobile) && <span>Log Out</span>}
            </div>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="logout-overlay">
            <div className="logout-modal">
              <h6>Confirm Log Out</h6>
              <p>Are you sure you want to log out?</p>

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
                  onClick={handleLogout}
                  type="button"
                >
                  Log Out
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