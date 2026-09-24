import { useMemo, useState, useEffect, useCallback } from "react";
import AttendanceHeader from "../../components/Faculty/Attendance/AttendanceHeader";
import AttendanceFilters from "../../components/Faculty/Attendance/AttendanceFilters";
import AttendanceStats from "../../components/Faculty/Attendance/AttendanceStats";
import AttendanceList from "../../components/Faculty/Attendance/AttendanceList";
import AttendanceModal from "../../components/Faculty/Attendance/AttendanceModal";
import ExportAttendanceModal from "../../components/Faculty/Attendance/ExportAttendanceModal";
import type { ModalStudent } from "../../components/Faculty/Attendance/AttendanceModal";
import { UserX, CalendarX } from "lucide-react";
import "../../styles/faculty-attendance.css";

export type AttendanceStatus = "present" | "absent" | "late" | "pending";

export type StudentItem = {
  id: string;
  name: string;
  studentNo: string;
  status: AttendanceStatus;
  avatarUrl?: string; // 👈 Added avatarUrl support to fix TypeScript error and pass images
};

export type AttendanceRecord = {
  _id?: string;
  subject: string;
  date: string;
  isRecorded: boolean;
  students: StudentItem[];
};

export type SubjectOption = {
  value: string;
  label: string;
  section?: string;
};

const todayStr = new Date().toISOString().split("T")[0];

const cleanStr = (val: any): string =>
  String(val || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parsedDate = new Date(dateStr + "T00:00:00");
  if (isNaN(parsedDate.getTime())) return dateStr;
  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AttendanceTrackingPage() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr);
  const [query, setQuery] = useState<string>("");
  const [database, setDatabase] = useState<AttendanceRecord[]>([]);
  const [courseRosters, setCourseRosters] = useState<
    Record<string, StudentItem[]>
  >({});

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(false);
  const [isFetchingDB, setIsFetchingDB] = useState<boolean>(false);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userDepartment = storedUser?.department || "";
  const facultyName =
    storedUser?.name ||
    (storedUser?.firstName && storedUser?.lastName
      ? `${storedUser.firstName} ${storedUser.lastName}`
      : storedUser?.email || "");
  const facultyId = storedUser?.id || storedUser?._id || "";

  /* 1. FETCH ASSIGNED COURSES / SCHEDULES */
  useEffect(() => {
    const fetchAssignedCourses = async () => {
      setIsLoadingSchedules(true);
      try {
        const token = localStorage.getItem("token");
        const queryParams = new URLSearchParams();
        if (userDepartment) queryParams.append("department", userDepartment);
        if (facultyName) queryParams.append("faculty", facultyName);

        const response = await fetch(
          `/api/schedules?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (response.ok) {
          const rawSchedules = await response.json();
          const courseMap = new Map<
            string,
            { label: string; section?: string }
          >();

          (Array.isArray(rawSchedules) ? rawSchedules : []).forEach(
            (sch: any) => {
              if (sch.code && !courseMap.has(sch.code)) {
                courseMap.set(sch.code, {
                  label: `${sch.code} - ${sch.title || "Assigned Course"} ${
                    sch.section ? `(${sch.section})` : ""
                  }`.trim(),
                  section: sch.section,
                });
              }
            },
          );

          const fetchedSubjects: SubjectOption[] = Array.from(
            courseMap.entries(),
          ).map(([value, meta]) => ({
            value,
            label: meta.label,
            section: meta.section,
          }));

          if (fetchedSubjects.length > 0) {
            setSubjects(fetchedSubjects);
            setSubject(fetchedSubjects[0].value);
          } else {
            setSubjects([]);
            setSubject("");
          }
        } else {
          throw new Error("Failed to load schedules");
        }
      } catch (err) {
        console.error("Error fetching assigned courses:", err);
        setSubjects([]);
        setSubject("");
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchAssignedCourses();
  }, [userDepartment, facultyName]);

  /* 2. FETCH SAVED ATTENDANCE FROM DATABASE FOR ACTIVE FILTER */
  const fetchAttendanceFromDB = useCallback(async () => {
    if (!subject || !date) return;

    setIsFetchingDB(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        subject,
        date,
      });
      if (facultyId) queryParams.append("facultyId", facultyId);

      const response = await fetch(
        `/api/attendance?${queryParams.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (response.ok) {
        const records: AttendanceRecord[] = await response.json();
        setDatabase((prev) => {
          const filtered = prev.filter(
            (r) => !(r.subject === subject && r.date === date),
          );

          if (records.length > 0) {
            return [
              ...filtered,
              {
                _id: records[0]._id,
                subject: records[0].subject,
                date: records[0].date,
                isRecorded: records[0].isRecorded,
                students: (records[0].students || []).map((s: any) => ({
                  id: s.studentId || s.id,
                  name: s.name,
                  studentNo: s.studentNo,
                  status: s.status,
                  avatarUrl: s.avatarUrl || s.photo || s.image, // 👈 Map database avatar property
                })),
              },
            ];
          }
          return filtered;
        });
      }
    } catch (err) {
      console.error("Error loading attendance from DB:", err);
    } finally {
      setIsFetchingDB(false);
    }
  }, [facultyId, subject, date]);

  useEffect(() => {
    fetchAttendanceFromDB();
  }, [fetchAttendanceFromDB]);

  /* 3. FETCH BASE STUDENT ROSTER */
  const fetchRosterForSubject = useCallback(
    async (targetSubject: string) => {
      if (!targetSubject) return;

      setIsLoadingRoster(true);
      try {
        const token = localStorage.getItem("token");
        const selectedObj = subjects.find((s) => s.value === targetSubject);

        const queryParams = new URLSearchParams();
        if (facultyId) queryParams.append("facultyId", facultyId);
        if (facultyName) queryParams.append("facultyName", facultyName);

        const response = await fetch(
          `/api/students?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const loadedStudents: any[] = Array.isArray(data)
            ? data
            : data.students || [];

          const targetClean = cleanStr(targetSubject);
          const targetSectionClean = cleanStr(selectedObj?.section);

          const matchedStudents = loadedStudents.filter((s: any) => {
            const studentSection = cleanStr(
              s.section || s.classSection || s.sectionName,
            );
            const studentCourse = cleanStr(
              s.subject || s.course || s.courseCode || s.assignedSubject,
            );

            const courseList = Array.isArray(
              s.enrolledSubjects ||
                s.courses ||
                s.subjects ||
                s.enrolledClasses,
            )
              ? (
                  s.enrolledSubjects ||
                  s.courses ||
                  s.subjects ||
                  s.enrolledClasses
                ).map(cleanStr)
              : [];

            const isDirectCourseMatch =
              studentCourse.includes(targetClean) ||
              targetClean.includes(studentCourse) ||
              courseList.some(
                (c: string) =>
                  c.includes(targetClean) || targetClean.includes(c),
              );

            const isSectionMatch = targetSectionClean
              ? studentSection === targetSectionClean
              : false;

            return (
              isDirectCourseMatch || isSectionMatch || courseList.length === 0
            );
          });

          const formattedRoster: StudentItem[] = matchedStudents.map(
            (s: any, idx: number) => ({
              id: s._id || s.id || `stu-${idx}`,
              name:
                s.fullName ||
                s.name ||
                (s.firstName
                  ? `${s.firstName} ${s.lastName || ""}`
                  : "Unknown Student"),
              studentNo:
                s.studentIdNumber || s.studentId || s.id || `STU-${idx + 1}`,
              status: "pending",
              avatarUrl: s.avatarUrl || s.photo || s.image, // 👈 Map roster avatar property
            }),
          );

          setCourseRosters((prev) => ({
            ...prev,
            [targetSubject]: formattedRoster,
          }));
        }
      } catch (err) {
        console.error("Error fetching student roster for subject:", err);
      } finally {
        setIsLoadingRoster(false);
      }
    },
    [facultyId, facultyName, subjects],
  );

  useEffect(() => {
    if (subject) {
      fetchRosterForSubject(subject);
    }
  }, [subject, fetchRosterForSubject]);

  const activeRecord = useMemo(() => {
    if (!subject || !date) return null;
    return (
      database.find((rec) => rec.subject === subject && rec.date === date) ??
      null
    );
  }, [database, subject, date]);

  const isRecorded = useMemo(
    () => activeRecord?.isRecorded ?? false,
    [activeRecord],
  );

  // Fallback map to ensure avatarUrl shows even if old database records lack it
  const currentStudents = useMemo(() => {
    const dbStudents = activeRecord?.students || [];
    const rosterMap = new Map(
      (courseRosters[subject] || []).map((r) => [r.id, r.avatarUrl])
    );

    return dbStudents.map((s) => ({
      ...s,
      avatarUrl: s.avatarUrl || rosterMap.get(s.id),
    }));
  }, [activeRecord, courseRosters, subject]);

  const baseRosterCount = useMemo(
    () => (courseRosters[subject] || []).length,
    [courseRosters, subject],
  );

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

  /* 4. SAVE MODAL SESSION TO DATABASE */
  async function handleSaveFromModal(
    newSubject: string,
    newDate: string,
    updatedRecords: ModalStudent[],
  ) {
    setSubject(newSubject);
    setDate(newDate);

    const updatedList: StudentItem[] = updatedRecords.map((r) => ({
      id: r.id,
      name: r.name,
      studentNo: r.studentNo,
      status: (r.status as AttendanceStatus) || "pending",
      avatarUrl: r.avatarUrl, // 👈 Pass avatarUrl through when saving
    }));

    try {
      const token = localStorage.getItem("token");
      const activeObj = subjects.find((s) => s.value === newSubject);

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          facultyId,
          facultyName,
          subject: newSubject,
          section: activeObj?.section || "",
          date: newDate,
          overwrite: true,
          students: updatedList.map((s) => ({
            studentId: s.id,
            name: s.name,
            studentNo: s.studentNo,
            status: s.status,
            avatarUrl: s.avatarUrl, // 👈 Save avatarUrl to backend database
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to save attendance.");
        return;
      }

      const savedRecord = await res.json();

      setDatabase((prev) => {
        const existingIdx = prev.findIndex(
          (r) => r.subject === newSubject && r.date === newDate,
        );

        const formattedRecord: AttendanceRecord = {
          _id: savedRecord._id,
          subject: savedRecord.subject,
          date: savedRecord.date,
          isRecorded: true,
          students: updatedList,
        };

        if (existingIdx >= 0) {
          return prev.map((rec, idx) =>
            idx === existingIdx ? formattedRecord : rec,
          );
        } else {
          return [...prev, formattedRecord];
        }
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error submitting attendance to database:", err);
    }
  }

  const formattedDateLabel = useMemo(() => formatReadableDate(date), [date]);

  return (
    <div className="container-fluid py-4 faculty-att-page">
      <AttendanceHeader
        title="Attendance Tracking"
        subtitle={`Record and manage student attendance ${facultyName ? `for ${facultyName}` : ""}`}
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

          {isLoadingRoster || isFetchingDB ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">
                  Loading attendance session...
                </span>
              </div>
              <p className="text-muted mt-2 mb-0">
                Fetching attendance records...
              </p>
            </div>
          ) : baseRosterCount === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-3 bg-white">
              <UserX size={48} className="text-muted mx-auto mb-3 opacity-50" />
              <h5 className="fw-bold text-dark mb-1">No Students Enrolled</h5>
              <p className="text-muted mb-0">
                There are currently no students assigned to course{" "}
                <strong>{subject || "selected"}</strong>.
              </p>
            </div>
          ) : !isRecorded ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-3 bg-white">
              <CalendarX
                size={48}
                className="text-muted mx-auto mb-3 opacity-50"
              />
              <h5 className="fw-bold text-dark mb-1">No Attendance Recorded</h5>
              <p className="text-muted mb-0">
                No attendance session has been saved for{" "}
                <strong>{subject}</strong> on{" "}
                <strong>{formattedDateLabel}</strong>.
              </p>
            </div>
          ) : (
            <AttendanceList
              subjectSelected={Boolean(subject)}
              dateSelected={Boolean(date)}
              subjectLabel={
                subjects.find((s) => s.value === subject)?.label ?? subject
              }
              dateLabel={formattedDateLabel}
              presentSummary={`${stats.present}/${stats.total} Present (${stats.percent}%)`}
              students={filteredStudents}
              isRecorded={isRecorded}
              onSetPresent={() => {}}
              onSetAbsent={() => {}}
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
        existingDatabase={database}
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