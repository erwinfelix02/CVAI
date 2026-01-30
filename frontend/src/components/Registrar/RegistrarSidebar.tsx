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
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/registrar" },
  { label: "Applications", icon: FileText, path: "/registrar/applications", badge: 48 },
  { label: "Students", icon: Users, path: "/registrar/students" },
  { label: "Enrollment", icon: UserPlus, path: "/registrar/enrollment" },
  { label: "Sections", icon: Layers, path: "/registrar/sections" },
  { label: "Documents", icon: FolderOpen, path: "/registrar/documents" },
];

export default function RegistrarSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();

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

                {(!collapsed || isMobile) && badge && (
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
          <div className={`nav-item ${location.pathname.startsWith("/registrar/settings") ? "active" : ""}`}>
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
          <div className={`nav-item ${location.pathname.startsWith("/registrar/help") ? "active" : ""}`}>
            <div className="nav-label">
              <HelpCircle size={18} />
              {(!collapsed || isMobile) && <span>Help Center</span>}
            </div>
          </div>
        </Link>

        <div
          className="nav-item nav-item-danger"
          role="button"
          onClick={() => {
            console.log("logout");
            if (isMobile && setMobileOpen) setMobileOpen(false);
          }}
        >
          <div className="nav-label">
            <LogOut size={18} />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}
