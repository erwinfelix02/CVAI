import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Shield,
  MessageSquareText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  Clock,
} from "lucide-react";

import StatCard from "../../components/SuperAdmin/Dashboard/StatCard";
import PortalStatusCard, {
  type PortalStatusRow,
} from "../../components/SuperAdmin/Dashboard/PortalStatusCard";
import RecentActivityCard, {
  type ActivityRow,
} from "../../components/SuperAdmin/Dashboard/RecentActivityCard";
import QuickActionsGrid, {
  type QuickAction,
} from "../../components/SuperAdmin/Dashboard/QuickActionsGrid";

import { getUsers } from "../../api/userService";
import { getFaqs } from "../../api/faqService";

import "../../styles/superadmin-dashboard.css";

export default function SuperAdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [aiItems, setAiItems] = useState(0);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  useEffect(() => {
    const load = async () => {
      // users count
      try {
        setLoadingUsers(true);
        const users = await getUsers();
        setTotalUsers(Array.isArray(users) ? users.length : 0);
      } catch (err) {
        console.error("❌ Failed to load users count", err);
        setTotalUsers(0);
      } finally {
        setLoadingUsers(false);
      }

      // faq count (AI knowledge items)
      try {
        setLoadingFaqs(true);
        const faqs = await getFaqs();
        setAiItems(Array.isArray(faqs) ? faqs.length : 0);
      } catch (err) {
        console.error("❌ Failed to load FAQ count", err);
        setAiItems(0);
      } finally {
        setLoadingFaqs(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(
    () =>
      [
        {
          label: "Total Users",
          value: loadingUsers ? "…" : String(totalUsers),
          icon: Users,
          tone: "blue",
        },
        {
          label: "Active Roles",
          value: "5",
          icon: Shield,
          tone: "purple",
        },
        {
          label: "AI Knowledge Items",
          value: loadingFaqs ? "…" : String(aiItems),
          icon: MessageSquareText,
          tone: "green",
        },
        {
          label: "System Events",
          value: "1.2K",
          icon: Activity,
          tone: "orange",
        },
      ] as const,
    [totalUsers, aiItems, loadingUsers, loadingFaqs],
  );

  const portals: PortalStatusRow[] = [
    { name: "Student Portal", users: 2547, status: "online" },
    { name: "Faculty Portal", users: 124, status: "online" },
    { name: "Registrar Portal", users: 8, status: "online" },
    { name: "Finance Portal", users: 6, status: "online" },
    { name: "Dept Head Portal", users: 12, status: "online" },
  ];

  const activityRows: ActivityRow[] = [
    {
      title: "User role updated",
      subtitle: "admin@campus.edu",
      timeLabel: "2 mins ago",
      icon: Radio,
      tone: "blue",
    },
    {
      title: "New AI knowledge added",
      subtitle: "admin@campus.edu",
      timeLabel: "15 mins ago",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Failed login attempt",
      subtitle: "unknown",
      timeLabel: "1 hour ago",
      icon: AlertCircle,
      tone: "orange",
    },
    {
      title: "System backup completed",
      subtitle: "system",
      timeLabel: "3 hours ago",
      icon: CheckCircle2,
      tone: "green",
    },
  ];

  const quick: QuickAction[] = [
    { label: "Manage Users", icon: Users, to: "/superadmin/users" },
    { label: "Manage Roles", icon: Shield, to: "/superadmin/roles" },
    {
      label: "AI Knowledge",
      icon: MessageSquareText,
      to: "/superadmin/aiknowledge",
      badge: "AI",
    },
    { label: "View Logs", icon: Clock, to: "/superadmin/logs" },
  ];

  return (
    <div className="superadmin-dashboard">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
        <div>
          <h2 className="fw-bold mb-1">Super Admin Dashboard</h2>
          <p className="text-muted mb-0">
            Manage portals, users, and AI knowledge base
          </p>
        </div>
      </div>

      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        {stats.map((s) => (
          <div key={s.label} className="col-12 col-sm-6 col-xl-3">
            <StatCard label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
          </div>
        ))}
      </div>

      <div className="row g-3 g-md-4 mb-3 mb-md-4">
        <div className="col-12 col-lg-6">
          <PortalStatusCard title="Portal Status" rightPill="All Systems Online" rows={portals} />
        </div>

        <div className="col-12 col-lg-6">
          <RecentActivityCard
            title="Recent Activity"
            viewAllLabel="View All"
            viewAllTo="/superadmin/logs"
            rows={activityRows}
            rightIcon={ArrowRight}
          />
        </div>
      </div>

      <div className="row g-3 g-md-4">
        <div className="col-12">
          <QuickActionsGrid title="Quick Actions" items={quick} />
        </div>
      </div>
    </div>
  );
}