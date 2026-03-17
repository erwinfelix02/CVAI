import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  XCircle,
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
import { API_BASE_URL } from "../../config";

import "../../styles/superadmin-dashboard.css";

type LogStatus = "success" | "warning" | "error";
type LogType = "Auth" | "Data" | "Security" | "System";

type LogRow = {
  id: string;
  date: string;
  time: string;
  action: string;
  user: string;
  role: string;
  type: LogType;
  details: string;
  ip: string;
  status: LogStatus;
};

function getTimeAgo(date: string, time: string) {
  const logDate = new Date(`${date}T${time}`);
  const now = new Date();
  const diffMs = now.getTime() - logDate.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) return `${date} ${time}`;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return `${date} ${time}`;
}

function getActivityMeta(log: LogRow): Pick<ActivityRow, "icon" | "tone"> {
  if (log.status === "success") {
    if (log.type === "Auth") return { icon: Radio, tone: "blue" };
    return { icon: CheckCircle2, tone: "green" };
  }

  if (log.status === "warning") {
    return { icon: AlertCircle, tone: "orange" };
  }

  return { icon: XCircle, tone: "orange" };
}

export default function SuperAdminDashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);
  const [aiItems, setAiItems] = useState(0);
  const [systemEvents, setSystemEvents] = useState(0);
  const [recentLogs, setRecentLogs] = useState<LogRow[]>([]);
  const [portals, setPortals] = useState<PortalStatusRow[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingPortals, setLoadingPortals] = useState(false);

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
    const load = async () => {
      const token = localStorage.getItem("sessionToken");

      try {
        setLoadingUsers(true);
        const users = await getUsers();
        setTotalUsers(Array.isArray(users) ? users.length : 0);
      } catch (err) {
        console.error("Failed to load users count", err);
        setTotalUsers(0);
      } finally {
        setLoadingUsers(false);
      }

      try {
        setLoadingFaqs(true);
        const faqs = await getFaqs();
        setAiItems(Array.isArray(faqs) ? faqs.length : 0);
      } catch (err) {
        console.error("Failed to load FAQ count", err);
        setAiItems(0);
      } finally {
        setLoadingFaqs(false);
      }

      try {
        setLoadingLogs(true);
        const res = await axios.get(`${API_BASE_URL}/logs`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        const logs: LogRow[] = Array.isArray(res.data) ? res.data : [];
        setSystemEvents(logs.length);
        setRecentLogs(logs.slice(0, 4));
      } catch (err) {
        console.error("Failed to load logs", err);
        setSystemEvents(0);
        setRecentLogs([]);
      } finally {
        setLoadingLogs(false);
      }

      try {
        setLoadingPortals(true);
        const res = await axios.get(`${API_BASE_URL}/users/portal-statuses`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        setPortals(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load portal statuses", err);
        setPortals([]);
      } finally {
        setLoadingPortals(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const refreshPortals = async () => {
      try {
        const token = localStorage.getItem("sessionToken");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/users/portal-statuses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPortals(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to refresh portal statuses", err);
      }
    };

    refreshPortals();
    const interval = setInterval(refreshPortals, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem("sessionToken");
        if (!token) return;

        await axios.post(
          `${API_BASE_URL}/auth/heartbeat`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
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
          value: loadingLogs ? "…" : String(systemEvents),
          icon: Activity,
          tone: "orange",
        },
      ] as const,
    [totalUsers, aiItems, systemEvents, loadingUsers, loadingFaqs, loadingLogs],
  );

  const activityRows: ActivityRow[] = useMemo(() => {
    if (!recentLogs.length) {
      return [
        {
          title: loadingLogs ? "Loading activity..." : "No recent activity",
          subtitle: loadingLogs ? "Please wait" : "No logs available",
          timeLabel: "",
          icon: Clock,
          tone: "blue",
        },
      ];
    }

    return recentLogs.map((log) => {
      const meta = getActivityMeta(log);

      return {
        title: log.action,
        subtitle: log.user || "unknown",
        timeLabel: getTimeAgo(log.date, log.time),
        icon: meta.icon,
        tone: meta.tone,
      };
    });
  }, [recentLogs, loadingLogs]);

  const portalRows = useMemo<PortalStatusRow[]>(() => {
    if (loadingPortals) {
      return [
        {
          name: "Loading portals...",
          users: 0,
          onlineUsers: 0,
          status: "offline",
        },
      ];
    }

    if (!portals.length) {
      return [
        {
          name: "No portals available",
          users: 0,
          onlineUsers: 0,
          status: "offline",
        },
      ];
    }

    return portals;
  }, [portals, loadingPortals]);

  const portalPill = useMemo(() => {
    if (!portals.length) return "No Portal Data";
    const allOnline = portals.every((p) => p.status === "online");
    return allOnline ? "All Systems Online" : "Some Portals Offline";
  }, [portals]);

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
    <>
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
              <StatCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                tone={s.tone}
              />
            </div>
          ))}
        </div>

        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          <div className="col-12 col-lg-6">
            <PortalStatusCard
              title="Portal Status"
              rightPill={portalPill}
              rows={portalRows}
            />
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
    </>
  );
}