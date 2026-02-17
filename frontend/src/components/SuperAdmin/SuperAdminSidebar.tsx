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
import { useState } from "react";

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

  const isActive = (path: string) =>
    path === "/superadmin"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <aside
      className={`superadmin-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
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
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {isMobile && mobileOpen && setMobileOpen && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
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
                  className={`badge ${typeof badge === "string" ? "badge-ai" : "bg-primary"}`}
                >
                  {badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
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
            <p>Are you sure you want to Log out?</p>

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");

                  setShowLogoutConfirm(false);

                  if (isMobile && setMobileOpen) setMobileOpen(false);

                  navigate("/signin");
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
