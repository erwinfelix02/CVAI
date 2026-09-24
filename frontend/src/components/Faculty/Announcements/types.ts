export type Priority = "low" | "medium" | "high";

export type Announcement = {
  id: string;
  course: string;         // e.g. "CS 101 - Intro to CS (BSCS 3A)" or "CS 401"
  subjectCode?: string;   // e.g. "CS 101"
  section?: string;       // e.g. "BSCS 3A"
  priority: Priority;     // "low" | "medium" | "high"
  title: string;
  message: string;
  date: string;           // e.g. "3/8/2025"
  scheduledDate?: string; // e.g. "2026-09-20T10:00"
  recipients: number;     // e.g. 19
  sendPush?: boolean;
  sendEmail?: boolean;
  facultyId?: string;
  author?: string;
  department?: string;
  pinned?: boolean;       // <-- Added pinned property
};