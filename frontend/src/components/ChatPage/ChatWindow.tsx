import QuickPrompts from "../ChatPage/QuickPrompts";
import MessageInput from "../ChatPage/MessageInput";
import "../../styles/chatwindow.css";

import { GraduationCap } from "lucide-react"; // import the icon

interface ChatWindowProps {
  collapsed: boolean;
}

export default function ChatWindow({ collapsed }: ChatWindowProps) {
  return (
    <main className="chat-window">
      <div className="welcome-wrapper">
        {/* GraduationCap icon instead of 🎓 emoji */}
       <div className="welcome-icon">
  <GraduationCap className="graduation-icon" />
</div>


        <h1>Welcome to CampusAI</h1>
        <p className="subtitle">
          Your intelligent campus assistant. Ask me anything about courses,
          schedules, facilities, or campus life!
        </p>

        {/* Pass collapsed to QuickPrompts */}
        <QuickPrompts collapsed={collapsed} />
      </div>

      <MessageInput />

      <p className="disclaimer">
        CampusAI can make mistakes. Verify important information.
      </p>
    </main>
  );
}
