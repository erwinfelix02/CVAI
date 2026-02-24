import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";
import EnrollmentEvaluationModal from "../../components/Registrar/Enrollment/EnrollmentEvaluationModal";

import type { SectionItem } from "../../components/Registrar/Sections/types";
import { getSections } from "../../api/sectionService";

import "../../styles/registrar-enrollment.css";

/* ================= TYPES ================= */

type EnrollmentItem = {
  _id: string;
  registrationId: string;
  studentName?: string;
  email?: string;

  status: "Scheduled" | "Enrolled" | "Cancelled";

  personal?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthdate?: string;
    guardian?: string;
    guardianPhone?: string;
  };

  academic?: {
    program?: string;
    yearLevel?: string | number;
    department?: string;
  };

  createdAt?: string;
};

/* ================= PAGE ================= */

export default function StudentEnrollmentPage() {
  // ✅ pending search
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ enrolled search (separate filter)
  const [enrolledQuery, setEnrolledQuery] = useState("");
  const [enrolledLoading, setEnrolledLoading] = useState(true);

  // ✅ pending list
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

  // ✅ enrolled list
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentItem[]>([]);

  const [stats, setStats] = useState<{
    pending: number;
    enrolled: number;
    semesterLabel: string;
  } | null>(null);

  // ✅ OFFICIAL SECTIONS FROM DB
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // ✅ EVALUATION MODAL STATE
  const [evalOpen, setEvalOpen] = useState(false);
  const [selected, setSelected] = useState<EnrollmentItem | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load enrollment stats", e);
    }
  };

  // ✅ LOAD OFFICIAL SECTIONS
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
        })
      );

      setSections(mapped);
    } catch (e) {
      console.error("Failed to load sections", e);
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };

  // ✅ LOAD PENDING ENROLLMENTS (Scheduled)
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

  // ✅ LOAD ENROLLED STUDENTS (Enrolled)
  const loadEnrolled = async (search: string) => {
    try {
      setEnrolledLoading(true);

      const url = new URL("http://localhost:5000/api/enrollments");
      url.searchParams.set("status", "Enrolled");
      if (search.trim()) url.searchParams.set("q", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();

      setEnrolledStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load enrolled students", e);
      setEnrolledStudents([]);
    } finally {
      setEnrolledLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    loadSections();
    loadPending(query);
    loadEnrolled(enrolledQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pending filter
  useEffect(() => {
    loadPending(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // enrolled filter
  useEffect(() => {
    loadEnrolled(enrolledQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledQuery]);

  // ✅ Evaluate click
  const onEvaluate = (item: EnrollmentItem) => {
    setSelected(item);
    setEvalOpen(true);
  };

  // ✅ Final submit (called by modal)
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
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to submit evaluation.");
      }

      // close modal
      setEvalOpen(false);
      setSelected(null);

      // refresh everything
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

  // show filtered count during search, otherwise show real DB count
  const pendingCount = query.trim()
    ? enrollments.length
    : stats?.pending ?? enrollments.length;

  const enrolledCount = enrolledQuery.trim()
    ? enrolledStudents.length
    : stats?.enrolled ?? enrolledStudents.length;

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
        semesterLabel={stats?.semesterLabel ?? "—"}
      />

      {/* ✅ Pending Search */}
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

      {/* ✅ Pending List */}
      <div className="mt-3">
        <PendingEnrollmentList
          loading={loading}
          items={enrollments}
          titleCount={pendingCount}
          onEvaluate={onEvaluate}
        />
      </div>

      {/* ✅ ENROLLED CARD (UNDER PENDING) */}
      <div className="card shadow-sm enroll-card mt-3 mt-md-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h5 className="fw-bold mb-0">Enrolled Students ({enrolledCount})</h5>
          </div>

          {/* ✅ filter for enrolled list */}
          <div className="enroll-searchbar">
            <Search size={18} className="enroll-search-icon" />
            <input
              type="text"
              className="enroll-search-input"
              placeholder="Filter enrolled students by name or ID..."
              value={enrolledQuery}
              onChange={(e) => setEnrolledQuery(e.target.value)}
            />
          </div>

          <div className="mt-3">
            <EnrolledStudentsList loading={enrolledLoading} items={enrolledStudents} />
          </div>
        </div>
      </div>

      {/* ✅ capacity grid still uses OFFICIAL DB sections */}
      <div className="mt-3 mt-md-4">
        <SectionCapacityGrid loading={sectionsLoading} sections={sections} />
      </div>

      {/* ✅ EVALUATION MODAL */}
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

/* ================= ENROLLED LIST (simple) ================= */

function EnrolledStudentsList({
  items,
  loading,
}: {
  items: EnrollmentItem[];
  loading: boolean;
}) {
  return (
    <div className="d-flex flex-column gap-3">
      {loading ? (
        <div className="text-muted text-center py-4">Loading...</div>
      ) : (
        <>
          {items.map((s) => {
            const fullName =
              s.studentName ||
              `${s.personal?.firstName ?? ""} ${s.personal?.lastName ?? ""}`.trim() ||
              "Unknown Student";

            const initials = fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((x) => x[0]?.toUpperCase())
              .join("");

            const program = s.academic?.program?.trim();
            const yearLevel = s.academic?.yearLevel?.toString().trim();

            const programLine =
              program && yearLevel
                ? `${program} • Year ${yearLevel}`
                : program
                ? program
                : "";

            return (
              <div key={s._id} className="enroll-student-row">
                <div className="d-flex align-items-center gap-3">
                  <div className="enroll-avatar">{initials}</div>

                  <div className="min-w-0">
                    <div className="fw-semibold">{fullName}</div>
                    <div className="text-muted small">{s.registrationId}</div>
                    {programLine ? (
                      <div className="text-muted small">{programLine}</div>
                    ) : null}
                  </div>
                </div>

                <span className="badge rounded-pill bg-success-subtle text-success border">
                  Enrolled
                </span>
              </div>
            );
          })}

          {items.length === 0 ? (
            <div className="text-muted text-center py-4">
              No enrolled students found.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}