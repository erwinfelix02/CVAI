import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import "../../styles/superadmin-layout.css";

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
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
    <div className="d-flex superadmin-layout">
      <SuperAdminSidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {/* Mobile Top Bar */}
      {isMobile && (
        <header className="superadmin-mobile-header">
          <button
            className="superadmin-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} color="white" />
          </button>

          <div className="superadmin-mobile-title-wrap">
            <div className="superadmin-mobile-title">Campus Virtual Assistance</div>
            <div className="superadmin-mobile-subtitle">Super Admin</div>
          </div>
        </header>
      )}

      {/* ONLY MAIN SCROLLS */}
      <main className={`flex-grow-1 superadmin-main ${isMobile ? "has-mobile-header" : ""}`}>
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
