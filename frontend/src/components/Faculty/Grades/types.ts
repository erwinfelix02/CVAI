export type GradeStatus = "pending" | "complete";

export type GradeRow = {
  id: string;
  name: string;
  studentNo: string;
  courseId: string;
  quiz1?: number | "";
  quiz2?: number | "";
  midterm?: number | "";
  finals?: number | "";
  project?: number | "";
  finalGrade?: number | "—";
  status: GradeStatus;
};

export type CourseOption = {
  id: string;
  label: string; // "CS 201 - Data Structures"
  title: string; // "CS 201 - Data Structures & Algorithms"
};
