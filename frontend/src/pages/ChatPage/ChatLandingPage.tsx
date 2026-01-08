import { useState } from "react";
import Sidebar from "../../components/ChatPage/Sidebar";
import ChatWindow from "../../components/ChatPage/ChatWindow";
import "../../styles/chat.css";

export default function LandingPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="chat-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Pass collapsed to ChatWindow */}
      <ChatWindow collapsed={collapsed} />
    </div>
  );
}
