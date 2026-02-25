import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";
import EnrollmentEvaluationModal from "../../components/Registrar/Enrollment/EnrollmentEvaluationModal";

import EnrolledStudentsCard from "../../components/Registrar/Enrollment/EnrolledStudentsCard";
import SendCredentialsModal from "../../components/Registrar/Enrollment/SendCredentialsModal";

import type { StudentItem } from "../../components/Registrar/Enrollment/studentTypes";
import { getStudentsByEnrollmentIds } from "../../api/studentService";

import type { SectionItem } from "../../components/Registrar/Sections/types";
import type { EnrollmentItem } from "../../components/Registrar/Enrollment/types";

import { getSections } from "../../api/sectionService";

import "../../styles/registrar-enrollment.css";

export default function StudentEnrollmentPage() {
  // ✅ pending search
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ enrolled search
  const [enrolledQuery, setEnrolledQuery] = useState("");
  const [enrolledLoading, setEnrolledLoading] = useState(true);

  // ✅ data
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentItem[]>(
    [],
  );

  // ✅ stats (keep for counts)
  const [stats, setStats] = useState<{
    pending: number;
    enrolled: number;
    semesterLabel: string;
  } | null>(null);

  // ✅ registrar settings semester label (NEW)
  const [settingsSemesterLabel, setSettingsSemesterLabel] =
    useState<string>("—");

  // ✅ sections
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // ✅ evaluation modal
  const [evalOpen, setEvalOpen] = useState(false);
  const [selected, setSelected] = useState<EnrollmentItem | null>(null);

  // ✅ enrolled selection (bulk)
  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState<string[]>([]);

  // ✅ credentials modal (Student table)
  const [credOpen, setCredOpen] = useState(false);
  const [credTargets, setCredTargets] = useState<StudentItem[]>([]);
  const [credLoading, setCredLoading] = useState(false);

  // ✅ store enrollment ids used in modal so we can update UI
  const [credEnrollmentIds, setCredEnrollmentIds] = useState<string[]>([]);

  /* ================= API LOADERS ================= */

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load enrollment stats", e);
    }
  };

  // ✅ NEW: fetch semester label from registrar settings
const fetchRegistrarSettingsSemester = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/registrar/settings");
    const data = await res.json();

    if (!res.ok) {
      setSettingsSemesterLabel("—");
      return;
    }

    // ✅ ONLY semester
    setSettingsSemesterLabel(data?.semester || "—");
  } catch (e) {
    console.error(e);
    setSettingsSemesterLabel("—");
  }
};

  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      const data = await getSections();

      const mapped: SectionItem[] = (Array.isArray(data) ? data : []).map(
        (s: any) => ({
          id: s._id,
          code: s.code,
          yearLevel: s.yearLevel,
          program: s.program,
          adviser: s.adviser ?? "TBA",
          room: s.room,
          schedule: s.schedule,
          enrolled: s.enrolled ?? 0,
          capacity: s.capacity ?? 0,
        }),
      );

      setSections(mapped);
    } catch (e) {
      console.error("Failed to load sections", e);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  const loadPending = async (search: string) => {
    try {
      setLoading(true);

      const url = new URL("http://localhost:5000/api/enrollments");
      url.searchParams.set("status", "Scheduled");
      if (search.trim()) url.searchParams.set("q", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();

      setEnrollments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load pending enrollments", e);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolled = async (search: string) => {
    try {
      setEnrolledLoading(true);

      const url = new URL("http://localhost:5000/api/enrollments");
      url.searchParams.set("status", "Enrolled");
      if (search.trim()) url.searchParams.set("q", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();

      const list: EnrollmentItem[] = Array.isArray(data) ? data : [];
      setEnrolledStudents(list);

      // ✅ keep selections valid
      const ids = new Set(list.map((x) => x._id));
      setSelectedEnrolledIds((prev) => prev.filter((id) => ids.has(id)));
    } catch (e) {
      console.error("Failed to load enrolled students", e);
      setEnrolledStudents([]);
      setSelectedEnrolledIds([]);
    } finally {
      setEnrolledLoading(false);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchStats();
    fetchRegistrarSettingsSemester(); // ✅ NEW
    loadSections();
    loadPending(query);
    loadEnrolled(enrolledQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Optional: auto-update semester label when settings page saves
  useEffect(() => {
    const handler = () => fetchRegistrarSettingsSemester();
    window.addEventListener("registrar-settings-updated", handler);
    return () => window.removeEventListener("registrar-settings-updated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPending(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    loadEnrolled(enrolledQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledQuery]);

  /* ================= ACTIONS ================= */

  const onEvaluate = (item: EnrollmentItem) => {
    setSelected(item);
    setEvalOpen(true);
  };

  const handleEnroll = async ({
    enrollmentId,
    updatedInfo,
    notes,
    verifiedDocs,
  }: {
    enrollmentId: string;
    updatedInfo: {
      fullName: string;
      studentId: string;
      email: string;
      phone: string;
      address: string;
      birthdate: string;
      guardian: string;
      guardianPhone: string;
      program: string;
      yearLevel: string;
      department: string;
    };
    notes: string;
    verifiedDocs: string[];
  }) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/enrollment/${enrollmentId}/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updatedInfo, notes, verifiedDocs }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to submit evaluation.");
      }

      setEvalOpen(false);
      setSelected(null);

      await Promise.all([
        loadPending(query),
        loadEnrolled(enrolledQuery),
        loadSections(),
        fetchStats(),
      ]);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to submit evaluation.");
    }
  };

  /* ================= COUNTS ================= */

  const pendingCount = query.trim()
    ? enrollments.length
    : (stats?.pending ?? enrollments.length);

  const enrolledCount = enrolledQuery.trim()
    ? enrolledStudents.length
    : (stats?.enrolled ?? enrolledStudents.length);

  /* ================= SELECTION HELPERS ================= */

  const toggleSelectEnrolled = (id: string) => {
    setSelectedEnrolledIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllEnrolled = (ids: string[]) => setSelectedEnrolledIds(ids);

  const clearAllEnrolled = () => setSelectedEnrolledIds([]);

  /* ================= CREDENTIALS MODAL FLOW ================= */

  const openCredentialsForSelected = async () => {
    if (selectedEnrolledIds.length === 0) return;

    try {
      setCredLoading(true);

      const students = await getStudentsByEnrollmentIds(selectedEnrolledIds);

      if (!students || students.length === 0) {
        alert("No Student records found for the selected enrollment(s).");
        return;
      }

      setCredTargets(students);
      setCredEnrollmentIds(selectedEnrolledIds);
      setCredOpen(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load student records.");
    } finally {
      setCredLoading(false);
    }
  };

  const openCredentialsForOne = async (enrollmentId: string) => {
    try {
      setCredLoading(true);

      const students = await getStudentsByEnrollmentIds([enrollmentId]);

      if (!students || students.length === 0) {
        alert("No Student record found for this enrollment.");
        return;
      }

      setCredTargets(students);
      setCredEnrollmentIds([enrollmentId]);
      setCredOpen(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load student record.");
    } finally {
      setCredLoading(false);
    }
  };

  /* ================= SEND CREDENTIALS ================= */

  const sendCredentialsApi = async ({
    studentIds,
    subject,
    message,
  }: {
    studentIds: string[];
    subject?: string;
    message?: string;
  }) => {
    const res = await fetch(
      "http://localhost:5000/api/accounts/send-credentials",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds, subject, message }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to send credentials.");
    }

    const sentStudentIds: string[] = Array.isArray(data?.sentStudentIds)
      ? data.sentStudentIds
      : [];

    if (sentStudentIds.length > 0) {
      setEnrolledStudents((prev) =>
        prev.map((enr) =>
          credEnrollmentIds.includes(enr._id)
            ? { ...enr, credentialsSent: true }
            : enr,
        ),
      );

      setSelectedEnrolledIds((prev) =>
        prev.filter((id) => !credEnrollmentIds.includes(id)),
      );
    }

    await loadEnrolled(enrolledQuery);

    const sent = (data?.results || []).filter(
      (r: any) => r.status === "sent",
    ).length;
    alert(`Done! Sent credentials to ${sent} student(s).`);

    return data;
  };

  /* ================= RENDER ================= */

  return (
    <div className="registrar-enrollment container-fluid px-3 px-md-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Student Enrollment</h2>
        <p className="text-muted mb-0">Evaluate scheduled enrollments</p>
      </div>

      <EnrollmentStats
        pending={pendingCount}
        enrolled={stats?.enrolled ?? 0}
        availableSections={sections.length}
        semesterLabel={settingsSemesterLabel} // ✅ FROM REGISTRAR SETTINGS
      />

      <div className="card shadow-sm enroll-card mt-3 mt-md-4">
        <div className="card-body">
          <div className="enroll-searchbar">
            <Search size={18} className="enroll-search-icon" />
            <input
              type="text"
              className="enroll-search-input"
              placeholder="Search pending students by name or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <PendingEnrollmentList
          loading={loading}
          items={enrollments}
          titleCount={pendingCount}
          onEvaluate={onEvaluate}
        />
      </div>

      <EnrolledStudentsCard
        enrolledCount={enrolledCount}
        enrolledQuery={enrolledQuery}
        setEnrolledQuery={setEnrolledQuery}
        loading={enrolledLoading || credLoading}
        items={enrolledStudents}
        selectedIds={selectedEnrolledIds}
        onToggleSelect={toggleSelectEnrolled}
        onSelectAll={selectAllEnrolled}
        onClearAll={clearAllEnrolled}
        onSendCredentials={openCredentialsForSelected}
        onSendCredentialsOne={openCredentialsForOne}
      />

      <SendCredentialsModal
        open={credOpen}
        onClose={() => setCredOpen(false)}
        students={credTargets}
        onSend={sendCredentialsApi}
      />

      <div className="mt-3 mt-md-4">
        <SectionCapacityGrid loading={sectionsLoading} sections={sections} />
      </div>

      <EnrollmentEvaluationModal
        open={evalOpen}
        onClose={() => {
          setEvalOpen(false);
          setSelected(null);
        }}
        student={selected}
        sections={sections}
        loading={loading || sectionsLoading}
        onEnroll={handleEnroll}
      />
    </div>
  );
}