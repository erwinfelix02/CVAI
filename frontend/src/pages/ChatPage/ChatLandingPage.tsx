import { useState, useEffect } from "react";
import Sidebar from "../../components/ChatPage/Sidebar";
import ChatWindow from "../../components/ChatPage/ChatWindow";
import "../../styles/chat.css";

export default function LandingPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 🔹 Auto close sidebar on mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  return (
    <div className="chat-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <ChatWindow
        collapsed={collapsed}
        isMobile={isMobile}
        setCollapsed={setCollapsed}
      />
    </div>
  );
}
