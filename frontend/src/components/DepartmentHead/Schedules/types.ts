// src/components/DepartmentHead/Schedules/types.ts
export type DayFilter = "All Days" | "MWF" | "TTh" | "Sat";

export type ScheduleRow = {
  id: string;
  code: string;       // CPSC 101
  section: string;    // BSCS-1A
  title: string;      // Introduction to Programming
  faculty: string;    // Dr. John Smith
  room: string;       // Room 301 / Lab 1
  days: "MWF" | "TTh" | "Sat";
  time: string;       // 08:00-09:00
};
