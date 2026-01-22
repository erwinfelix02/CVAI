import "../../styles/StudentSidebar.css";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Bot,
  User,
  Calendar,
  Book,
  CheckCircle,
  Bell,
  FileText,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

const nav = [
  { label: "Dashboard", icon: Home, path: "/student" },
  {
    label: "AI Assistant",
    icon: Bot,
    badge: "AI",
    path: "/student/aiassistant",
  },
  { label: "My Profile", icon: User, path: "/student/profile" },
  { label: "Schedule", icon: Calendar, path: "/student/schedule" },
  { label: "Grades", icon: Book, path: "/student/grades" },
  { label: "Attendance", icon: CheckCircle, path: "/student/attendance" },
  {
    label: "Announcements",
    icon: Bell,
    badge: 3,
    path: "/student/announcements",
  },
  { label: "Documents", icon: FileText, path: "/student/documents" },
  { label: "Fees & Payments", icon: CreditCard, path: "/student/fees" },
];

export default function StudentSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`student-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
      <div className="student-sidebar-header">
        {(!collapsed || isMobile) && (
          <div className="brand-container">
            <span className="brand-icon">
              <GraduationCap size={20} />
            </span>
            <div className="brand-text-container">
              <span className="brand-text fw-bold fs-5">CampusHub</span>
              <span className="sidebar-description text-muted small">
                Student Portal
              </span>
            </div>
          </div>
        )}

        {/* Desktop collapse button */}
        {!isMobile && toggleCollapsed && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={toggleCollapsed}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && mobileOpen && setMobileOpen && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="student-sidebar-nav">
        {nav.map(({ label, icon: Icon, badge, path }) => {
          const isActive =
            path === "/student"
              ? location.pathname === path // exact match for dashboard
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

     {/* Bottom actions */}
<div className="student-sidebar-bottom">
  <div className="sidebar-separator" />

 {/* Help Center */}
  <Link
    to="/student/help"
    className="text-decoration-none"
    onClick={() => {
      if (isMobile && setMobileOpen) setMobileOpen(false);
    }}
  >
    <div
      className={`nav-item ${
        location.pathname.startsWith("/student/help") ? "active" : ""
      }`}
    >
      <div className="nav-label">
        <HelpCircle size={18} />
        {(!collapsed || isMobile) && <span>Help Center</span>}
      </div>
    </div>
  </Link>

  {/* Logout */}
  <div
    className="nav-item nav-item-danger"
    role="button"
    onClick={() => {
      console.log("logout"); // hook your logout here
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
