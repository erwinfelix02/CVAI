import { useMemo, useRef, useEffect } from "react";
import {
  Users,
  ClipboardList,
  UserCheck,
  UserX,
  FileText,
  UserPlus,
} from "lucide-react";
import { useState } from "react";


import StatCard from "../../components/Registrar/Dashboard/StatCard";
import type { Props as StatCardProps } from "../../components/Registrar/Dashboard/StatCard";

import QuickActionsCard from "../../components/Registrar/Dashboard/QuickActionsCard";
import type { QuickActionItem } from "../../components/Registrar/Dashboard/QuickActionsCard";

import RecentApplicationsCard from "../../components/Registrar/Dashboard/RecentApplicationsCard";
import type { RecentApplication } from "../../components/Registrar/Dashboard/RecentApplicationsCard";

import EnrollmentStatusCard from "../../components/Registrar/Dashboard/EnrollmentStatusCard";
import ProtectedLayout from "../../layouts/ProtectedLayout";
import "../../styles/registrar-dashboard.css";

export default function RegistrarDashboard() {
  const quickRef = useRef<HTMLDivElement | null>(null);
  const recentRef = useRef<HTMLDivElement | null>(null);
const [pendingCount, setPendingCount] = useState(0);

  // 🔥 Sync Recent Applications height to Quick Actions
  useEffect(() => {
    if (!quickRef.current || !recentRef.current) return;

    const syncHeight = () => {
      recentRef.current!.style.height =
        quickRef.current!.offsetHeight + "px";
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
        "http://localhost:5000/api/preregistrations/pending-count"
      );
      const data = await res.json();
      setPendingCount(data.count);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  fetchPending();
}, []);

  const stats = useMemo<StatCardProps[]>(
    () => [
      {
        label: "Total Students",
        value: "2,547",
        helper: "+12% this semester",
        icon: Users,
        tone: "blue",
      },
     {
  label: "Pending Applications",
  value: pendingCount.toString(),
  helper: "Awaiting review",
  icon: ClipboardList,
  tone: "orange",
}
,
      {
        label: "Active Enrollments",
        value: "2,341",
        helper: "+5% this semester",
        icon: UserCheck,
        tone: "green",
      },
      {
        label: "Dropped/Inactive",
        value: "206",
        helper: "-2% this semester",
        icon: UserX,
        tone: "red",
      },
   ], [pendingCount]);

  const quickActions: QuickActionItem[] = [
    {
      label: "Review Applications",
      icon: FileText,
      badge: 48,
      to: "/registrar/applications",
    },
    { label: "Enroll Student", icon: UserPlus, to: "/registrar/enrollment" },
    { label: "View All Students", icon: Users, to: "/registrar/students" },
    {
      label: "Process Documents",
      icon: FileText,
      badge: 12,
      to: "/registrar/documents",
    },
  ];

  const [recent, setRecent] = useState<RecentApplication[]>([]);

useEffect(() => {
  const fetchRecent = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/preregistrations/recent"
      );
      const data = await res.json();

      const mapped = data.map((app: any) => ({
        initials:
          app.personal.firstName[0] +
          app.personal.lastName[0],

        name:
          app.personal.firstName +
          " " +
          app.personal.lastName,

        program: app.academic.course,
        ref: app.registrationId,
        date: new Date(app.createdAt)
          .toISOString()
          .split("T")[0],

        status: app.status,
      }));

      setRecent(mapped);
    } catch (err) {
      console.error("Failed to fetch recent applications", err);
    }
  };

  fetchRecent();
}, []);


  return (<ProtectedLayout>
    <div className="registrar-dashboard">
      {/* Header */}
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1">Registrar Dashboard</h2>
        <p className="text-muted mb-0">
          Manage student enrollments, applications, and records
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        {stats.map((s) => (
          <div key={s.label} className="col-12 col-sm-6 col-xl-3">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Middle row */}
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

      {/* Enrollment status */}
      <div className="row g-3 g-md-4">
        <div className="col-12">
          <EnrollmentStatusCard
            title="Enrollment Period Status"
            started="Jan 5, 2024"
            deadline="Feb 15, 2024"
            percent={65}
            rightLabel="65% Complete"
          />
        </div>
      </div>
    </div>
    </ProtectedLayout>
  );
}
