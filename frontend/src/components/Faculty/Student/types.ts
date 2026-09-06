export type Student = {
  initials: string;
  name: string;
  id: string;
  section: string;
  gpa: number;
  attendance: number;
  status: "good" | "warning";
  course?: string;
  email?: string;
  phone?: string;
};