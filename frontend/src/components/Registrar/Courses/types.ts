export type CourseStatus = "Active" | "Inactive";

export type CourseItem = {
  id: string;
  code: string;
  name: string;
  yearLevels: number;      // e.g. 4 (Years)
  department: string;      // e.g. College of Computer Studies
  status: CourseStatus;
};