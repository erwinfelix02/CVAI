export type StudentStatus = "Active" | "Inactive" | "Dropped" | "Graduated";

export type StudentRow = {
  id: string; // student id
  initials: string;
  name: string;
  email: string;
  course: string;
  section: string;
  year: number;
  status: StudentStatus;
};
