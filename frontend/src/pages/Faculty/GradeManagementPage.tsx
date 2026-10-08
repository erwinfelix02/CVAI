// ✅ src/pages/Faculty/GradeManagementPage.tsx

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Download,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Percent,
  Search,
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import GradesTable from "../../components/Faculty/Grades/GradesTable";
import InputGradeModal from "../../components/Faculty/Grades/InputGradeModal";
import "../../styles/faculty-grades.css";

export type GradeStatus = "pending" | "complete";

export type TermGradeData = {
  quizzes?: number | "";
  activities?: number | "";
  examination?: number | "";
  grade?: number | "—";
};

export type GradeRow = {
  id: string;
  studentDbId?: string;
  name: string;
  studentNo: string;
  courseId: string;
  courseCode?: string;
  yearLevel?: number; // 👈 Track student year level context
  prelim: TermGradeData;
  midterm: TermGradeData;
  finals: TermGradeData;
  finalGrade?: number | "—";
  status: GradeStatus;
  [key: string]: any;
};

export type CourseOption = {
  id: string;
  code: string;
  label: string;
  title: string;
  department: string;
  section: string;
  faculty: string;
  program?: string;
  gradingSystem?: {
    subjectType: string;
    termWeights: { prelim: number; midterm: number; finals: number };
    components: {
      prelim: { quizzes: number; activities: number; examination: number };
      midterm: { quizzes: number; activities: number; examination: number };
      finals: { quizzes: number; activities: number; examination: number };
    };
  };
};

export default function GradeManagementPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [activeTerm, setActiveTerm] = useState<"prelim" | "midterm" | "finals">(
    "prelim",
  );
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [editingStudent, setEditingStudent] = useState<GradeRow | null>(null);

  const currentUser = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const facultyName = currentUser?.name || currentUser?.username || "";
  const department = currentUser?.department || "";

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (department) queryParams.append("department", department);
      if (facultyName) queryParams.append("faculty", facultyName);

      const [schedRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/schedules?${queryParams.toString()}`),
        fetch(
          `${API_BASE_URL}/subjects${department ? `?department=${encodeURIComponent(department)}` : ""}`,
        ),
      ]);

      if (!schedRes.ok) throw new Error("Failed to fetch schedules");
      const schedules = await schedRes.json();
      const subjects = subRes.ok ? await subRes.json() : [];

      const subjectMap = new Map();
      subjects.forEach((sub: any) => {
        if (sub.code) {
          subjectMap.set(sub.code.trim().toUpperCase(), sub);
        }
      });

      const courseMap = new Map<string, CourseOption>();
      schedules.forEach((sch: any) => {
        const code = sch.code?.trim().toUpperCase();
        const scheduleUniqueId = sch._id || `${code}-${sch.section}`;
        if (code) {
          const matchedSubject = subjectMap.get(code);

          courseMap.set(scheduleUniqueId, {
            id: scheduleUniqueId,
            code: code,
            label: `${code} - ${matchedSubject?.name || sch.title || "Subject"} (Section: ${sch.section || "N/A"})`,
            title: `${code} - ${matchedSubject?.name || sch.title || "Subject"}`,
            department: sch.department,
            section: sch.section || "",
            faculty: sch.faculty || "",
            program: matchedSubject?.program || "",
            gradingSystem: matchedSubject?.gradingSystem || null,
          });
        }
      });

      const uniqueCourses = Array.from(courseMap.values());
      setCourses(uniqueCourses);

      let targetCourseId = courseId;
      if (
        uniqueCourses.length > 0 &&
        (!targetCourseId || !courseMap.has(targetCourseId))
      ) {
        targetCourseId = uniqueCourses[0].id;
        setCourseId(targetCourseId);
      }

      const activeCourseOption = courseMap.get(targetCourseId);

      const studentQueryParams = new URLSearchParams();
      if (department) studentQueryParams.append("department", department);
      if (facultyName) studentQueryParams.append("facultyName", facultyName);
      if (activeCourseOption?.section)
        studentQueryParams.append("section", activeCourseOption.section);

      const studRes = await fetch(
        `${API_BASE_URL}/students?${studentQueryParams.toString()}`,
      );
      if (studRes.ok) {
        const allStudents = await studRes.json();

        const expandedRows: GradeRow[] = [];
        uniqueCourses.forEach((c) => {
          const matchedStudents = allStudents.filter((st: any) => {
            const studentSection = String(st.section || "")
              .trim()
              .toLowerCase();
            const targetSection = String(c.section || "")
              .trim()
              .toLowerCase();
            const matchesSection = targetSection
              ? studentSection === targetSection
              : true;

            const enrolledList = st.enrolledSubjects || st.courses || [];
            const matchesSubject = enrolledList.some((sub: string) =>
              sub.toUpperCase().includes(c.code.toUpperCase()),
            );

            return matchesSection || matchesSubject;
          });

          matchedStudents.forEach((st: any, idx: number) => {
            const studentGrades =
              st.grades?.[c.code] || st.grades?.[c.id] || {};

            expandedRows.push({
              id: `${c.id}-${st._id || st.id || idx}`,
              studentDbId: st._id || st.id,
              name: `${st.firstName || st.name || "Student"} ${st.lastName || ""}`.trim(),
              studentNo:
                st.studentNo || st.studentId || st.id || `2026-000${idx + 1}`,
              courseId: c.id,
              courseCode: c.code,
              yearLevel: st.yearLevel || 1, // 👈 Capture year level
              prelim: studentGrades.prelim || {
                quizzes: "",
                activities: "",
                examination: "",
                grade: "—",
              },
              midterm: studentGrades.midterm || {
                quizzes: "",
                activities: "",
                examination: "",
                grade: "—",
              },
              finals: studentGrades.finals || {
                quizzes: "",
                activities: "",
                examination: "",
                grade: "—",
              },
              finalGrade: studentGrades.finalGrade || "—",
              status: studentGrades.status || "pending",
            });
          });
        });

        setRows(expandedRows);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [department, facultyName, courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === courseId) || null;
  }, [courses, courseId]);

  const courseRows = useMemo(() => {
    return rows.filter((r) => r.courseId === courseId);
  }, [rows, courseId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courseRows;
    return courseRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.studentNo.toLowerCase().includes(q),
    );
  }, [courseRows, search]);

  const gradingSystem = selectedCourse?.gradingSystem || {
    subjectType: "Laboratory",
    termWeights: { prelim: 30, midterm: 30, finals: 40 },
    components: {
      prelim: { quizzes: 20, activities: 50, examination: 30 },
      midterm: { quizzes: 20, activities: 50, examination: 30 },
      finals: { quizzes: 20, activities: 50, examination: 30 },
    },
  };

  const currentTermWeights = gradingSystem.components[activeTerm] || {
    quizzes: 20,
    activities: 50,
    examination: 30,
  };

  // 🔄 Automatic backend database sync with current year level and semester registration context
  const syncGradeToBackend = async (updatedStudent: GradeRow) => {
    if (!selectedCourse) return;
    try {
      await fetch(`${API_BASE_URL}/students/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: updatedStudent.studentDbId || updatedStudent.id,
          studentNo: updatedStudent.studentNo,
          studentName: updatedStudent.name,
          subjectCode: selectedCourse.code,
          subjectTitle: selectedCourse.title,
          faculty: facultyName,
          department: department,
          term: activeTerm,
          yearLevel: updatedStudent.yearLevel, // 👈 Sends student's active year level
          grades: {
            prelim: updatedStudent.prelim,
            midterm: updatedStudent.midterm,
            finals: updatedStudent.finals,
            finalGrade: updatedStudent.finalGrade,
            status: updatedStudent.status,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to auto-save grade to database:", err);
    }
  };

  const handleSaveGradeFromModal = (
    studentId: string,
    gradeType: string,
    score: number | "",
  ) => {
    setRows((prev) => {
      const nextRows = prev.map((r) => {
        if (r.id !== studentId) return r;

        const termData = {
          ...r[activeTerm],
          [gradeType]: score,
        };

        const qW = currentTermWeights.quizzes / 100;
        const aW = currentTermWeights.activities / 100;
        const eW = currentTermWeights.examination / 100;

        const qVal =
          typeof termData.quizzes === "number" ? termData.quizzes : 0;
        const aVal =
          typeof termData.activities === "number" ? termData.activities : 0;
        const eVal =
          typeof termData.examination === "number" ? termData.examination : 0;

        const hasAnyScore =
          termData.quizzes !== "" ||
          termData.activities !== "" ||
          termData.examination !== "";
        let computedTermGrade: number | "—" = "—";

        if (hasAnyScore) {
          computedTermGrade =
            Math.round((qVal * qW + aVal * aW + eVal * eW) * 10) / 10;
        }

        const updatedRow = {
          ...r,
          [activeTerm]: { ...termData, grade: computedTermGrade },
          status:
            computedTermGrade !== "—"
              ? ("complete" as GradeStatus)
              : ("pending" as GradeStatus),
        };

        syncGradeToBackend(updatedRow);
        return updatedRow;
      });
      return nextRows;
    });
  };

  function onChangeScore(
    id: string,
    field: "quizzes" | "activities" | "examination",
    val: string,
  ) {
    const numericVal =
      val === "" ? "" : Math.max(0, Math.min(100, Number(val)));

    setRows((prev) => {
      const nextRows = prev.map((r) => {
        if (r.id !== id) return r;

        const termData = {
          ...r[activeTerm],
          [field]: isNaN(Number(numericVal)) ? "" : numericVal,
        };

        const qW = currentTermWeights.quizzes / 100;
        const aW = currentTermWeights.activities / 100;
        const eW = currentTermWeights.examination / 100;

        const qVal =
          typeof termData.quizzes === "number" ? termData.quizzes : 0;
        const aVal =
          typeof termData.activities === "number" ? termData.activities : 0;
        const eVal =
          typeof termData.examination === "number" ? termData.examination : 0;

        const hasAnyScore =
          termData.quizzes !== "" ||
          termData.activities !== "" ||
          termData.examination !== "";
        let computedTermGrade: number | "—" = "—";

        if (hasAnyScore) {
          computedTermGrade =
            Math.round((qVal * qW + aVal * aW + eVal * eW) * 10) / 10;
        }

        const updatedRow = {
          ...r,
          [activeTerm]: { ...termData, grade: computedTermGrade },
          status:
            computedTermGrade !== "—"
              ? ("complete" as GradeStatus)
              : ("pending" as GradeStatus),
        };

        syncGradeToBackend(updatedRow);
        return updatedRow;
      });
      return nextRows;
    });
  }

  const handleActionClick = (student: GradeRow) => {
    setEditingStudent(student);
  };

  const stats = useMemo(() => {
    const totalStudents = courseRows.length;
    const termGraded = courseRows.filter(
      (r) => r[activeTerm]?.grade !== "—",
    ).length;
    const pending = totalStudents - termGraded;

    const termGradesList = courseRows
      .map((r) =>
        typeof r[activeTerm]?.grade === "number"
          ? (r[activeTerm].grade as number)
          : null,
      )
      .filter((x): x is number => x !== null);

    const termAverage = termGradesList.length
      ? Math.round(
          (termGradesList.reduce((a, b) => a + b, 0) / termGradesList.length) *
            10,
        ) / 10
      : 0.0;

    return {
      totalStudents,
      complete: termGraded,
      pending,
      classAverage: termAverage,
    };
  }, [courseRows, activeTerm]);

  if (isLoading) {
    return (
      <div className="container-fluid faculty-grades-page py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading assigned courses...</span>
        </div>
        <p className="mt-2 text-muted">
          Loading assigned subjects from your schedule...
        </p>
      </div>
    );
  }

  const capitalizedTerm =
    activeTerm.charAt(0).toUpperCase() + activeTerm.slice(1);

  return (
    <div className="container-fluid faculty-grades-page">
      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
        <div>
          <h3 className="fw-bold mb-1">Grade Management</h3>
          <p className="text-muted mb-0">
            Grading follows the system set by your Department Head
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 grade-actions">
          <button className="btn btn-light border d-inline-flex align-items-center gap-2 px-3">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filters / Course Selector */}
      <div className="card shadow-sm mb-3 mb-md-4 faculty-grades-filters">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setSearch("");
                }}
              >
                {courses.length === 0 ? (
                  <option value="">No assigned courses found</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={16} />
                </span>
                <input
                  className="form-control"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-3 mb-md-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 faculty-grade-stat">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="grade-stat-icon blue">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="fw-bold fs-4 grade-stat-value">
                  {stats.totalStudents}
                </div>
                <div className="text-muted">Total Students</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 faculty-grade-stat">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="grade-stat-icon green">
                <CircleDashed size={20} />
              </div>
              <div>
                <div className="fw-bold fs-4 grade-stat-value">
                  {stats.complete}
                </div>
                <div className="text-muted">{capitalizedTerm} Graded</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 faculty-grade-stat">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="grade-stat-icon orange">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="fw-bold fs-4 grade-stat-value">
                  {stats.pending}
                </div>
                <div className="text-muted">Pending</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm h-100 faculty-grade-stat">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="grade-stat-icon slate">
                <Percent size={20} />
              </div>
              <div>
                <div className="fw-bold fs-4 grade-stat-value">
                  {stats.classAverage}
                </div>
                <div className="text-muted">{capitalizedTerm} Average</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table Component */}
      <GradesTable
        title={selectedCourse?.title || "Course Students"}
        rows={filtered}
        activeTerm={activeTerm}
        setActiveTerm={setActiveTerm}
        gradingSystem={gradingSystem}
        onChangeScore={onChangeScore}
        onOpenEditModal={(student: GradeRow) => handleActionClick(student)}
      />

      <InputGradeModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        activeTerm={activeTerm}
        selectedCourseLabel={selectedCourse?.label || courseId}
        gradingSystem={gradingSystem}
        onSaveGrade={handleSaveGradeFromModal}
      />
    </div>
  );
}
