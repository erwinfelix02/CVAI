import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Sidebar";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          admin-main
          ${collapsed && !isMobile ? "sidebar-collapsed" : ""}
          ${collapsed && isMobile ? "content-dimmed" : ""}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
