// ✅ src/components/DepartmentHead/Schedules/types.ts

export type DayFilter = "All Days" | "MWF" | "TTh" | "Sat";

export interface ScheduleRow {
  id: string;
  code: string;
  title: string;
  section: string;
  faculty: string;
  room: string;
  days: "MWF" | "TTh" | "Sat";
  time: string;
status?: "Active" | "Inactive";
  // New tracking properties
  department?: string;
  createdBy?: {
    userId?: string;
    userName?: string;
    userRole?: string;
  };
}