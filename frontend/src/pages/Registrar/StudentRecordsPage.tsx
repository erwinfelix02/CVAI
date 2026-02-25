import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import RecordsHeader from "../../components/Registrar/Records/RecordsHeader";
import RecordsStats from "../../components/Registrar/Records/RecordsStats";
import RecordsFilters from "../../components/Registrar/Records/RecordsFilters";
import StudentsTable from "../../components/Registrar/Records/StudentsTable";

import type { StudentRow, StudentStatus } from "../../components/Registrar/Records/types";

import { getStudentUsers } from "../../api/userService";

import "../../styles/registrar-records.css";

export default function StudentRecordsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StudentStatus | "All">("All");
  const [course, setCourse] = useState<string | "All">("All");

  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch students
  const load = async () => {
    try {
      setLoading(true);
      const data = await getStudentUsers({
        q: query.trim(),
        status,
        course,
      });
      setRows(data);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      alert(e?.message || "Failed to load student records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, course]);

  // ✅ courses dropdown (from fetched rows)
  const courses = useMemo(() => {
    const set = new Set(rows.map((s) => s.course).filter(Boolean));
    return ["All", ...Array.from(set)] as const;
  }, [rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((s) => s.status === "Active").length;
    const dropped = rows.filter((s) => s.status === "Dropped").length;
    const graduated = rows.filter((s) => s.status === "Graduated").length;
    return { total, active, dropped, graduated };
  }, [rows]);

  return (
    <div className="registrar-records">
      <RecordsHeader
        title="Student Records"
        subtitle="Manage and view all enrolled students"
        actionLabel={loading ? "Loading..." : "Export Records"}
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
        title={`Students (${rows.length})`}
        rows={rows}
        onRowAction={(id) => alert(`Action for ${id}`)}
      />
    </div>
  );
}