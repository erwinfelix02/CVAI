import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart2,
  HelpCircle,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div className="sidebar-title-icon">
            <GraduationCap size={18} />
          </div>
          {!collapsed && <span>Admin Panel</span>}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" collapsed={collapsed} />
        <SidebarLink to="/admin/users" icon={<Users size={18} />} label="Users" collapsed={collapsed} />
        <SidebarLink to="/admin/faqs" icon={<BookOpen size={18} />} label="FAQs / AI Knowledge" collapsed={collapsed} />
        <SidebarLink to="/admin/analytics" icon={<BarChart2 size={18} />} label="Analytics" collapsed={collapsed} />
        <SidebarLink to="/admin/help" icon={<HelpCircle size={18} />} label="Help Requests" collapsed={collapsed} />
        <SidebarLink to="/admin/settings" icon={<Settings size={18} />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
