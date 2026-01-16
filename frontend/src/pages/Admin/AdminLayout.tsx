import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";
import "../../styles/admin-layout.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 🔹 Auto collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true); // close sidebar on mobile
    }
  }, [isMobile]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main className={`admin-main ${isMobile ? "mobile" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
