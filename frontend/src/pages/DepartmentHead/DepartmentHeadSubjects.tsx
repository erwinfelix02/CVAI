// ✅ src/pages/DepartmentHead/DepartmentHeadSubjects.tsx

import { useMemo, useState } from "react";
import { Plus, BookOpen } from "lucide-react";

import SubjectStats, {
  type SubjectStatItem,
} from "../../components/DepartmentHead/Subjects/SubjectStats";

import SubjectSearch from "../../components/DepartmentHead/Subjects/SubjectSearch";

import SubjectTable, {
  type SubjectRow,
} from "../../components/DepartmentHead/Subjects/SubjectTable";

import "../../styles/department-headSubjects.css";

export default function DepartmentHeadSubjects() {
  /* =========================================================
     SEARCH / FILTER
     ========================================================= */

  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("All Programs");

  /* =========================================================
     SUBJECT DATA
     ========================================================= */

  const subjects = useMemo<SubjectRow[]>(
    () => [
      {
        id: 1,
        code: "CSPC 101",
        name: "Introduction to Programming",
        units: 3,
        year: "1st Year",
        semester: "1st Sem",
        program: "BSCS",
        faculty: "Dr. John Smith",
      },
      {
        id: 2,
        code: "CSPC 201",
        name: "Data Structures & Algorithms",
        units: 3,
        year: "2nd Year",
        semester: "1st Sem",
        program: "BSCS",
        faculty: "Dr. John Smith",
      },
      {
        id: 3,
        code: "CSPC 305",
        name: "Database Systems",
        units: 3,
        year: "3rd Year",
        semester: "1st Sem",
        program: "BSCS",
        faculty: "Dr. Robert Lee",
      },
      {
        id: 4,
        code: "CSPC 401",
        name: "Software Engineering",
        units: 3,
        year: "4th Year",
        semester: "2nd Sem",
        program: "BSCS",
        faculty: "Prof. Sarah Chen",
      },
      {
        id: 5,
        code: "ITPC 202",
        name: "Web Development",
        units: 3,
        year: "2nd Year",
        semester: "2nd Sem",
        program: "BSIT",
        faculty: "Prof. Maria Garcia",
      },
      {
        id: 6,
        code: "ITDB 301",
        name: "Advanced Database Systems",
        units: 3,
        year: "3rd Year",
        semester: "2nd Sem",
        program: "BSIT",
        faculty: "",
      },
    ],
    []
  );

  /* =========================================================
     STATISTICS
     ========================================================= */

  const stats = useMemo<SubjectStatItem[]>(
    () => [
      {
        label: "Total Subjects",
        value: subjects.length,
        icon: BookOpen,
      },
      {
        label: "Total Units",
        value: subjects.reduce(
          (total, subject) => total + subject.units,
          0
        ),
        icon: BookOpen,
      },
      {
        label: "Unassigned",
        value: subjects.filter(
          (subject) => !subject.faculty
        ).length,
        icon: BookOpen,
      },
    ],
    [subjects]
  );

  /* =========================================================
     FILTERED SUBJECTS
     ========================================================= */

  const filteredSubjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        subject.code
          .toLowerCase()
          .includes(keyword) ||
        subject.name
          .toLowerCase()
          .includes(keyword) ||
        subject.faculty
          .toLowerCase()
          .includes(keyword);

      const matchesProgram =
        program === "All Programs" ||
        subject.program === program;

      return matchesSearch && matchesProgram;
    });
  }, [subjects, search, program]);

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handleAddSubject = () => {
    console.log("Add Subject");
  };

  const handleEditSubject = (subject: SubjectRow) => {
    console.log("Edit subject:", subject);
  };

  const handleDeleteSubject = (subject: SubjectRow) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${subject.code} - ${subject.name}?`
    );

    if (!confirmed) return;

    console.log("Delete subject:", subject);
  };

  return (
    <div className="container-fluid py-3 py-md-4 subjects-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="subjects-page-header mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Subject Offerings
          </h1>

          <p className="text-muted mb-0">
            Manage curriculum subjects and faculty assignments
          </p>
        </div>

        <button
          type="button"
          className="btn subjects-add-btn"
          onClick={handleAddSubject}
        >
          <Plus size={20} />

          <span>Add Subject</span>
        </button>
      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <SubjectStats items={stats} />

      {/* =====================================================
          SEARCH / FILTER
          ===================================================== */}

      <div className="subjects-filter-card">
        <SubjectSearch
          search={search}
          onSearchChange={setSearch}
          program={program}
          onProgramChange={setProgram}
        />
      </div>

      {/* =====================================================
          SUBJECT TABLE
          ===================================================== */}

      <div className="subjects-table-wrapper">
        <SubjectTable
          subjects={filteredSubjects}
          onEdit={handleEditSubject}
          onDelete={handleDeleteSubject}
        />
      </div>
    </div>
  );
}