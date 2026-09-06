import { useState } from "react";
import StudentRow from "./StudentRow";
import StudentProfileModal from "./StudentProfileModal";
import SendEmailModal from "./SendEmailModal";
import type { Student } from "./types";

const students: Student[] = [
  { initials: "MS", name: "Maria Santos", id: "2024-00123", section: "CS-3A", gpa: 3.85, attendance: 95, status: "good", course: "BS Computer Science", email: "maria.santos@university.edu", phone: "+63 917 123 4567" },
  { initials: "JD", name: "Juan Dela Cruz", id: "2024-00124", section: "CS-3A", gpa: 3.42, attendance: 88, status: "good" },
  { initials: "AR", name: "Ana Reyes", id: "2024-00125", section: "CS-3B", gpa: 3.91, attendance: 98, status: "good" },
  { initials: "PG", name: "Pedro Garcia", id: "2024-00126", section: "CS-3A", gpa: 2.65, attendance: 72, status: "warning" },
  { initials: "EC", name: "Elena Cruz", id: "2024-00127", section: "CS-3B", gpa: 3.58, attendance: 91, status: "good" },
  { initials: "CM", name: "Carlos Mendoza", id: "2024-00128", section: "CS-3A", gpa: 3.12, attendance: 85, status: "good" },
];

type Props = {
  search: string;
  sectionFilter: string;
};

export default function StudentList({ search, sectionFilter }: Props) {
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [emailStudent, setEmailStudent] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search);

    const matchSection =
      sectionFilter === "All" || s.section === sectionFilter;

    return matchSearch && matchSection;
  });

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Students ({filtered.length})
          </h5>

          <div className="student-list">
            {filtered.map((student) => (
              <StudentRow
                key={student.id}
                {...student}
                onView={(studentData) => setViewStudent(studentData)}
                onEmail={(studentData) => setEmailStudent(studentData)}
              />
            ))}

            {filtered.length === 0 && (
              <p className="text-muted text-center mb-0">
                No students found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      <StudentProfileModal
        student={viewStudent}
        onClose={() => setViewStudent(null)}
      />

      {/* SEND EMAIL MODAL */}
      <SendEmailModal
        student={emailStudent}
        onClose={() => setEmailStudent(null)}
      />
    </>
  );
}