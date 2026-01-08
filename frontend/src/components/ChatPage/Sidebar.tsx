import "../../styles/sidebar.css";
import {
  ChevronLeft,
  Plus,
  User,
  LogOut,
  GraduationCap,
  Clock,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const chatHistory = [
    "How to enroll in courses?",
    "Library hours question",
    "Scholarship requirements",
    "Campus facilities info",
    "Academic calendar 2024",
  ];

  return (
    <aside className={`campusai-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-title">
            <div className="sidebar-title-icon">
              <GraduationCap size={18} />
            </div>
            <span>CampusAI</span>
          </div>
        )}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* NEW CHAT */}
      <button className="new-chat-btn">
        <Plus size={18} />
        {!collapsed && <span>New Chat</span>}
      </button>

      {/* CHAT HISTORY */}
      <div className="sidebar-nav">
        {collapsed ? (
          <SidebarItem
            icon={<Clock size={18} />}
            label="Recent chats"
            collapsed
          />
        ) : (
          chatHistory.map((label, index) => (
            <SidebarItem
              key={index}
              icon={<Clock size={18} />}
              label={label}
              collapsed={collapsed}
            />
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <SidebarItem
          icon={<User size={18} />}
          label="Profile"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<HelpCircle size={18} />}
          label="Help"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<LogOut size={18} />}
          label="Logout"
          collapsed={collapsed}
          extraClass="logout"
        />
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  collapsed,
  extraClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  extraClass?: string;
}) {
  return (
    <div
      className={`sidebar-link ${collapsed ? "collapsed-item" : ""} ${extraClass}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}
