// src/services/scheduleService.ts

export interface ScheduleItem {
  _id: string;
  code: string;
  title: string;
  faculty: string;
  room: string;
  section: string;
  days: string;
  time: string;
  status: string;
  department: string;
}

export async function fetchSchedulesByDepartment(department: string): Promise<ScheduleItem[]> {
  const response = await fetch(`/api/schedules?department=${encodeURIComponent(department)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }
  return response.json();
}