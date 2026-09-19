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

interface ScheduleResponse {
  _id: string;
  code: string;
  title: string;
  section: string;
  faculty: string;
}

export default function StudentsPage(): JSX.Element {
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);

  // Student State
  const [studentsList, setStudentsList] = useState<Student[]>([]);

  // Dynamic schedules
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);

  // Extract sections strictly from loaded students who are actively enrolled
  const sectionsList = useMemo(() => {
    const activeStudentSections = studentsList
      .map((s: any) => String(s.section || s.classSection || s.sectionName || "").trim())
      .filter((sec) => sec !== "" && sec !== "—" && sec !== "null" && sec !== "undefined");

    const uniqueSections = Array.from(new Set(activeStudentSections)).sort((a, b) =>
      a.localeCompare(b)
    );

    return ["All", ...uniqueSections];
  }, [studentsList]);

  // Compute active section students list
  const activeSectionStudents = useMemo(() => {
    if (sectionFilter === "All") return studentsList;
    return studentsList.filter((s: any) => {
      const studentSection = String(s.section || s.classSection || "").trim().toLowerCase();
      return studentSection === sectionFilter.trim().toLowerCase();
    });
  }, [studentsList, sectionFilter]);

  // Fetch student records and computed attendance from API
  const fetchStudentRecords = async (): Promise<void> => {
    setIsLoadingStudents(true);
    try {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
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

      const attParams = new URLSearchParams();
      if (facultyId) attParams.append("facultyId", facultyId);

      // Fetch students and attendance in parallel
      const [studentsRes, attendanceRes] = await Promise.all([
        fetch(`/api/students?${queryParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }),
        fetch(`/api/attendance?${attParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }).catch(() => null),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        const rawStudents: any[] = Array.isArray(data)
          ? data
          : data.students || [];

        // Parse attendance sessions into student stats map
        const attendanceMap = new Map<string, { present: number; total: number }>();

        if (attendanceRes && attendanceRes.ok) {
          const attRecords = await attendanceRes.json();
          if (Array.isArray(attRecords)) {
            attRecords.forEach((record: any) => {
              if (Array.isArray(record.students)) {
                record.students.forEach((st: any) => {
                  const sKey = (st.studentId || st.studentNo || "").toString().trim().toLowerCase();
                  if (!sKey) return;

                  const prev = attendanceMap.get(sKey) || { present: 0, total: 0 };
                  const isPresent = st.status === "present" || st.status === "late";
                  attendanceMap.set(sKey, {
                    present: prev.present + (isPresent ? 1 : 0),
                    total: prev.total + 1,
                  });
                });
              }
            });
          }
        }

        // Merge computed attendance percentage into student objects
        const loadedStudents: Student[] = rawStudents.map((s: any) => {
          const lookupKey = (s._id || s.id || s.studentIdNumber || s.studentId || "").toString().trim().toLowerCase();
          const attStats = attendanceMap.get(lookupKey);

          let calculatedPct = 100;
          if (attStats && attStats.total > 0) {
            calculatedPct = Math.round((attStats.present / attStats.total) * 100);
          } else if (typeof s.attendance === "number") {
            calculatedPct = s.attendance;
          }

          return {
            ...s,
            attendance: calculatedPct,
          };
        });

        setStudentsList(loadedStudents);
        notifyStudentCountUpdate(loadedStudents.length);
      }
    } catch (err) {
      console.error("Error fetching student records:", err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch assigned schedules from API
  const fetchAssignedSchedules = async (): Promise<void> => {
    setIsLoadingClasses(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/schedules", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assigned schedules.");
      }

      const data: ScheduleResponse[] = await response.json();

      const formattedClasses: AssignedClass[] = (Array.isArray(data) ? data : []).map((sch) => ({
        id: sch._id,
        code: sch.code,
        title: sch.title,
        section: sch.section,
        label: `${sch.section} - ${sch.code} (${sch.title})`,
      }));

      setAssignedClasses(formattedClasses);
    } catch (err) {
      console.error("Error fetching faculty schedules:", err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchStudentRecords();
    fetchAssignedSchedules();
  }, []);

  const handleStudentAdded = (newStudent: Student): void => {
    setStudentsList((prev) => {
      const existsIndex = prev.findIndex(
        (s) =>
          s.id === newStudent.id ||
          (Boolean(s._id) && Boolean(newStudent._id) && s._id === newStudent._id)
      );

      let updatedList: Student[];
      if (existsIndex > -1) {
        updatedList = [...prev];
        updatedList[existsIndex] = { ...updatedList[existsIndex], ...newStudent };
      } else {
        updatedList = [newStudent, ...prev];
      }

      notifyStudentCountUpdate(updatedList.length);
      return updatedList;
    });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  return (
    <div className="container-fluid faculty-students-page">
      {/* HEADER */}
      <div className="students-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Student Management</h3>
          <p className="text-muted mb-0">
            Manage and view your students' information
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

      {/* STATS */}
      <StatsCards studentsList={activeSectionStudents} />

      {/* SEARCH + FILTER */}
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

          <div className="dropdown w-100 w-md-auto">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2 justify-content-between justify-content-md-start"
              data-bs-toggle="dropdown"
            >
              <span className="d-flex align-items-center gap-2">
                <Filter size={16} />
                {sectionFilter === "All" ? "All Sections" : sectionFilter}
              </span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end w-100 shadow-sm">
              {sectionsList.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className={`dropdown-item ${
                      sectionFilter === s ? "active" : ""
                    }`}
                    onClick={() => setSectionFilter(s)}
                  >
                    {s === "All" ? "All Sections" : s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* LIST */}
      <StudentList
        search={search}
        sectionFilter={sectionFilter}
        studentsList={studentsList}
        isLoading={isLoadingStudents}
      />

      {/* EXPORT STUDENT MODAL */}
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