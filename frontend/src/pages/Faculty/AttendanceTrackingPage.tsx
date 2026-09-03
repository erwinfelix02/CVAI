import { useMemo, useState } from "react";
import AttendanceHeader from "../../components/Faculty/Attendance/AttendanceHeader";
import AttendanceFilters from "../../components/Faculty/Attendance/AttendanceFilters";
import AttendanceStats from "../../components/Faculty/Attendance/AttendanceStats";
import AttendanceList from "../../components/Faculty/Attendance/AttendanceList";
import AttendanceModal from "../../components/Faculty/Attendance/AttendanceModal";
import type { ModalStudent } from "../../components/Faculty/Attendance/AttendanceModal";
import "../../styles/faculty-attendance.css";

export type AttendanceStatus = "present" | "absent" | "pending" | "late";

export type StudentItem = {
  id: string;
  name: string;
  studentNo: string;
  status: AttendanceStatus;
};

const subjects = [
  { value: "CS201", label: "CS 201 - Data Structures" },
  { value: "CS101", label: "CS 101 - Intro to Programming" },
];

const initialStudents: StudentItem[] = [
  { id: "s1", name: "Maria Santos", studentNo: "2024-00123", status: "present" },
  { id: "s2", name: "Juan Dela Cruz", studentNo: "2024-00124", status: "present" },
  { id: "s3", name: "Ana Reyes", studentNo: "2024-00125", status: "present" },
  { id: "s4", name: "Pedro Garcia", studentNo: "2024-00126", status: "absent" },
  { id: "s5", name: "Elena Cruz", studentNo: "2024-00127", status: "pending" },
  { id: "s6", name: "Carlos Mendoza", studentNo: "2024-00128", status: "present" },
];

export default function AttendanceTrackingPage() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q)
    );
  }, [students, query]);

  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const pending = students.filter((s) => s.status === "pending").length;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pending, percent };
  }, [students]);

  function setStatus(id: string, status: "present" | "absent") {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleExport() {
    alert("Exporting attendance records...");
  }

  function handleSaveFromModal(
    newSubject: string,
    newDate: string,
    updatedRecords: ModalStudent[]
  ) {
    setSubject(newSubject);
    setDate(newDate);
    setStudents(updatedRecords);
    console.log("Saved attendance record:", {
      subject: newSubject,
      date: newDate,
      students: updatedRecords,
    });
  }

  return (
    <div className="container-fluid py-4 faculty-att-page">
      <AttendanceHeader
        title="Attendance Tracking"
        subtitle="Record and manage student attendance"
        onNewRecord={handleOpenModal}
        onExport={handleExport}
      />

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

      <AttendanceList
        subjectLabel={subjects.find((s) => s.value === subject)?.label ?? ""}
        dateLabel={new Date(date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        presentSummary={`${stats.present}/${stats.total} Present (${stats.percent}%)`}
        students={filtered}
        onSetPresent={(id) => setStatus(id, "present")}
        onSetAbsent={(id) => setStatus(id, "absent")}
      />

      {/* Record Attendance Modal */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subjects={subjects}
        initialSubject={subject}
        initialDate={date}
        studentsList={students as ModalStudent[]}
        onSave={handleSaveFromModal}
      />
    </div>
  );
}