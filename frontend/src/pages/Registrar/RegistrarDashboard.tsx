// src/pages/Registrar/RegistrarDashboard.tsx

import { useMemo, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  UserCheck,
  UserX,
  FileText,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

import StatCard from "../../components/Registrar/Dashboard/StatCard";
import type { Props as StatCardProps } from "../../components/Registrar/Dashboard/StatCard";

import QuickActionsCard from "../../components/Registrar/Dashboard/QuickActionsCard";
import type { QuickActionItem } from "../../components/Registrar/Dashboard/QuickActionsCard";

import RecentApplicationsCard from "../../components/Registrar/Dashboard/RecentApplicationsCard";
import type { RecentApplication } from "../../components/Registrar/Dashboard/RecentApplicationsCard";

import AIInsightsCard from "../../components/Registrar/Dashboard/AIInsightsCard";

import ProtectedLayout from "../../layouts/ProtectedLayout";

// Import your API configuration (adjust the relative path if your config.ts is located elsewhere)
import { API_BASE_URL } from "../../config";

import "../../styles/registrar-dashboard.css";

const REGISTRAR_ROLE_ID = "registrar";

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const quickRef = useRef<HTMLDivElement | null>(null);
  const recentRef = useRef<HTMLDivElement | null>(null);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  /* =========================================================
     BACK NAVIGATION LOGOUT & COUNTDOWN STATES
     ========================================================= */
  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recent, setRecent] = useState<RecentApplication[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState({
    scheduled: 0,
    enrolled: 0,
    cancelled: 0,
  });

  const [permissions, setPermissions] = useState<string[]>([]);
  const [, setLoadingPerms] = useState(true);

  // Get current user details for audit logging
  const currentUser = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");

    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  useEffect(() => {
    if (!showWelcome) return;

    const fadeTimer = setTimeout(() => {
      setIsWelcomeClosing(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsWelcomeClosing(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [showWelcome]);

  /* =========================================================
     INTERCEPT BACK BUTTON (Trigger Logout Confirmation)
     ========================================================= */
  useEffect(() => {
    if (!window.history.state || !window.history.state.guarded) {
      window.history.pushState({ guarded: true }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackLogoutConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  /* =========================================================
     LOGOUT AUDIT & COUNTDOWN HANDLERS
     ========================================================= */
  const logLogoutActivity = async () => {
    try {
      const userEmail = currentUser?.email || "registrar@example.com";
      const userRole = currentUser?.role || "Registrar";

      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") ||
            localStorage.getItem("sessionToken") ||
            ""
          }`,
        },
        body: JSON.stringify({
          action: "Logout",
          user: userEmail,
          role: userRole,
          type: "Security",
          details: `${userEmail} logged out of the registrar portal via back navigation.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log registrar logout activity:", err);
    }
  };

  const handleBackLogoutConfirm = () => {
    setShowBackLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      async function finalizeLogout() {
        await logLogoutActivity();

        // Clear session tokens
        localStorage.removeItem("token");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");

        setIsLoggingOut(false);
        navigate("/signin", { replace: true });
      }

      finalizeLogout();
      return;
    }

    const timer = setTimeout(() => {
      setLogoutCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown, navigate]);

  useEffect(() => {
    async function loadPerms() {
      setLoadingPerms(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/roles/${REGISTRAR_ROLE_ID}`,
        );

        if (!res.ok) {
          console.error("Failed to fetch role perms:", res.status);
          setPermissions([]);
          return;
        }

        const role = await res.json();
        setPermissions(
          Array.isArray(role?.permissions) ? role.permissions : [],
        );
      } catch (err) {
        console.error("Failed to load permissions", err);
        setPermissions([]);
      } finally {
        setLoadingPerms(false);
      }
    }

    loadPerms();
  }, []);

  useEffect(() => {
    const fetchEnrollmentCounts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/enrollments/counts`);
        const data = await res.json();

        setEnrollmentCounts({
          scheduled: Number(data?.scheduled ?? 0),
          enrolled: Number(data?.enrolled ?? 0),
          cancelled: Number(data?.cancelled ?? 0),
        });
      } catch (err) {
        console.error("Failed to fetch enrollment counts", err);
        setEnrollmentCounts({ scheduled: 0, enrolled: 0, cancelled: 0 });
      }
    };

    fetchEnrollmentCounts();
  }, []);

  useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/students/count`);
        const data = await res.json();
        setTotalStudents(Number(data?.total ?? 0));
      } catch (err) {
        console.error("Failed to fetch total students", err);
        setTotalStudents(0);
      }
    };

    fetchTotalStudents();
  }, []);

  useEffect(() => {
    if (!quickRef.current || !recentRef.current) return;

    const syncHeight = () => {
      const isLgUp = window.matchMedia("(min-width: 992px)").matches;

      if (!isLgUp) {
        recentRef.current!.style.height = "auto";
        return;
      }

      recentRef.current!.style.height = quickRef.current!.offsetHeight + "px";
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(quickRef.current);

    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/preregistrations/pending-count`,
        );
        const data = await res.json();
        setPendingCount(data.count);
      } catch (err) {
        console.error("Failed to fetch pending count", err);
      }
    };

    fetchPending();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/preregistrations/recent`,
        );
        const data = await res.json();

        const mapped = data.map((app: any) => ({
          initials: app.personal.firstName[0] + app.personal.lastName[0],
          name: app.personal.firstName + " " + app.personal.lastName,
          program: app.academic.course,
          ref: app.registrationId,
          date: new Date(app.createdAt).toISOString().split("T")[0],
          status: app.status,
        }));

        setRecent(mapped);
      } catch (err) {
        console.error("Failed to fetch recent applications", err);
      }
    };

    fetchRecent();
  }, []);

  const canManageDocuments = permissions.includes("manage_documents");
  const canProcessApplications = permissions.includes("process_applications");
  const canManageStudents = permissions.includes("manage_students");
  const canManageEnrollment = permissions.includes("manage_enrollment");

  const stats = useMemo<StatCardProps[]>(
    () => [
      {
        label: "Total Students",
        value: totalStudents.toLocaleString(),
        helper: "From student records",
        icon: Users,
        tone: "blue",
      },
      {
        label: "Pending Applications",
        value: pendingCount.toString(),
        helper: "Awaiting review",
        icon: ClipboardList,
        tone: "orange",
      },
      {
        label: "Active Enrollments",
        value: enrollmentCounts.enrolled.toLocaleString(),
        helper: "Enrolled students",
        icon: UserCheck,
        tone: "green",
      },
      {
        label: "Dropped/Inactive",
        value: enrollmentCounts.cancelled.toLocaleString(),
        helper: "Cancelled enrollments",
        icon: UserX,
        tone: "red",
      },
    ],
    [pendingCount, totalStudents, enrollmentCounts],
  );

  const quickActions: QuickActionItem[] = useMemo(() => {
    return [
      canProcessApplications
        ? {
            label: "Review Applications",
            icon: FileText,
            badge: pendingCount,
            to: "/registrar/applications",
          }
        : null,
      canManageEnrollment
        ? {
            label: "Enroll Student",
            icon: UserPlus,
            to: "/registrar/enrollment",
          }
        : null,
      canManageStudents
        ? {
            label: "View All Students",
            icon: Users,
            to: "/registrar/students",
          }
        : null,
    ].filter(Boolean) as QuickActionItem[];
  }, [
    canProcessApplications,
    canManageEnrollment,
    canManageStudents,
    canManageDocuments,
    pendingCount,
  ]);

  return (
    <ProtectedLayout>
      {showWelcome && (
        <div
          className={`welcome-overlay ${isWelcomeClosing ? "fade-out" : ""}`}
        >
          <div className={`welcome-box ${isWelcomeClosing ? "fade-out" : ""}`}>
            <div className="welcome-icon-wrap">
              <CheckCircle2 size={34} />
            </div>
            <h4>{welcomeMessage}</h4>
            <p>You have successfully signed in.</p>
          </div>
        </div>
      )}

      {/* BACK NAVIGATION LOGOUT CONFIRMATION MODAL */}
      {showBackLogoutConfirm && (
        <div
          className="logout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="back-logout-title"
        >
          <div className="logout-modal">
            <h6 id="back-logout-title">Confirm Log Out</h6>
            <p>Going back will log you out of your session. Are you sure?</p>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowBackLogoutConfirm(false);
                  window.history.pushState({ guarded: true }, "", window.location.href);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleBackLogoutConfirm}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGGING OUT OVERLAY WITH COUNTDOWN */}
      {isLoggingOut && (
        <div className="logging-out-overlay" role="status" aria-live="polite">
          <div className="logging-out-box">
            <div className="logging-spinner" aria-hidden="true" />
            <h5>Logging out...</h5>
            <p>
              Redirecting in {logoutCountdown} second
              {logoutCountdown !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <div className="registrar-dashboard">
        <div className="mb-3 mb-md-4">
          <h2 className="fw-bold mb-1">Registrar Dashboard</h2>
          <p className="text-muted mb-0">
            Manage student enrollments, applications, and records
          </p>
        </div>

        <div className="row g-3 g-md-4 mb-3">
          {stats.map((s) => (
            <div key={s.label} className="col-12 col-sm-6 col-xl-3">
              <StatCard {...s} />
            </div>
          ))}
        </div>

        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          <div className="col-12 col-lg-4">
            <div ref={quickRef}>
              <QuickActionsCard title="Quick Actions" items={quickActions} />
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <RecentApplicationsCard
              ref={recentRef}
              title="Recent Applications"
              viewAllLabel="View All"
              viewAllTo="/registrar/applications"
              items={recent}
            />
          </div>
        </div>

        <div className="row g-3 g-md-4">
          <div className="col-12">
            <AIInsightsCard />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}