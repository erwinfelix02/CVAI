import { useMemo, useState, useEffect } from "react";
import AttendanceHeader from "../../components/Faculty/Attendance/AttendanceHeader";
import AttendanceFilters from "../../components/Faculty/Attendance/AttendanceFilters";
import AttendanceStats from "../../components/Faculty/Attendance/AttendanceStats";
import AttendanceList from "../../components/Faculty/Attendance/AttendanceList";
import AttendanceModal from "../../components/Faculty/Attendance/AttendanceModal";
import ExportAttendanceModal from "../../components/Faculty/Attendance/ExportAttendanceModal";
import type { ModalStudent } from "../../components/Faculty/Attendance/AttendanceModal";
import { UserX } from "lucide-react";
import "../../styles/faculty-attendance.css";

export type AttendanceStatus = "present" | "absent" | "late" | "pending";

export type StudentItem = {
  id: string;
  name: string;
  studentNo: string;
  status: AttendanceStatus;
};

export type AttendanceRecord = {
  subject: string;
  date: string;
  isRecorded: boolean;
  students: StudentItem[];
};

export type SubjectOption = {
  value: string;
  label: string;
};

const todayStr = new Date().toISOString().split("T")[0];

const courseRosters: Record<string, StudentItem[]> = {
  CS201: [
    { id: "s1", name: "Maria Santos", studentNo: "2024-00123", status: "pending" },
    { id: "s2", name: "Juan Dela Cruz", studentNo: "2024-00124", status: "pending" },
    { id: "s3", name: "Ana Reyes", studentNo: "2024-00125", status: "pending" },
    { id: "s4", name: "Pedro Garcia", studentNo: "2024-00126", status: "pending" },
    { id: "s5", name: "Elena Cruz", studentNo: "2024-00127", status: "pending" },
    { id: "s6", name: "Carlos Mendoza", studentNo: "2024-00128", status: "pending" },
  ],
  CS101: [
    { id: "s1", name: "Maria Santos", studentNo: "2024-00123", status: "pending" },
    { id: "s2", name: "Juan Dela Cruz", studentNo: "2024-00124", status: "pending" },
  ],
};

export default function AttendanceTrackingPage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr);
  const [query, setQuery] = useState<string>("");
  const [database, setDatabase] = useState<AttendanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userDepartment = storedUser?.department || "";
  const facultyName = storedUser?.name || "";

  useEffect(() => {
    const fetchAssignedCourses = async () => {
      setIsLoadingSchedules(true);
      try {
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams({
          department: userDepartment,
          faculty: facultyName,
        }).toString();

        const response = await fetch(`/api/schedules?${queryParams}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const rawSchedules = await response.json();
          const courseMap = new Map<string, string>();
          (Array.isArray(rawSchedules) ? rawSchedules : []).forEach(
            (sch: any) => {
              if (sch.code && !courseMap.has(sch.code)) {
                courseMap.set(
                  sch.code,
                  `${sch.code} - ${sch.title || "Assigned Course"}`,
                );
              }
            },
          );

          const fetchedSubjects: SubjectOption[] = Array.from(
            courseMap.entries(),
          ).map(([value, label]) => ({ value, label }));

          if (fetchedSubjects.length > 0) {
            setSubjects(fetchedSubjects);
            setSubject(fetchedSubjects[0].value);
          } else {
            const defaultSubjects = [
              { value: "CS201", label: "CS 201 - Data Structures" },
              { value: "CS101", label: "CS 101 - Intro to Programming" },
            ];
            setSubjects(defaultSubjects);
            setSubject("CS201");
          }
        } else {
          throw new Error("Failed to load schedules");
        }
      } catch (err) {
        console.error("Error fetching assigned courses:", err);
        const defaultSubjects = [
          { value: "CS201", label: "CS 201 - Data Structures" },
          { value: "CS101", label: "CS 101 - Intro to Programming" },
        ];
        setSubjects(defaultSubjects);
        setSubject("CS201");
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchAssignedCourses();
  }, [userDepartment, facultyName]);

  const activeRecord = useMemo(() => {
    if (!subject || !date) return null;
    return (
      database.find((rec) => rec.subject === subject && rec.date === date) ??
      null
    );
  }, [database, subject, date]);

  const isRecorded = useMemo(() => {
    return activeRecord?.isRecorded ?? false;
  }, [activeRecord]);

  const currentStudents = useMemo(() => {
    if (activeRecord) return activeRecord.students;
    return courseRosters[subject] || [];
  }, [activeRecord, subject]);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currentStudents;
    return currentStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q),
    );
  }, [currentStudents, query]);

  const stats = useMemo(() => {
    const total = currentStudents.length;
    const present = currentStudents.filter(
      (s) => s.status === "present",
    ).length;
    const absent = currentStudents.filter((s) => s.status === "absent").length;
    const pending = currentStudents.filter(
      (s) => s.status === "pending" || s.status === "late",
    ).length;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pending, percent };
  }, [currentStudents]);

  function setStatus(id: string, status: "present" | "absent") {
    if (!subject || !date || isRecorded) return;

    setDatabase((prev) => {
      const recordIndex = prev.findIndex(
        (rec) => rec.subject === subject && rec.date === date,
      );

      if (recordIndex >= 0) {
        return prev.map((rec, index) => {
          if (index === recordIndex) {
            return {
              ...rec,
              students: rec.students.map((s) =>
                s.id === id ? { ...s, status } : s,
              ),
            };
          }
          return rec;
        });
      } else {
        const baseRoster = courseRosters[subject] || [];
        const updatedStudents = baseRoster.map((s) =>
          s.id === id ? { ...s, status } : s,
        );
        return [
          ...prev,
          { subject, date, isRecorded: false, students: updatedStudents },
        ];
      }
    });
  }

  function handleSaveFromModal(
    newSubject: string,
    newDate: string,
    updatedRecords: ModalStudent[],
  ) {
    setSubject(newSubject);
    setDate(newDate);

    setDatabase((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.subject === newSubject && r.date === newDate,
      );
      const updatedList: StudentItem[] = updatedRecords.map((r) => ({
        id: r.id,
        name: r.name,
        studentNo: r.studentNo,
        status: (r.status as AttendanceStatus) || "pending",
      }));

      if (existingIdx >= 0) {
        return prev.map((rec, idx) =>
          idx === existingIdx
            ? { ...rec, isRecorded: true, students: updatedList }
            : rec,
        );
      } else {
        return [
          ...prev,
          {
            subject: newSubject,
            date: newDate,
            isRecorded: true,
            students: updatedList,
          },
        ];
      }
    });

    setIsModalOpen(false);
  }

  const formattedDateLabel = useMemo(() => {
    if (!date) return "";
    const parsedDate = new Date(date + "T00:00:00");
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  return (
    <div className="container-fluid py-4 faculty-att-page">
      <AttendanceHeader
        title="Attendance Tracking"
        subtitle={`Record and manage student attendance ${
          facultyName ? `for ${facultyName}` : ""
        }`}
        onNewRecord={() => setIsModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
      />

      {isLoadingSchedules ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading assigned courses...</span>
          </div>
        </div>
      ) : (
        <>
          <AttendanceFilters
            subject={subject}
            subjects={subjects}
            onSubjectChange={setSubject}
            date={date}
            onDateChange={setDate}
            query={query}
            onQueryChange={setQuery}
          />

          <AttendanceStats
            total={stats.total}
            present={stats.present}
            absent={stats.absent}
            pending={stats.pending}
          />

          {currentStudents.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-3 bg-white">
              <UserX size={48} className="text-muted mx-auto mb-3 opacity-50" />
              <h5 className="fw-bold text-dark mb-1">No Students Enrolled</h5>
              <p className="text-muted mb-0">
                There are currently no students assigned to course{" "}
                <strong>{subject}</strong>.
              </p>
            </div>
          ) : (
            <AttendanceList
              subjectSelected={Boolean(subject)}
              dateSelected={Boolean(date)}
              subjectLabel={
                subjects.find((s) => s.value === subject)?.label ?? ""
              }
              dateLabel={formattedDateLabel}
              presentSummary={`${stats.present}/${stats.total} Present (${stats.percent}%)`}
              students={filteredStudents}
              isRecorded={isRecorded}
              onSetPresent={(id) => setStatus(id, "present")}
              onSetAbsent={(id) => setStatus(id, "absent")}
              onOpenModal={() => setIsModalOpen(true)}
            />
          )}
        </>
      )}

      {/* NEW RECORD MODAL */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subjects={subjects}
        initialSubject={subject}
        initialDate={date}
        courseRosters={courseRosters}
        onSave={handleSaveFromModal}
      />

      {/* EXPORT ATTENDANCE MODAL */}
     <ExportAttendanceModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  subjects={subjects}
  currentSubject={subject}
  currentDate={date}
/>
    </div>
  );
}