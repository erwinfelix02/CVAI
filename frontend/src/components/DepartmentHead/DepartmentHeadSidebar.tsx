// src/components/DepartmentHead/DepartmentHeadSidebar.tsx
import "../../styles/DepartmentHeadSidebar.css";
import { Link, useLocation } from "react-router-dom";
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

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dept-head" },
  { label: "Faculty", icon: Users, path: "/dept-head/faculty", badge: 24 },
  { label: "Subjects", icon: BookOpen, path: "/dept-head/subjects" },
  { label: "Schedules", icon: CalendarDays, path: "/dept-head/schedules" },
  { label: "Rooms", icon: DoorOpen, path: "/dept-head/rooms" },
];

const bottomNav = [
  { label: "Settings", icon: Settings, path: "/dept-head/settings" },
  { label: "Help", icon: HelpCircle, path: "/dept-head/help" },
];

export default function DepartmentHeadSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();

  const closeMobile = () => {
    if (isMobile && setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`dept-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
      <div className="dept-sidebar-header">
        {(!collapsed || isMobile) && (
          <div className="brand-container">
            <span className="brand-icon">
              <GraduationCap size={20} />
            </span>
            <div className="brand-text-container">
              <span className="brand-text fw-bold fs-5">CampusHub</span>
              <span className="sidebar-description text-muted small">
                Department Head
              </span>
            </div>
          </div>
        )}

        {/* Desktop collapse */}
        {!isMobile && toggleCollapsed && (
          <button
            type="button"
            className="btn p-0 d-flex align-items-center justify-content-center dept-icon-btn"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Mobile close */}
        {isMobile && mobileOpen && setMobileOpen && (
          <button
            type="button"
            className="btn p-0 d-flex align-items-center justify-content-center dept-icon-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main Nav (scrollable area only) */}
      <nav className="dept-sidebar-nav">
        {nav.map(({ label, icon: Icon, badge, path }) => {
          const active =
            path === "/dept-head"
              ? location.pathname === path
              : location.pathname.startsWith(path);

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

                {(!collapsed || isMobile) && badge != null && (
                  <span className="badge dept-badge">{badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom pinned */}
      <div className="dept-sidebar-bottom">
        <div className="sidebar-separator" />

        {bottomNav.map(({ label, icon: Icon, path }) => {
          const active = location.pathname.startsWith(path);

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

        <div
          className="nav-item nav-item-danger"
          role="button"
          onClick={() => {
            console.log("dept head sign out");
            closeMobile();
          }}
        >
          <div className="nav-label">
            <LogOut size={18} />
            {(!collapsed || isMobile) && <span>Sign Out</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}
