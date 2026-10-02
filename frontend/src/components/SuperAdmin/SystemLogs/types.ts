import type { LucideIcon } from "lucide-react";

export type LogType = "Auth" | "Data" | "Security" | "System";
export type LogStatus = "success" | "warning" | "error";

export type LogRow = {
  id: string;
  date: string;   // e.g. 2025-01-21
  time: string;   // e.g. 14:32:15
  action: string; // e.g. User Login
  user: string;   // e.g. admin@university.edu
  role: "admin" | "faculty" | "student" | "registrar" | "unknown";
  type: LogType;
  details: string;
  ip: string;
  status: LogStatus;
};

export type StatCard = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: "blue" | "green" | "orange" | "red";
};
