import "../../styles/registrar-sidebar.css";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/registrar" },
  {
    label: "Applications",
    icon: FileText,
    path: "/registrar/applications",
  },
  { label: "Students", icon: Users, path: "/registrar/students" },
  { label: "Enrollment", icon: UserPlus, path: "/registrar/enrollment" },
  { label: "Sections", icon: Layers, path: "/registrar/sections" },
  { label: "Faculty Accounts", icon: Users, path: "/registrar/faculty" },
  { label: "Documents", icon: FolderOpen, path: "/registrar/documents" },
  {
    label: "AI Assistant",
    icon: Bot,
    path: "/registrar/ai-assistant",
    badge: "AI",
  },
];

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
  const [pendingCount, setPendingCount] = useState<number>(0);

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

    // Optional: refresh every 10 seconds
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`registrar-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
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

        {/* Desktop collapse toggle */}
        {!isMobile && toggleCollapsed && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Mobile close */}
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
      <nav className="registrar-sidebar-nav">
        {nav.map(({ label, icon: Icon, badge, path }) => {
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

      {/* Bottom */}
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
            className={`nav-item ${location.pathname.startsWith("/registrar/settings") ? "active" : ""}`}
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
            className={`nav-item ${location.pathname.startsWith("/registrar/help") ? "active" : ""}`}
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
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
