// ✅ src/pages/DepartmentHead/DepartmentHeadFaculty.tsx

import { useMemo, useState } from "react";
import {
  Users,
  Clock3,
  BookOpen,
  Download,
} from "lucide-react";

import FacultyStats, {
  type FacultyStatItem,
} from "../../components/DepartmentHead/Faculty/FacultyStats";

import FacultySearch from "../../components/DepartmentHead/Faculty/FacultySearch";

import FacultyCard, {
  type FacultyRow,
} from "../../components/DepartmentHead/Faculty/FacultyCard";

import "../../styles/department-headFaculty.css";

export default function DepartmentHeadFaculty() {
  /* =========================================================
     SEARCH / FILTER STATE
     ========================================================= */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  /* =========================================================
     FACULTY STATISTICS
     ========================================================= */

  const stats = useMemo<FacultyStatItem[]>(
    () => [
      {
        label: "Total Faculty",
        value: 5,
        icon: Users,
      },
      {
        label: "Total Units Assigned",
        value: 96,
        icon: Clock3,
      },
      {
        label: "Available for Load",
        value: 3,
        icon: BookOpen,
      },
      {
        label: "Overloaded",
        value: 1,
        icon: Clock3,
      },
    ],
    []
  );

  /* =========================================================
     FACULTY DATA
     ========================================================= */

  const faculty = useMemo<FacultyRow[]>(
    () => [
      {
        id: 1,
        initials: "JS",
        name: "Dr. John Smith",
        position: "Professor",
        specialization: "Programming",
        email: "j.smith@campus.edu",
        subjects: ["CSPC 101", "CSPC 201"],
        currentLoad: 18,
        maxLoad: 21,
        status: "Available",
      },
      {
        id: 2,
        initials: "MG",
        name: "Prof. Maria Garcia",
        position: "Associate Professor",
        specialization: "Web Systems",
        email: "m.garcia@campus.edu",
        subjects: ["ITPC 202", "ITPC 210"],
        currentLoad: 21,
        maxLoad: 21,
        status: "Full Load",
      },
      {
        id: 3,
        initials: "RL",
        name: "Dr. Robert Lee",
        position: "Professor",
        specialization: "Databases",
        email: "r.lee@campus.edu",
        subjects: ["ITDB 301", "ITDB 302"],
        currentLoad: 24,
        maxLoad: 21,
        status: "Overloaded",
      },
      {
        id: 4,
        initials: "AS",
        name: "Dr. Anna Santos",
        position: "Assistant Professor",
        specialization: "Networking",
        email: "a.santos@campus.edu",
        subjects: ["ITNT 201", "ITNT 202"],
        currentLoad: 15,
        maxLoad: 21,
        status: "Available",
      },
      {
        id: 5,
        initials: "SC",
        name: "Prof. Sarah Chen",
        position: "Assistant Professor",
        specialization: "Software Engineering",
        email: "s.chen@campus.edu",
        subjects: ["CSPC 305", "CSPC 310"],
        currentLoad: 18,
        maxLoad: 21,
        status: "Available",
      },
    ],
    []
  );

  /* =========================================================
     FILTERED FACULTY
     ========================================================= */

  const filteredFaculty = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return faculty.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.specialization.toLowerCase().includes(keyword) ||
        item.position.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.subjects.some((subject) =>
          subject.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [faculty, search, status]);

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handleGenerateReport = () => {
    console.log("Generate faculty load report");
  };

  const handleViewFaculty = (faculty: FacultyRow) => {
    console.log("View faculty:", faculty);
  };

  return (
    <div className="container-fluid py-3 py-md-4 faculty-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="faculty-page-header mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Faculty Management
          </h1>

          <p className="text-muted mb-0">
            Monitor teaching loads and faculty assignments
          </p>
        </div>

        <button
          type="button"
          className="btn faculty-report-btn"
          onClick={handleGenerateReport}
        >
          <Download size={19} />

          <span>Generate Load Report</span>
        </button>
      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <FacultyStats items={stats} />

      {/* =====================================================
          SEARCH / FILTER
          ===================================================== */}

      <div className="faculty-filter-card mb-4">
        <FacultySearch
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />
      </div>

      {/* =====================================================
          FACULTY LIST
          ===================================================== */}

      <div className="faculty-list">
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((item) => (
            <FacultyCard
              key={item.id}
              faculty={item}
              onView={handleViewFaculty}
            />
          ))
        ) : (
          <div className="faculty-empty-state">
            <Users size={42} />

            <h5>No faculty found</h5>

            <p>
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}