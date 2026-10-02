export type ClassItem = {
  id: string;
  code: string;
  title: string;
  section: string;
  schedule: string;
  room: string;
  students: number;
  capacity: number;
  progress: number; // percent
  accent: "blue" | "purple" | "green" | "orange";
  assigned?: boolean;
};