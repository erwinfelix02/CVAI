import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";
import EnrollmentEvaluationModal from "../../components/Registrar/Enrollment/EnrollmentEvaluationModal";
import { getRegistrarByRole } from "../../api/userService";
import EnrolledStudentsCard from "../../components/Registrar/Enrollment/EnrolledStudentsCard";
import SendCredentialsModal from "../../components/Registrar/Enrollment/SendCredentialsModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

import type { StudentItem } from "../../components/Registrar/Enrollment/studentTypes";
import { getStudentsByEnrollmentIds } from "../../api/studentService";

import type { SectionItem } from "../../components/Registrar/Sections/types";
import type { EnrollmentItem } from "../../components/Registrar/Enrollment/types";

import { getSections } from "../../api/sectionService";

import "../../styles/registrar-enrollment.css";

type RegistrarAccount = {
  _id?: string;
  email?: string;
  user?: string;
  role?: string;
};

export default function StudentEnrollmentPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [enrolledQuery, setEnrolledQuery] = useState("");
  const [enrolledLoading, setEnrolledLoading] = useState(true);

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentItem[]>([]);

  const [stats, setStats] = useState<{
    pending: number;
    enrolled: number;
    semesterLabel: string;
  } | null>(null);

  const [settingsSemesterLabel, setSettingsSemesterLabel] =
    useState<string>("—");

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [evalOpen, setEvalOpen] = useState(false);
  const [selected, setSelected] = useState<EnrollmentItem | null>(null);

  const [selectedEnrolledIds, setSelectedEnrolledIds] = useState<string[]>([]);

  const [credOpen, setCredOpen] = useState(false);
  const [credTargets, setCredTargets] = useState<StudentItem[]>([]);
  const [credLoading, setCredLoading] = useState(false);

  const [credEnrollmentIds, setCredEnrollmentIds] = useState<string[]>([]);

  const [registrarAccount, setRegistrarAccount] =
    useState<RegistrarAccount | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const isBusy = loading || enrolledLoading || sectionsLoading || credLoading;

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);

    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;

    const t = setTimeout(() => {
      setAnimateAlert(false);
    }, 3000);

    return () => clearTimeout(t);
  }, [animateAlert]);

  const registrarEmail =
    registrarAccount?.user || registrarAccount?.email || "";

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load enrollment stats", e);
      showAlert("Failed to load enrollment statistics.", "error");
    }
  };

  const fetchRegistrarSettingsSemester = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/registrar/settings");
      const data = await res.json();

      if (!res.ok) {
        setSettingsSemesterLabel("—");
        return;
      }

      setSettingsSemesterLabel(data?.semester || "—");
    } catch (e) {
      console.error(e);
      setSettingsSemesterLabel("—");
      showAlert("Failed to load registrar settings.", "error");
    }
  };

  const fetchRegistrarAccount = async () => {
    try {
      const data = await getRegistrarByRole();
      setRegistrarAccount(data || null);
    } catch (error: any) {
      console.error(
        "Failed to fetch registrar account:",
        error?.message || error,
      );
      setRegistrarAccount(null);
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
      showAlert("Failed to load sections.", "error");
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
      showAlert("Failed to load pending enrollments.", "error");
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
      // Filter out students who already had credentials sent
      const pendingCredentials = list.filter((x) => !x.credentialsSent);
      setEnrolledStudents(pendingCredentials);

      const ids = new Set(pendingCredentials.map((x) => x._id));
      setSelectedEnrolledIds((prev) => prev.filter((id) => ids.has(id)));
    } catch (e) {
      console.error("Failed to load enrolled students", e);
      setEnrolledStudents([]);
      setSelectedEnrolledIds([]);
      showAlert("Failed to load enrolled students.", "error");
    } finally {
      setEnrolledLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRegistrarSettingsSemester();
    fetchRegistrarAccount();
    loadSections();
    loadPending(query);
    loadEnrolled(enrolledQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => fetchRegistrarSettingsSemester();
    window.addEventListener("registrar-settings-updated", handler);
    return () =>
      window.removeEventListener("registrar-settings-updated", handler);
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
      birthDate: string;
      birthdate?: string;
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
          body: JSON.stringify({
            updatedInfo: {
              ...updatedInfo,
              birthdate: updatedInfo.birthDate,
            },
            notes,
            verifiedDocs,
            updatedBy: registrarEmail,
          }),
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

      showAlert("Student enrolled successfully.", "success");
    } catch (e: any) {
      console.error(e);
      showAlert(e?.message || "Failed to submit evaluation.", "error");
    }
  };

  const pendingCount = query.trim()
    ? enrollments.length
    : (stats?.pending ?? enrollments.length);

  const enrolledCount = enrolledQuery.trim()
    ? enrolledStudents.length
    : (stats?.enrolled ?? enrolledStudents.length);

  const toggleSelectEnrolled = (id: string) => {
    setSelectedEnrolledIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllEnrolled = (ids: string[]) => setSelectedEnrolledIds(ids);

  const clearAllEnrolled = () => setSelectedEnrolledIds([]);

  const openCredentialsForSelected = async () => {
    if (selectedEnrolledIds.length === 0) {
      showAlert("Please select at least one enrolled student.", "error");
      return;
    }

    try {
      setCredLoading(true);

      const students = await getStudentsByEnrollmentIds(selectedEnrolledIds);

      if (!students || students.length === 0) {
        showAlert(
          "No student records found for the selected enrollment(s).",
          "error",
        );
        return;
      }

      setCredTargets(students);
      setCredEnrollmentIds(selectedEnrolledIds);
      setCredOpen(true);
    } catch (e: any) {
      console.error(e);
      showAlert(e?.message || "Failed to load student records.", "error");
    } finally {
      setCredLoading(false);
    }
  };

  const openCredentialsForOne = async (enrollmentId: string) => {
    try {
      setCredLoading(true);

      const students = await getStudentsByEnrollmentIds([enrollmentId]);

      if (!students || students.length === 0) {
        showAlert("No student record found for this enrollment.", "error");
        return;
      }

      setCredTargets(students);
      setCredEnrollmentIds([enrollmentId]);
      setCredOpen(true);
    } catch (e: any) {
      console.error(e);
      showAlert(e?.message || "Failed to load student record.", "error");
    } finally {
      setCredLoading(false);
    }
  };

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
        body: JSON.stringify({
          studentIds,
          subject,
          message,
          updatedBy: registrarEmail,
        }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to send credentials.");
    }

    // Automatically remove students whose credentials were sent from the enrolled list
    setEnrolledStudents((prev) =>
      prev.filter((enr) => !credEnrollmentIds.includes(enr._id)),
    );

    setSelectedEnrolledIds((prev) =>
      prev.filter((id) => !credEnrollmentIds.includes(id)),
    );

    await loadEnrolled(enrolledQuery);

    const sent = (data?.results || []).filter(
      (r: any) => r.status === "sent",
    ).length;

    showAlert(`Credentials sent to ${sent} student(s).`, "success");

    return data;
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isBusy}
      />

      <div className="registrar-enrollment-page">
        <div className="mb-3 mb-md-4">
          <h2 className="fw-bold mb-1">Student Enrollment</h2>
          <p className="text-muted mb-0">Evaluate scheduled enrollments</p>
        </div>

        <EnrollmentStats
          pending={pendingCount}
          enrolled={stats?.enrolled ?? 0}
          availableSections={sections.length}
          semesterLabel={settingsSemesterLabel}
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
          onSend={async (args) => {
            try {
              await sendCredentialsApi(args);
              setCredOpen(false);
            } catch (e: any) {
              console.error(e);
              showAlert(e?.message || "Failed to send credentials.", "error");
              throw e;
            }
          }}
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
    </>
  );
}