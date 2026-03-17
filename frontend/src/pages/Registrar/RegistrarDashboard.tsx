import { useMemo, useRef, useEffect, useState } from "react";
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
import "../../styles/registrar-dashboard.css";

const REGISTRAR_ROLE_ID = "registrar";

export default function RegistrarDashboard() {
  const quickRef = useRef<HTMLDivElement | null>(null);
  const recentRef = useRef<HTMLDivElement | null>(null);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recent, setRecent] = useState<RecentApplication[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState({
    scheduled: 0,
    enrolled: 0,
    cancelled: 0,
  });

  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(true);

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

  useEffect(() => {
    async function loadPerms() {
      setLoadingPerms(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/roles/${REGISTRAR_ROLE_ID}`,
        );

        if (!res.ok) {
          console.error("Failed to fetch role perms:", res.status);
          setPermissions([]);
          return;
        }

        const role = await res.json();
        setPermissions(Array.isArray(role?.permissions) ? role.permissions : []);
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
        const res = await fetch("http://localhost:5000/api/enrollments/counts");
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
        const res = await fetch("http://localhost:5000/api/students/count");
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
          "http://localhost:5000/api/preregistrations/pending-count",
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
          "http://localhost:5000/api/preregistrations/recent",
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
    if (loadingPerms) return [];

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
      canManageDocuments
        ? {
            label: "Process Documents",
            icon: FileText,
            badge: 12,
            to: "/registrar/documents",
          }
        : null,
    ].filter(Boolean) as QuickActionItem[];
  }, [
    loadingPerms,
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