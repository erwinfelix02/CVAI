import "../../styles/FacultySidebar.css";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CheckSquare,
  Bell,
  FolderOpen,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  Settings,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/faculty" },
  { label: "Students", icon: Users, path: "/faculty/students", badge: 120 },
  { label: "My Classes", icon: BookOpen, path: "/faculty/classes" },
  { label: "Schedule", icon: Calendar, path: "/faculty/schedule" },
  {
    label: "Grade Management",
    icon: ClipboardCheck,
    path: "/faculty/grades",
    badge: 18,
  },
  { label: "Attendance", icon: CheckSquare, path: "/faculty/attendance" },
  {
    label: "Announcements",
    icon: Bell,
    path: "/faculty/announcements",
    badge: 2,
  },
  { label: "Course Materials", icon: FolderOpen, path: "/faculty/materials" },
  {
    label: "AI Assistant",
    icon: Bot,
    path: "/faculty/aiassistant",
    badge: "AI",
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

  return (
    <aside
      className={`faculty-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
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
      <nav className="faculty-sidebar-nav">
        {nav.map(({ label, icon: Icon, badge, path }) => {
          const isActive =
            path === "/faculty"
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
                  <span
                    className={`badge ${typeof badge === "string" ? "badge-ai" : "bg-primary"}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="faculty-sidebar-bottom">
        <div className="sidebar-separator" />

        <Link
          to="/faculty/settings"
          className="text-decoration-none"
          onClick={() => {
            if (isMobile && setMobileOpen) setMobileOpen(false);
          }}
        >
          <div
            className={`nav-item ${
              location.pathname.startsWith("/faculty/settings") ? "active" : ""
            }`}
          >
            <div className="nav-label">
              <Settings size={18} />
              {(!collapsed || isMobile) && <span>Profile Settings</span>}
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
