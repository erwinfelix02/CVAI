export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
  categoryTone: "danger" | "primary" | "success" | "warning" | "purple";
  pinned?: boolean;
  priority?: "low" | "medium" | "high";
  author?: string;
  department?: string;
  read?: boolean;
};