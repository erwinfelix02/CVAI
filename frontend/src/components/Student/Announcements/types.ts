export type Announcement = {
  id: string;
  title: string;
  message?: string;
  body?: string;
  date: string;
  course?: string;
  subjectCode?: string;
  section?: string;
  category?: string;
  categoryTone?: "danger" | "primary" | "success" | "warning" | "purple";
  priority?: "low" | "medium" | "high";
  pinned?: boolean;
};