import { useState, useMemo } from "react";
import StudentRow from "./StudentRow";
import StudentProfileModal from "./StudentProfileModal";
import SendEmailModal from "./SendEmailModal";
import type { Student } from "./types";

type Props = {
  search: string;
  sectionFilter: string;
  studentsList?: Student[];
  isLoading?: boolean;
};

export default function StudentList({
  search,
  sectionFilter,
  studentsList = [],
  isLoading = false,
}: Props) {
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [emailStudent, setEmailStudent] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return studentsList.filter((s: any) => {
      // 1. Search match
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.id && s.id.toLowerCase().includes(query));

      // 2. Section match against visible section list
      const studentSection = String(s.section || s.classSection || "").trim();
      const targetFilter = String(sectionFilter || "All").trim();

      const matchSection =
        targetFilter === "All" ||
        studentSection.toLowerCase() === targetFilter.toLowerCase();

      return matchSearch && matchSection;
    });
  }, [studentsList, search, sectionFilter]);

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            Students ({filtered.length})
          </h5>

          <div className="student-list">
            {isLoading ? (
              <p className="text-muted text-center mb-0 py-4">
                Loading students from database...
              </p>
            ) : (
              <>
                {filtered.map((student, index) => (
                  <StudentRow
                    key={student.id || student._id || index}
                    {...student}
                    onView={(studentData) => setViewStudent(studentData)}
                    onEmail={(studentData) => setEmailStudent(studentData)}
                  />
                ))}

                {filtered.length === 0 && (
                  <p className="text-muted text-center mb-0 py-4">
                    No students found for this section or search criteria.
                  </p>
                )}
              </>
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