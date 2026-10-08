// src/services/scheduleService.ts
import { API_BASE_URL } from "../config";

export interface ScheduleItem {
  _id: string;
  code: string;
  title: string;
  faculty: string; // <-- Faculty property
  room: string;
  section: string;
  days: string;
  time: string;
  status: string;
  department: string;
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token) return token;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return parsed.token || parsed.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchSchedulesByDepartment(department: string): Promise<ScheduleItem[]> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/schedules?department=${encodeURIComponent(department)}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch schedules");
  }

  return response.json();
}