export type DepartmentStatus = "Active" | "Inactive";

export type DepartmentItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  head: string;
  status: DepartmentStatus;
};