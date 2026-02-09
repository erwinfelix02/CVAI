import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import SectionStatsRow from "../../components/Registrar/Sections/SectionStatsRow";
import SectionsToolbar from "../../components/Registrar/Sections/SectionsToolbar";
import SectionsGrid from "../../components/Registrar/Sections/SectionsGrid";

import type { SectionItem } from "../../components/Registrar/Sections/types";

import "../../styles/registrar-sections.css";

export default function SectionsManagementPage() {
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("All Courses");

  const sections = useMemo<SectionItem[]>(
    () => [
      {
        id: "bscs-1a",
        code: "BSCS-1A",
        program: "BS Computer Science",
        adviser: "Dr. Maria Garcia",
        room: "Room 301",
        schedule: "MWF 8:00-9:30 AM",
        enrolled: 35,
        capacity: 40,
      },
      {
        id: "bscs-1b",
        code: "BSCS-1B",
        program: "BS Computer Science",
        adviser: "Prof. Juan Santos",
        room: "Room 302",
        schedule: "MWF 10:00-11:30 AM",
        enrolled: 38,
        capacity: 40,
      },
      {
        id: "bscs-2a",
        code: "BSCS-2A",
        program: "BS Computer Science",
        adviser: "Dr. Ana Cruz",
        room: "Room 401",
        schedule: "TTH 8:00-9:30 AM",
        enrolled: 32,
        capacity: 40,
      },
      {
        id: "bsit-1a",
        code: "BSIT-1A",
        program: "BS Information Technology",
        adviser: "Dr. Ana Cruz",
        room: "Room 201",
        schedule: "MWF 1:00-2:30 PM",
        enrolled: 40,
        capacity: 45,
      },
      {
        id: "bsit-2a",
        code: "BSIT-2A",
        program: "BS Information Technology",
        adviser: "Prof. Mark Reyes",
        room: "Room 205",
        schedule: "TTH 10:00-11:30 AM",
        enrolled: 42,
        capacity: 45,
      },
      {
        id: "bsce-1a",
        code: "BSCE-1A",
        program: "BS Civil Engineering",
        adviser: "Engr. Carlos Reyes",
        room: "Room 110",
        schedule: "MWF 3:00-4:30 PM",
        enrolled: 30,
        capacity: 35,
      },
    ],
    []
  );

  const courseOptions = useMemo(() => {
    const unique = Array.from(new Set(sections.map((s) => s.program)));
    return ["All Courses", ...unique];
  }, [sections]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return sections.filter((s) => {
      const matchCourse =
        courseFilter === "All Courses" ? true : s.program === courseFilter;

      const matchQuery =
        query.length === 0
          ? true
          : `${s.code} ${s.program} ${s.adviser}`
              .toLowerCase()
              .includes(query);

      return matchCourse && matchQuery;
    });
  }, [sections, q, courseFilter]);

  const totals = useMemo(() => {
    const totalSections = sections.length;
    const totalEnrolled = sections.reduce((a, s) => a + s.enrolled, 0);
    const totalCapacity = sections.reduce((a, s) => a + s.capacity, 0);
    const utilization =
      totalCapacity === 0 ? 0 : Math.round((totalEnrolled / totalCapacity) * 100);

    return { totalSections, totalEnrolled, totalCapacity, utilization };
  }, [sections]);

  const onAddSection = () => {
    // hook this to your modal / route
    alert("Add Section clicked (connect to your modal)");
  };

  return (
    <div className="registrar-sections-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-3 mb-3 mb-md-4">
        <div>
          <h2 className="fw-bold mb-1">Sections Management</h2>
          <p className="text-muted mb-0">Create and manage class sections</p>
        </div>

        <button className="btn btn-primary btn-lg sections-add-btn" onClick={onAddSection}>
          <Plus size={18} />
          <span className="ms-2">Add Section</span>
        </button>
      </div>

      {/* Stats */}
      <SectionStatsRow
        totalSections={totals.totalSections}
        totalEnrolled={totals.totalEnrolled}
        totalCapacity={totals.totalCapacity}
        utilization={totals.utilization}
      />

      {/* Toolbar */}
      <SectionsToolbar
        query={q}
        onQueryChange={setQ}
        course={courseFilter}
        onCourseChange={setCourseFilter}
        courseOptions={courseOptions}
      />

      {/* Cards grid */}
      <SectionsGrid items={filtered} />
    </div>
  );
}
