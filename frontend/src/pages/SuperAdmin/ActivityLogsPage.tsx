import { useMemo, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, Shield } from "lucide-react";

import LogsHeader from "../../components/SuperAdmin/Logs/LogsHeader";
import LogsStats from "../../components/SuperAdmin/Logs/LogsStats";
import LogsFilters from "../../components/SuperAdmin/Logs/LogsFilters";
import LogsTable from "../../components/SuperAdmin/Logs/LogsTable";

import type { LogRow, LogStatus, LogType, StatCard } from "../../components/SuperAdmin/Logs/types";
import "../../styles/superadmin-logs.css";

const seed: LogRow[] = [
  {
    id: "l1",
    date: "2025-01-21",
    time: "14:32:15",
    action: "User Login",
    user: "admin@university.edu",
    role: "admin",
    type: "Auth",
    details: "Successful admin login",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "l2",
    date: "2025-01-21",
    time: "14:28:45",
    action: "Grade Updated",
    user: "dr.smith@university.edu",
    role: "faculty",
    type: "Data",
    details: "Updated grades for CS 301",
    ip: "192.168.1.105",
    status: "success",
  },
  {
    id: "l3",
    date: "2025-01-21",
    time: "14:25:30",
    action: "Schedule Created",
    user: "admin@university.edu",
    role: "admin",
    type: "Data",
    details: "Assigned CS 301 to Dr. Smith",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "l4",
    date: "2025-01-21",
    time: "14:20:12",
    action: "Failed Login Attempt",
    user: "unknown@test.com",
    role: "student",
    type: "Security",
    details: "Invalid credentials - 3rd attempt",
    ip: "45.67.89.123",
    status: "warning",
  },
  {
    id: "l5",
    date: "2025-01-21",
    time: "14:15:00",
    action: "Student Enrolled",
    user: "registrar@university.edu",
    role: "admin",
    type: "Data",
    details: "Maria Santos enrolled in BSCS",
    ip: "192.168.1.102",
    status: "success",
  },
];

export default function ActivityLogsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<LogType | "All">("All");
  const [status, setStatus] = useState<LogStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return seed.filter((r) => {
      const matchesQuery =
        !q ||
        r.action.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        r.ip.toLowerCase().includes(q);

      const matchesType = type === "All" ? true : r.type === type;
      const matchesStatus = status === "All" ? true : r.status === status;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, type, status]);

  const stats: StatCard[] = useMemo(() => {
    const total = seed.length;
    const success = seed.filter((x) => x.status === "success").length;
    const warnings = seed.filter((x) => x.status === "warning").length;
    const security = seed.filter((x) => x.type === "Security").length;

    return [
      { label: "Total Events", value: total, icon: Activity, tone: "blue" },
      { label: "Successful", value: success, icon: CheckCircle2, tone: "green" },
      { label: "Warnings", value: warnings, icon: AlertTriangle, tone: "orange" },
      { label: "Security Events", value: security, icon: Shield, tone: "red" },
    ];
  }, []);

  return (
    <div className="superadmin-logs">
      <LogsHeader
        title="Activity Logs & Monitoring"
        subtitle="Monitor system activity and security events"
        onRefresh={() => alert("Refresh")}
        onExport={() => alert("Export logs")}
      />

      <LogsStats items={stats} />

      <LogsFilters
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
      />

      <LogsTable rows={filtered} />
    </div>
  );
}
