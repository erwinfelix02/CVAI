import QuickPrompts from "../ChatPage/QuickPrompts";
import MessageInput from "../ChatPage/MessageInput";
import "../../styles/chatwindow.css";
import { GraduationCap, Menu } from "lucide-react";

interface ChatWindowProps {
  collapsed: boolean;
  isMobile: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function ChatWindow({
  collapsed,
  isMobile,
  setCollapsed,
}: ChatWindowProps) {
  return (
    <main className={`chat-window ${isMobile ? "mobile" : ""}`}>
      {/* MOBILE MENU BUTTON */}
      {isMobile && collapsed && (
        <button className="mobile-menu-btn" onClick={() => setCollapsed(false)}>
          <Menu size={22} />
        </button>
      )}

      <div className="welcome-wrapper">
        <div className="welcome-icon">
          <GraduationCap className="graduation-icon" />
        </div>

        <h1>Welcome to CampusAI</h1>
        <p className="subtitle">
          Your intelligent campus assistant. Ask me anything about courses,
          schedules, facilities, or campus life!
        </p>

        {/* ✅ QuickPrompts is now independent */}
        <QuickPrompts />
      </div>

      <MessageInput />

      <p className="disclaimer">
        CampusAI can make mistakes. Verify important information.
      </p>
    </main>
  );
}
