import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, JSX } from "react";

import StatsCards from "../../components/Faculty/Student/StatsCards";
import StudentList from "../../components/Faculty/Student/StudentList";
import ExportStudentModal from "../../components/Faculty/Student/ExportStudentModal";
import AddStudentModal from "../../components/Faculty/Student/AddStudentModal";
import type { AssignedClass } from "../../components/Faculty/Student/AddStudentModal";
import type { Student } from "../../components/Faculty/Student/types";

import { Download, UserPlus, Search, Filter } from "lucide-react";
import "../../styles/faculty-students.css";

import { notifyStudentCountUpdate } from "../../utils/studentCount";
import { API_BASE_URL } from "../../config";

interface ScheduleResponse {
  _id: string;
  code: string;
  title: string;
  section: string;
  faculty: string;
}

/**
 * Extract a section value from a student record, checking all possible property variations.
 */
function getStudentSection(student: Student): string {
  const s = student as Record<string, unknown>;
  const rawSection =
    student.section ??
    student.classSection ??
    student.sectionName ??
    s.section_name ??
    s.course ??
    s.yearAndSection ??
    s.year_section ??
    s.assignedSection ??
    "";

  if (typeof rawSection === "string" || typeof rawSection === "number") {
    return String(rawSection).trim();
  }

  if (rawSection && typeof rawSection === "object") {
    const section = rawSection as Record<string, unknown>;

    const value =
      section.name ??
      section.section ??
      section.sectionName ??
      section.label ??
      section.code;

    return value == null ? "" : String(value).trim();
  }

  return "";
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export default function StudentsPage(): JSX.Element {
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const [isExportModalOpen, setIsExportModalOpen] =
    useState<boolean>(false);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] =
    useState<boolean>(false);

  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);

  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);

  /**
   * Build section options from BOTH student records and schedules.
   */
  const sectionsList = useMemo(() => {
    const studentSections = studentsList.map(getStudentSection);
    const scheduleSections = assignedClasses.map((schedule) =>
      String(schedule.section ?? "").trim()
    );

    console.log("Extracted student sections:", studentSections);
    console.log("Extracted schedule sections:", scheduleSections);

    const allSections = [...studentSections, ...scheduleSections].filter(
      (section) => {
        const value = normalize(section);

        return (
          value !== "" &&
          value !== "—" &&
          value !== "null" &&
          value !== "undefined"
        );
      }
    );

    const uniqueSections = Array.from(new Set(allSections)).sort((a, b) =>
      a.localeCompare(b)
    );

    console.log("Final computed sectionsList:", ["All", ...uniqueSections]);

    return ["All", ...uniqueSections];
  }, [studentsList, assignedClasses]);

  /**
   * Filter statistics by the selected section.
   */
  const activeSectionStudents = useMemo(() => {
    const selectedSection = normalize(sectionFilter);

    if (!selectedSection || selectedSection === "all") {
      return studentsList;
    }

    return studentsList.filter(
      (student) =>
        normalize(getStudentSection(student)) === selectedSection
    );
  }, [studentsList, sectionFilter]);

  /**
   * Reset only if the selected section no longer exists in either source.
   */
  useEffect(() => {
    if (
      sectionFilter !== "All" &&
      !sectionsList.some(
        (section) => normalize(section) === normalize(sectionFilter)
      )
    ) {
      setSectionFilter("All");
    }
  }, [sectionsList, sectionFilter]);

  /**
   * Fetch students and attendance.
   */
  const fetchStudentRecords = async (): Promise<void> => {
    setIsLoadingStudents(true);

    try {
      const userJson = localStorage.getItem("user");
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("sessionToken");

      const user = userJson ? JSON.parse(userJson) : null;

      const facultyId = user?.id || user?._id || "";

      const facultyName =
        user?.name ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.email || "");

      const queryParams = new URLSearchParams();

      if (facultyId) queryParams.append("facultyId", facultyId);
      if (facultyName) queryParams.append("facultyName", facultyName);

      const attendanceParams = new URLSearchParams();

      if (facultyId) {
        attendanceParams.append("facultyId", facultyId);
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [studentsResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/students?${queryParams.toString()}`, {
          headers,
        }),
        fetch(`${API_BASE_URL}/attendance?${attendanceParams.toString()}`, {
          headers,
        }).catch(() => null),
      ]);

      if (!studentsResponse.ok) {
        throw new Error(
          `Failed to fetch students: ${studentsResponse.status}`
        );
      }

      const responseData = await studentsResponse.json();

      const rawStudents: Student[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.students)
          ? responseData.students
          : [];

      console.log("Student records from API:", rawStudents);

      const attendanceMap = new Map<
        string,
        { present: number; total: number }
      >();

      if (attendanceResponse?.ok) {
        const attendanceData = await attendanceResponse.json();

        if (Array.isArray(attendanceData)) {
          attendanceData.forEach((record: any) => {
            if (!Array.isArray(record.students)) return;

            record.students.forEach((attendanceStudent: any) => {
              const studentKey = String(
                attendanceStudent.studentId ??
                  attendanceStudent.studentNo ??
                  ""
              )
                .trim()
                .toLowerCase();

              if (!studentKey) return;

              const previous = attendanceMap.get(studentKey) ?? {
                present: 0,
                total: 0,
              };

              const status = normalize(attendanceStudent.status);
              const isPresent = status === "present" || status === "late";

              attendanceMap.set(studentKey, {
                present: previous.present + (isPresent ? 1 : 0),
                total: previous.total + 1,
              });
            });
          });
        }
      }

      const loadedStudents: Student[] = rawStudents.map((student) => {
        const possibleIds = [
          student._id,
          student.id,
          student.studentIdNumber,
          student.studentId,
        ]
          .filter(Boolean)
          .map(normalize);

        let attendancePercentage =
          typeof student.attendance === "number" ? student.attendance : 100;

        for (const id of possibleIds) {
          const stats = attendanceMap.get(id);

          if (stats && stats.total > 0) {
            attendancePercentage = Math.round(
              (stats.present / stats.total) * 100
            );
            break;
          }
        }

        return {
          ...student,
          attendance: attendancePercentage,
          avatarUrl:
            student.avatarUrl ||
            student.avatar ||
            student.photoUrl ||
            student.photo ||
            "",
        };
      });

      setStudentsList(loadedStudents);
      notifyStudentCountUpdate(loadedStudents.length);
    } catch (error) {
      console.error("Error fetching student records:", error);
      setStudentsList([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  /**
   * Fetch schedules assigned to the faculty.
   */
  const fetchAssignedSchedules = async (): Promise<void> => {
    setIsLoadingClasses(true);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("sessionToken");

      const response = await fetch(`${API_BASE_URL}/schedules`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch assigned schedules: ${response.status}`
        );
      }

      const responseData = await response.json();

      const schedules: ScheduleResponse[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.schedules)
          ? responseData.schedules
          : [];

      const formattedClasses: AssignedClass[] = schedules.map((schedule) => ({
        id: schedule._id,
        code: schedule.code,
        title: schedule.title,
        section: schedule.section,
        label: `${schedule.section} ${schedule.code} (${schedule.title})`,
      }));

      setAssignedClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching faculty schedules:", error);
      setAssignedClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    void fetchStudentRecords();
    void fetchAssignedSchedules();
  }, []);

  /**
   * Add a student or update an existing record.
   */
  const handleStudentAdded = (newStudent: Student): void => {
    setStudentsList((previousStudents) => {
      const existingIndex = previousStudents.findIndex(
        (student) =>
          (Boolean(student.id) &&
            Boolean(newStudent.id) &&
            student.id === newStudent.id) ||
          (Boolean(student._id) &&
            Boolean(newStudent._id) &&
            student._id === newStudent._id)
      );

      let updatedStudents: Student[];

      if (existingIndex >= 0) {
        updatedStudents = [...previousStudents];
        updatedStudents[existingIndex] = {
          ...updatedStudents[existingIndex],
          ...newStudent,
        };
      } else {
        updatedStudents = [newStudent, ...previousStudents];
      }

      notifyStudentCountUpdate(updatedStudents.length);
      return updatedStudents;
    });
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSearch(event.target.value);
  };

  return (
    <div className="container-fluid faculty-students-page">
      {/* HEADER */}
      <div className="students-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Student Management</h3>
          <p className="text-muted mb-0">
            Manage and view your students&apos; information
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-export-white d-flex align-items-center gap-2"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setIsAddStudentModalOpen(true)}
          >
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <StatsCards studentsList={activeSectionStudents} />

      {/* SEARCH AND SECTION FILTER */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row gap-3">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-white">
              <Search size={16} />
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search by name or ID..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="dropdown w-100 w-md-auto position-relative">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2 justify-content-between justify-content-md-start"
              onClick={() => {
                const dropdownElement = document.getElementById("sectionDropdownMenu");
                if (dropdownElement) {
                  dropdownElement.classList.toggle("show");
                }
              }}
            >
              <span className="d-flex align-items-center gap-2">
                <Filter size={16} />
                {normalize(sectionFilter) === "all"
                  ? "All Sections"
                  : sectionFilter}
              </span>
            </button>

            <ul 
              id="sectionDropdownMenu"
              className="dropdown-menu dropdown-menu-end w-100 shadow-sm"
            >
              {sectionsList.map((section) => (
                <li key={section}>
                  <button
                    type="button"
                    className={`dropdown-item ${
                      normalize(sectionFilter) === normalize(section)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSectionFilter(section);
                      const dropdownElement = document.getElementById("sectionDropdownMenu");
                      if (dropdownElement) {
                        dropdownElement.classList.remove("show");
                      }
                    }}
                  >
                    {section === "All" ? "All Sections" : section}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* STUDENT LIST */}
      <StudentList
        search={search}
        sectionFilter={sectionFilter}
        studentsList={studentsList}
        isLoading={isLoadingStudents}
      />

      {/* EXPORT MODAL */}
      <ExportStudentModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sectionFilter={sectionFilter}
        sectionsList={sectionsList}
        studentsList={studentsList}
      />

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        assignedClasses={assignedClasses}
        isLoadingClasses={isLoadingClasses}
        onStudentAdded={handleStudentAdded}
      />
    </div>
  );
}