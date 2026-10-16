export type Priority = "low" | "medium" | "high";

export type Announcement = {
  id: string;
  department: string;       // e.g. "College of Information Technology"
  targetAudience: string;   // e.g. "All Department Students", "BSIT 3rd Year", etc.
  priority: Priority;       // "low" | "medium" | "high"
  title: string;
  message: string;
  date: string;             // e.g. "3/8/2025"
  scheduledDate?: string;   // e.g. "2026-09-20T10:00"
  recipients: number;       // e.g. 150
  sendPush?: boolean;
  sendEmail?: boolean;
  author?: string;
  pinned?: boolean;
};