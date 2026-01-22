import "../../styles/grades.css";
import StatCard from "../../components/Student/Grades/StatCard";
import GradesTableCard from "../../components/Student/Grades/GradesTableCard";

import {
  TrendingUp,
  BookOpen,
  Award,
  Download,
  ChevronDown,
} from "lucide-react";

type CurrentRow = {
  code: string;
  subject: string;
  units: number;
  midterm: string;
  finals: string;
  finalGrade: string;
  status: "In Progress" | "Completed";
  midtermTone?: "blue" | "green" | "orange";
};

type PrevRow = {
  code: string;
  subject: string;
  units: number;
  finalGrade: string;
  status: "Passed" | "Failed";
  gradeTone?: "blue" | "green";
};

const currentSemester = [
  {
    code: "MATH101",
    subject: "Mathematics 101",
    units: 3,
    midterm: "88",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "blue",
  },
  {
    code: "CS201",
    subject: "Computer Science",
    units: 3,
    midterm: "92",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "green",
  },
  {
    code: "ENG102",
    subject: "English Literature",
    units: 3,
    midterm: "85",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "blue",
  },
  {
    code: "PHY101",
    subject: "Physics",
    units: 4,
    midterm: "78",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "orange",
  },
  {
    code: "FIL101",
    subject: "Filipino",
    units: 3,
    midterm: "90",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "green",
  },
  {
    code: "PE101",
    subject: "Physical Education",
    units: 2,
    midterm: "95",
    finals: "-",
    finalGrade: "-",
    status: "In Progress",
    midtermTone: "green",
  },
] satisfies CurrentRow[];

const previousSemester = [
  {
    code: "CS101",
    subject: "Introduction to Computing",
    units: 3,
    finalGrade: "1.25",
    status: "Passed",
    gradeTone: "green",
  },
  {
    code: "MATH100",
    subject: "College Algebra",
    units: 3,
    finalGrade: "1.50",
    status: "Passed",
    gradeTone: "blue",
  },
  {
    code: "ENG101",
    subject: "Communication Arts",
    units: 3,
    finalGrade: "1.75",
    status: "Passed",
    gradeTone: "blue",
  },
  {
    code: "NSTP1",
    subject: "NSTP 1",
    units: 3,
    finalGrade: "1.00",
    status: "Passed",
    gradeTone: "green",
  },
  {
    code: "PE100",
    subject: "Physical Fitness",
    units: 2,
    finalGrade: "1.25",
    status: "Passed",
    gradeTone: "green",
  },
] satisfies PrevRow[];

export default function GradesPage() {
  return (
    <div className="grades-page">
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="fw-bold mb-1">Academic Grades</h2>
          <p className="text-muted mb-0">View your academic performance</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
            2nd Semester 2024-2025 <ChevronDown size={16} />
          </button>

          <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <StatCard
            icon={TrendingUp}
            tone="neutral"
            value="1.45"
            label="Current GPA"
          />
        </div>

        <div className="col-12 col-lg-4">
          <StatCard
            icon={BookOpen}
            tone="blue"
            value="18"
            label="Units Enrolled"
          />
        </div>

        <div className="col-12 col-lg-4">
          <StatCard
            icon={Award}
            tone="green"
            value="Dean's List"
            label="Academic Standing"
            bigTitle
          />
        </div>
      </div>

      {/* Tables */}
      <GradesTableCard
        title="Current Semester Grades"
        titleIcon={BookOpen}
        variant="current"
        rows={currentSemester}
      />

      <div className="mt-3">
        <GradesTableCard
          title="Previous Semester (1st Sem 2024-2025)"
          titleIcon={Award}
          variant="previous"
          rows={previousSemester}
        />
      </div>
    </div>
  );
}
