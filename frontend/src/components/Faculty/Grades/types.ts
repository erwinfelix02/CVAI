// ✅ src/components/Faculty/Grades/types.ts

export type GradeStatus = "pending" | "complete";

export type GradingComponentWeights = {
  quizzes: number;
  activities: number;
  examination: number;
};

export type GradingSystemData = {
  subjectType: string;
  termWeights: {
    prelim: number;
    midterm: number;
    finals: number;
  };
  components: {
    prelim: GradingComponentWeights;
    midterm: GradingComponentWeights;
    finals: GradingComponentWeights;
  };
};

export type TermGradeData = {
  quizzes?: number | "";
  activities?: number | "";
  examination?: number | "";
  grade?: number | "—";
};

export type GradeRow = {
  id: string;
  name: string;
  studentNo: string;
  courseId: string;
  prelim: TermGradeData;
  midterm: TermGradeData;
  finals: TermGradeData;
  finalGrade?: number | "—";
  status: GradeStatus;
  [key: string]: any; // Allows dynamic term indexing (prelim, midterm, finals)
};

export type CourseOption = {
  id: string;
  code: string;
  label: string;
  title: string;
  department: string;
  program?: string;
  gradingSystem?: GradingSystemData | null;
};
