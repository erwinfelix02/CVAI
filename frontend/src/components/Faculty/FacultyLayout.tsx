import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import FacultySidebar from "./FacultySidebar";
import "../../styles/FacultyLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function FacultyLayout({ children }: Props) {
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
    <div className="d-flex faculty-layout">
      <FacultySidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {/* ✅ Mobile Top Bar */}
      {isMobile && (
        <header className="faculty-mobile-header">
          <button
            className="faculty-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} color="white" />
          </button>

          <div className="faculty-mobile-title-wrap">
            <div className="faculty-mobile-title">Campus Virtual Assistance</div>
            <div className="faculty-mobile-subtitle">Faculty Portal</div>
          </div>
        </header>
      )}

      {/* ✅ ONLY MAIN SCROLLS */}
      <main
        className={`flex-grow-1 faculty-main ${
          isMobile ? "has-mobile-header" : ""
        }`}
      >
        <div className="container-fluid py-3 py-md-4">{children}</div>
      </main>

      {/* Overlay when sidebar open on mobile */}
      {isMobile && mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040, backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
