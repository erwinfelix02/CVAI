// src/components/DepartmentHead/DepartmentHeadLayout.tsx
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import DepartmentHeadSidebar from "./DepartmentHeadSidebar";
import "../../styles/DepartmentHeadLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function DepartmentHeadLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ detect mobile
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

  // ✅ IMPORTANT: lock body scroll so sidebar won't move with page scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="d-flex dept-layout">
      <DepartmentHeadSidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {/* ✅ Mobile Top Bar */}
      {isMobile && (
        <header className="dept-mobile-header">
          <button
            className="dept-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={22} color="white" />
          </button>

          <div className="dept-mobile-title-wrap">
            <div className="dept-mobile-title">Campus Virtual Assistance</div>
            <div className="dept-mobile-subtitle">Department Head</div>
          </div>
        </header>
      )}

      {/* ✅ ONLY MAIN SCROLLS */}
      <main className={`flex-grow-1 dept-main ${isMobile ? "has-mobile-header" : ""}`}>
        <div className="container-fluid py-3 py-md-4">{children}</div>
      </main>

      {/* Overlay when sidebar open on mobile */}
      {isMobile && mobileOpen && (
        <div
          className="dept-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
