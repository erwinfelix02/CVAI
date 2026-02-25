import "../../styles/registrar-sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserPlus,
  Layers,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  Bot,
  BookOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapsed?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

/**
 * ✅ This is Registrar portal sidebar.
 * So we DO NOT read role from localStorage.
 */
const REGISTRAR_ROLE_ID = "registrar";

type NavItem = {
  label: string;
  icon: any;
  path: string;
  badge?: string;
  controlled?: boolean; // ✅ only for the 4 permission-controlled items
};

const nav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/registrar" },

  // ✅ permission-controlled (only these 4)
  { label: "Applications", icon: FileText, path: "/registrar/applications", controlled: true },
  { label: "Students", icon: Users, path: "/registrar/students", controlled: true },
  { label: "Enrollment", icon: UserPlus, path: "/registrar/enrollment", controlled: true },
  { label: "Documents", icon: FolderOpen, path: "/registrar/documents", controlled: true },

  // ✅ always visible
  { label: "Sections", icon: Layers, path: "/registrar/sections" },
  { label: "Courses", icon: BookOpen, path: "/registrar/courses" },
  { label: "Faculty Accounts", icon: Users, path: "/registrar/faculty" },
  { label: "AI Assistant", icon: Bot, path: "/registrar/ai-assistant", badge: "AI" },
];

const CONTROLLED_PERM: Record<string, string> = {
  Applications: "process_applications",
  Students: "manage_students",
  Enrollment: "manage_enrollment",
  Documents: "manage_documents",
};

export default function RegistrarSidebar({
  collapsed = false,
  toggleCollapsed,
  mobileOpen = false,
  setMobileOpen,
  isMobile = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

  // ✅ Load registrar permissions from DB
  useEffect(() => {
    async function loadPerms() {
      setLoadingPerms(true);
      try {
        const res = await fetch(`http://localhost:5000/api/roles/${REGISTRAR_ROLE_ID}`);
        if (!res.ok) {
          console.error("Failed to fetch role perms:", res.status);
          setPermissions([]);
          return;
        }

        const role = await res.json();
        setPermissions(Array.isArray(role?.permissions) ? role.permissions : []);
      } catch (e) {
        console.error("Failed to load permissions", e);
        setPermissions([]);
      } finally {
        setLoadingPerms(false);
      }
    }

    loadPerms();
  }, []);

  // ✅ Pending applications count (only matters if Applications is visible)
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const res = await fetch("http://localhost:5000/api/preregistrations/pending-count");
        const data = await res.json();
        setPendingCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    }

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Filter nav:
  // - Always show non-controlled items
  // - Show controlled items only if permission exists
  const visibleNav = useMemo(() => {
    return nav.filter((item) => {
      if (!item.controlled) return true; // always visible

      // while loading perms, hide only controlled items
      if (loadingPerms) return false;

      const permKey = CONTROLLED_PERM[item.label];
      return permissions.includes(permKey);
    });
  }, [permissions, loadingPerms]);

  return (
    <aside
      className={`registrar-sidebar ${
        isMobile ? "expanded" : collapsed ? "collapsed" : "expanded"
      } ${isMobile && mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Header */}
      <div className="registrar-sidebar-header">
        {(!collapsed || isMobile) && (
          <div className="brand-container">
            <span className="brand-icon">
              <GraduationCap size={20} />
            </span>
            <div className="brand-text-container">
              <span className="brand-text fw-bold fs-5">CampusHub</span>
              <span className="sidebar-description text-muted small">
                Registrar Portal
              </span>
            </div>
          </div>
        )}

        {!isMobile && toggleCollapsed && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}

        {isMobile && mobileOpen && setMobileOpen && (
          <button
            className="btn p-0 d-flex align-items-center justify-content-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="registrar-sidebar-nav">
        {visibleNav.map(({ label, icon: Icon, badge, path }) => {
          const isActive =
            path === "/registrar"
              ? location.pathname === path
              : location.pathname.startsWith(path);

          return (
            <Link
              to={path}
              key={label}
              className="text-decoration-none"
              onClick={() => {
                if (isMobile && setMobileOpen) setMobileOpen(false);
              }}
            >
              <div className={`nav-item ${isActive ? "active" : ""}`}>
                <div className="nav-label">
                  <Icon size={18} />
                  {(!collapsed || isMobile) && <span>{label}</span>}
                </div>

                {(!collapsed || isMobile) &&
                  label === "Applications" &&
                  pendingCount > 0 && (
                    <span className="badge bg-warning text-dark">
                      {pendingCount}
                    </span>
                  )}

                {(!collapsed || isMobile) &&
                  badge &&
                  label !== "Applications" && (
                    <span className="badge bg-primary">{badge}</span>
                  )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="registrar-sidebar-bottom">
        <div className="sidebar-separator" />

        <Link
          to="/registrar/settings"
          className="text-decoration-none"
          onClick={() => {
            if (isMobile && setMobileOpen) setMobileOpen(false);
          }}
        >
          <div
            className={`nav-item ${
              location.pathname.startsWith("/registrar/settings") ? "active" : ""
            }`}
          >
            <div className="nav-label">
              <Settings size={18} />
              {(!collapsed || isMobile) && <span>Settings</span>}
            </div>
          </div>
        </Link>

        <Link
          to="/registrar/help"
          className="text-decoration-none"
          onClick={() => {
            if (isMobile && setMobileOpen) setMobileOpen(false);
          }}
        >
          <div
            className={`nav-item ${
              location.pathname.startsWith("/registrar/help") ? "active" : ""
            }`}
          >
            <div className="nav-label">
              <HelpCircle size={18} />
              {(!collapsed || isMobile) && <span>Help Center</span>}
            </div>
          </div>
        </Link>

        <div
          className="nav-item nav-item-danger"
          role="button"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <div className="nav-label">
            <LogOut size={18} />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h6>Confirm Logout</h6>
            <p>Are you sure you want to logout?</p>

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  // optional: clear storage if you use it, not required
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");

                  setShowLogoutConfirm(false);

                  if (isMobile && setMobileOpen) setMobileOpen(false);

                  navigate("/signin");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}