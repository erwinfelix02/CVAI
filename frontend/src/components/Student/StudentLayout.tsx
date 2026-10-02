import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import StudentSidebar from "./StudentSidebar";
import "../../styles/StudentLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex student-layout">
      <StudentSidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {/* ✅ Mobile Top Bar */}
      {isMobile && (
        <header className="student-mobile-header">
          <button
            className="student-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} color="white" />
          </button>
          <div className="student-mobile-title-wrap">
            <div className="student-mobile-title">
              Campus Virtual Assistance
            </div>
            <div className="student-mobile-subtitle">Student Portal</div>
          </div>
        </header>
      )}

      <main
        className={`flex-grow-1 student-main ${isMobile ? "has-mobile-header" : ""}`}
      >
        {children}
      </main>

      {/* Overlay when mobile sidebar is open */}
      {isMobile && mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1250, backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
