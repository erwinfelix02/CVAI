import { useMemo, useState } from "react";
import { Download, Plus, Save } from "lucide-react";

import GradesFilters from "../../components/Faculty/Grades/GradesFilters";
import GradesStats from "../../components/Faculty/Grades/GradesStats";
import GradesTable from "../../components/Faculty/Grades/GradesTable";
import type { CourseOption, GradeRow } from "../../components/Faculty/Grades/types";

import "../../styles/faculty-grades.css";

const courses: CourseOption[] = [
  {
    id: "cs201",
    label: "CS 201 - Data Structures",
    title: "CS 201 - Data Structures & Algorithms",
  },
  {
    id: "cs101",
    label: "CS 101 - Programming",
    title: "CS 101 - Introduction to Programming",
  },
];

// ✅ Now rows belong to a course
const seedRows: GradeRow[] = [
  {
    id: "s1",
    courseId: "cs201",
    name: "Maria Santos",
    studentNo: "2024-00123",
    quiz1: 92,
    quiz2: 88,
    midterm: 90,
    finals: "",
    project: 95,
    finalGrade: "—",
    status: "pending",
  },
  {
    id: "s2",
    courseId: "cs201",
    name: "Juan Dela Cruz",
    studentNo: "2024-00124",
    quiz1: 85,
    quiz2: 78,
    midterm: 82,
    finals: "",
    project: 88,
    finalGrade: "—",
    status: "pending",
  },
  {
    id: "s3",
    courseId: "cs201",
    name: "Ana Reyes",
    studentNo: "2024-00125",
    quiz1: 95,
    quiz2: 93,
    midterm: 94,
    finals: "",
    project: 98,
    finalGrade: "—",
    status: "pending",
  },

  // ✅ Example CS101 students (add/remove as you want)
  {
    id: "s4",
    courseId: "cs101",
    name: "Pedro Garcia",
    studentNo: "2024-00126",
    quiz1: 72,
    quiz2: 68,
    midterm: 70,
    finals: "",
    project: 75,
    finalGrade: "—",
    status: "pending",
  },
  {
    id: "s5",
    courseId: "cs101",
    name: "Elena Cruz",
    studentNo: "2024-00127",
    quiz1: 88,
    quiz2: 90,
    midterm: 87,
    finals: "",
    project: 92,
    finalGrade: "—",
    status: "pending",
  },
];

export default function GradeManagementPage() {
  const [courseId, setCourseId] = useState<string>(courses[0].id);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<GradeRow[]>(seedRows);

  const courseTitle = useMemo(() => {
    return courses.find((c) => c.id === courseId)?.title ?? "";
  }, [courseId]);

  // ✅ Filter rows by selected course first
  const courseRows = useMemo(() => {
    return rows.filter((r) => r.courseId === courseId);
  }, [rows, courseId]);

  // ✅ Search works inside selected course
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courseRows;

    return courseRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.studentNo.toLowerCase().includes(q)
    );
  }, [courseRows, search]);

  // ✅ Stats match current selected course
  const stats = useMemo(() => {
    const totalStudents = courseRows.length;
    const complete = courseRows.filter((r) => r.status === "complete").length;
    const pending = courseRows.filter((r) => r.status === "pending").length;

    const finals = courseRows
      .map((r) => (typeof r.finalGrade === "number" ? r.finalGrade : null))
      .filter((x): x is number => x !== null);

    const classAverage = finals.length
      ? Math.round((finals.reduce((a, b) => a + b, 0) / finals.length) * 10) /
        10
      : 84.6;

    return { totalStudents, complete, pending, classAverage };
  }, [courseRows]);

  function updateRow(id: string, patch: Partial<GradeRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function onChangeScore(id: string, key: keyof GradeRow, v: string) {
    const next = v === "" ? "" : Math.max(0, Math.min(100, Number(v)));
    updateRow(id, { [key]: isNaN(Number(next)) ? "" : next } as any);
  }

  function handleSave() {
    console.log("Saving rows:", rows);
    alert("Saved! (Check console)");
  }

  return (
    <div className="container-fluid faculty-grades-page">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3 mb-md-4">
        <div>
          <h3 className="fw-bold mb-1">Grade Management</h3>
          <p className="text-muted mb-0">Input and manage student grades</p>
        </div>

        <div className="d-flex flex-wrap gap-2 grade-actions">

          <button className="btn btn-light border d-inline-flex align-items-center gap-2 px-3">
            <Plus size={18} />
            Quick Input
          </button>

          <button className="btn btn-light border d-inline-flex align-items-center gap-2 px-3">
            <Download size={18} />
            Export
          </button>

          <button
            onClick={handleSave}
            className="btn btn-success d-inline-flex align-items-center gap-2 px-3"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Filters */}
      <GradesFilters
        courses={courses}
        courseId={courseId}
        setCourseId={(v) => {
          setCourseId(v);
          setSearch(""); // ✅ optional: clears search when switching course
        }}
        search={search}
        setSearch={setSearch}
      />

      {/* Stats */}
      <GradesStats stats={stats} />

      {/* Table */}
      <GradesTable title={courseTitle} rows={filtered} onChangeScore={onChangeScore} />
    </div>
  );
}
