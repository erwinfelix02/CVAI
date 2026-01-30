import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import RecordsHeader from "../../components/Registrar/Records/RecordsHeader";
import RecordsStats from "../../components/Registrar/Records/RecordsStats";
import RecordsFilters from "../../components/Registrar/Records/RecordsFilters";
import StudentsTable from "../../components/Registrar/Records/StudentsTable";

import type { StudentRow, StudentStatus } from "../../components/Registrar/Records/types";

import "../../styles/registrar-records.css";

const seed: StudentRow[] = [
  {
    id: "2024-00001",
    initials: "MS",
    name: "Maria Santos",
    email: "maria.santos@campus.edu",
    course: "BS Computer Science",
    section: "BSCS-1A",
    year: 1,
    status: "Active",
  },
  {
    id: "2024-00002",
    initials: "JDC",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@campus.edu",
    course: "BS Information Technology",
    section: "BSIT-2A",
    year: 2,
    status: "Active",
  },
  {
    id: "2023-00045",
    initials: "AR",
    name: "Ana Reyes",
    email: "ana.reyes@campus.edu",
    course: "BS Civil Engineering",
    section: "BSCE-3A",
    year: 3,
    status: "Active",
  },
  {
    id: "2022-00123",
    initials: "CG",
    name: "Carlos Garcia",
    email: "carlos.garcia@campus.edu",
    course: "BS Business Admin",
    section: "BSBA-4A",
    year: 4,
    status: "Active",
  },
  {
    id: "2021-00101",
    initials: "EC",
    name: "Elena Cruz",
    email: "elena.cruz@campus.edu",
    course: "BS Nursing",
    section: "BSN-4B",
    year: 4,
    status: "Dropped",
  },
];

export default function StudentRecordsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StudentStatus | "All">("All");
  const [course, setCourse] = useState<string | "All">("All");

  const courses = useMemo(() => {
    const set = new Set(seed.map((s) => s.course));
    return ["All", ...Array.from(set)] as const;
  }, []);

  const stats = useMemo(() => {
    const total = seed.length;
    const active = seed.filter((s) => s.status === "Active").length;
    const dropped = seed.filter((s) => s.status === "Dropped").length;
    const graduated = seed.filter((s) => s.status === "Graduated").length;
    return { total, active, dropped, graduated };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return seed.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);

      const matchesStatus = status === "All" ? true : s.status === status;
      const matchesCourse = course === "All" ? true : s.course === course;

      return matchesQuery && matchesStatus && matchesCourse;
    });
  }, [query, status, course]);

  return (
    <div className="registrar-records">
      <RecordsHeader
        title="Student Records"
        subtitle="Manage and view all enrolled students"
        actionLabel="Export Records"
        actionIcon={Download}
        onAction={() => alert("Export (demo)")}
      />

      <RecordsStats stats={stats} />

      <RecordsFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        course={course}
        setCourse={setCourse}
        courses={courses as unknown as string[]}
      />

      <StudentsTable
        title={`Students (${filtered.length})`}
        rows={filtered}
        onRowAction={(id) => alert(`Action for ${id}`)}
      />
    </div>
  );
}
