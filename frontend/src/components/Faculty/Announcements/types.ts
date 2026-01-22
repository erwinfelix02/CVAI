export type Priority = "low" | "medium" | "high";

export type Announcement = {
  id: string;
  course: string;       // e.g. "CS 401"
  priority: Priority;   // low | medium | high
  title: string;
  message: string;
  date: string;         // e.g. "3/8/2025"
  recipients: number;   // e.g. 19
};
