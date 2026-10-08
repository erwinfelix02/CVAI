// src/pages/Student/GradesPage.tsx

import { useState, useEffect } from "react";
import "../../styles/grades.css";
import StatCard from "../../components/Student/Grades/StatCard";
import GradesTableCard, { type CurrentRow } from "../../components/Student/Grades/GradesTableCard";
import GradeBreakdownModal from "../../components/Student/Grades/GradeBreakdownModal";
import { API_BASE_URL } from "../../config";

import {
  TrendingUp,
  BookOpen,
  Award,
  Download,
} from "lucide-react";

export default function GradesPage() {
  const [gradesData, setGradesData] = useState<Record<string, any>>({});
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [studentYearLevel, setStudentYearLevel] = useState<number>(1);
  const [gpa, setGpa] = useState<string>("1.00");
  const [unitsEnrolled, setUnitsEnrolled] = useState<number>(0);
  const [academicStanding, setAcademicStanding] = useState<string>("Regular");
  const [loading, setLoading] = useState<boolean>(true);

  const [modalState, setModalState] = useState<{
    show: boolean;
    subjectCode: string;
    term: "prelim" | "midterm" | "finals";
    gradeData: any;
  }>({
    show: false,
    subjectCode: "",
    term: "midterm",
    gradeData: null,
  });

  useEffect(() => {
    async function fetchGrades() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({ 
          ...(selectedSemester ? { semester: selectedSemester } : {}),
          yearLevel: studentYearLevel.toString()
        });

        const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || "{}")?.token;
        const endpoint = `${API_BASE_URL}/students/my-grades?${queryParams.toString()}`;

        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setGradesData(data.grades || {});
          setGpa(data.gpa || "1.00");
          setUnitsEnrolled(data.unitsEnrolled || 0);
          setAcademicStanding(data.academicStanding || "Regular");
          
          if (data.availableSemesters && data.availableSemesters.length > 0) {
            setAvailableSemesters(data.availableSemesters);
            if (!selectedSemester || !data.availableSemesters.includes(selectedSemester)) {
              setSelectedSemester(data.availableSemesters[0]);
            }
          }

          if (data.yearLevel) {
            setStudentYearLevel(data.yearLevel);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live grades exception:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, [selectedSemester, studentYearLevel]);

  const currentSemesterRows: CurrentRow[] = Object.entries(gradesData).map(([code, details]: [string, any]) => {
    return {
      code,
      subject: details.subjectName || code,
      units: details.units || 3,
      prelim: details.prelim?.grade ?? "—",
      midterm: details.midterm?.grade ?? "—",
      finals: details.finals?.grade ?? "—",
      finalGrade: details.finalGrade ?? "—",
      status: details.status === "complete" || details.status === "completed" ? "Completed" : "In Progress",
      rawDetails: details,
    };
  });

  const handleCellClick = (code: string, term: "prelim" | "midterm" | "finals", rawDetails: any) => {
    if (!rawDetails || !rawDetails[term]) return;
    setModalState({
      show: true,
      subjectCode: code,
      term,
      gradeData: rawDetails,
    });
  };

  if (loading && availableSemesters.length === 0) {
    return <div className="p-5 text-center text-muted">Loading your academic performance...</div>;
  }

  return (
    <div className="grades-page">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="fw-bold mb-1">Academic Grades</h2>
          <p className="text-muted mb-0">View your live academic performance for Year {studentYearLevel}</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select 
            className="form-select form-select-sm w-auto"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-4">
          <StatCard icon={TrendingUp} tone="neutral" value={gpa} label="Current GPA" />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard icon={BookOpen} tone="blue" value={unitsEnrolled.toString()} label="Units Enrolled" />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard icon={Award} tone="green" value={academicStanding} label="Academic Standing" bigTitle />
        </div>
      </div>

      <GradesTableCard
        title={`Current Semester Grades (${selectedSemester})`}
        titleIcon={BookOpen}
        variant="current"
        rows={currentSemesterRows}
        onCellClick={handleCellClick}
      />

      <GradeBreakdownModal
        show={modalState.show}
        onClose={() => setModalState({ ...modalState, show: false })}
        subjectCode={modalState.subjectCode}
        term={modalState.term}
        gradeData={modalState.gradeData}
      />
    </div>
  );
}
