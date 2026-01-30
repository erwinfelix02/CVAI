import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import RegistrarSidebar from "../../components/Registrar/RegistrarSidebar";
import "../../styles/registrar-layout.css";

export default function RegistrarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="d-flex registrar-layout">
      <RegistrarSidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isMobile={isMobile}
      />

      {/* Mobile header */}
      {isMobile && (
        <header className="registrar-mobile-header">
          <button
            className="registrar-mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="registrar-mobile-title">
            Registrar Portal
          </div>
        </header>
      )}

      {/* Main scroll area */}
      <main className={`registrar-main ${isMobile ? "has-mobile-header" : ""}`}>
        <div className="container-fluid py-3 py-md-4">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="registrar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
