// src/types/User.ts
export type Role = "Student" | "Faculty";
export type Status = "active" | "inactive";

export interface User {
 id: string;
  name: string;
  email: string;
  role: "Student" | "Faculty";
  status: "active" | "inactive";
  courseOrDept?: string;
  yearOrPosition?: string;
};

