// ✅ src/pages/DepartmentHead/DepartmentHeadSubjects.tsx

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

import SubjectStats, {
  type SubjectStatItem,
} from "../../components/DepartmentHead/Subjects/SubjectStats";

import SubjectSearch from "../../components/DepartmentHead/Subjects/SubjectSearch";

import SubjectTable, {
  type SubjectRow,
} from "../../components/DepartmentHead/Subjects/SubjectTable";

import AddSubjectModal, {
  type NewSubjectFormData,
  type CourseItem,
} from "../../components/DepartmentHead/Subjects/AddSubjectModal";

import "../../styles/department-headSubjects.css";

export default function DepartmentHeadSubjects() {
  /* =========================================================
     SEARCH / FILTER / MODAL STATE
     ========================================================= */

  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("All Programs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);

  /* =========================================================
     DELETE CONFIRMATION MODAL STATE
     ========================================================= */

  const [deletingSubject, setDeletingSubject] = useState<SubjectRow | null>(
    null
  );

  /* =========================================================
     CENTERED ALERT & LOADING STATE
     ========================================================= */

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "loading">(
    "loading"
  );
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAlertVisible || alertType === "loading") return;
    const timer = setTimeout(() => setIsAlertVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [isAlertVisible, alertType]);

  const showLoadingAlert = (message: string) => {
    setAlertMessage(message);
    setAlertType("loading");
    setIsAlertVisible(true);
  };

  const showStatusAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertVisible(true);
  };

  /* =========================================================
     USER DEPARTMENT DATA
     ========================================================= */

  const userDepartment = useMemo(() => {
    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;
    return currentUser?.department || "";
  }, []);

  /* =========================================================
     PROGRAMS / COURSES DYNAMIC FETCH
     ========================================================= */

  const [availablePrograms, setAvailablePrograms] = useState<CourseItem[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchDepartmentCourses = async () => {
      try {
        const response = await fetch("/api/courses?status=Active");
        if (!response.ok) throw new Error("Failed to fetch courses");

        const data: CourseItem[] = await response.json();

        const departmentCourses = userDepartment
          ? data.filter(
              (course) =>
                course.department.toLowerCase() ===
                userDepartment.toLowerCase()
            )
          : data;

        setAvailablePrograms(departmentCourses);
      } catch (err) {
        console.error("Error fetching courses for department:", err);
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    fetchDepartmentCourses();
  }, [userDepartment]);

  /* =========================================================
     SUBJECT DATA FETCH & DYNAMIC FACULTY ASSIGNMENT FROM SCHEDULES
     ========================================================= */

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    try {
      const queryParam = userDepartment
        ? `?department=${encodeURIComponent(userDepartment)}`
        : "";

      // Fetch subjects and schedules concurrently
      const [subjectsRes, schedulesRes] = await Promise.all([
        fetch(`/api/subjects${queryParam}`),
        fetch(`/api/schedules${queryParam}`),
      ]);

      if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");

      const rawSubjects: SubjectRow[] = await subjectsRes.json();
      const rawSchedules: any[] = schedulesRes.ok
        ? await schedulesRes.json()
        : [];

      // Map subject code to unique assigned faculty members from schedules
      const facultyMap: Record<string, string[]> = {};
      rawSchedules.forEach((sched) => {
        if (sched.code && sched.faculty) {
          const codeKey = sched.code.trim().toUpperCase();
          if (!facultyMap[codeKey]) {
            facultyMap[codeKey] = [];
          }
          if (!facultyMap[codeKey].includes(sched.faculty.trim())) {
            facultyMap[codeKey].push(sched.faculty.trim());
          }
        }
      });

      // Merge dynamic faculty assignment into subjects list
      const enrichedSubjects = rawSubjects.map((subject) => {
        const codeKey = subject.code.trim().toUpperCase();
        const assignedList = facultyMap[codeKey] || [];

        return {
          ...subject,
          faculty:
            assignedList.length > 0
              ? assignedList.join(", ")
              : subject.faculty || "",
        };
      });

      setSubjects(enrichedSubjects);
    } catch (err) {
      console.error("Error fetching subjects or schedules:", err);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [userDepartment]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /* =========================================================
     STATISTICS
     ========================================================= */

  const stats = useMemo<SubjectStatItem[]>(
    () => [
      {
        label: "Total Subjects",
        value: subjects.length,
        icon: BookOpen,
      },
      {
        label: "Total Units",
        value: subjects.reduce(
          (total, subject) => total + (subject.units || 0),
          0
        ),
        icon: BookOpen,
      },
      {
        label: "Unassigned",
        value: subjects.filter((subject) => !subject.faculty).length,
        icon: BookOpen,
      },
    ],
    [subjects]
  );

  /* =========================================================
     FILTERED SUBJECTS
     ========================================================= */

  const filteredSubjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        subject.code.toLowerCase().includes(keyword) ||
        subject.name.toLowerCase().includes(keyword) ||
        (subject.faculty && subject.faculty.toLowerCase().includes(keyword));

      const matchesProgram =
        program === "All Programs" || subject.program === program;

      return matchesSearch && matchesProgram;
    });
  }, [subjects, search, program]);

  /* =========================================================
     HANDLERS (CREATE / EDIT / DELETE)
     ========================================================= */

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: SubjectRow) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleSaveSubject = async (data: NewSubjectFormData) => {
    setIsSubmitting(true);
    showLoadingAlert(
      editingSubject ? "Saving subject changes..." : "Adding new subject..."
    );

    try {
      if (editingSubject) {
        // UPDATE API
        const targetId = editingSubject._id || editingSubject.id;
        const response = await fetch(`/api/subjects/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || "Failed to update subject");
        }

        showStatusAlert("Subject updated successfully!", "success");
      } else {
        // CREATE API
        const response = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            department: userDepartment,
          }),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.message || "Failed to create subject");
        }

        showStatusAlert("Subject added successfully!", "success");
      }

      await fetchSubjects(); // Refresh subjects list with updated faculty mappings
      handleCloseModal();
    } catch (err: any) {
      showStatusAlert(
        err.message || "An error occurred while saving the subject.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (subject: SubjectRow) => {
    setDeletingSubject(subject);
  };

  const handleCloseDeleteModal = () => {
    if (isSubmitting) return;
    setDeletingSubject(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;

    const targetSubject = deletingSubject;
    setDeletingSubject(null);

    setIsSubmitting(true);
    showLoadingAlert("Deleting subject...");

    try {
      const targetId = targetSubject._id || targetSubject.id;
      const response = await fetch(`/api/subjects/${targetId}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to delete subject");
      }

      setSubjects((prev) =>
        prev.filter((item) => (item._id || item.id) !== targetId)
      );
      showStatusAlert("Subject deleted successfully!", "success");
    } catch (err: any) {
      showStatusAlert(
        err.message || "An error occurred while deleting the subject.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* CENTERED DELETE CONFIRMATION MODAL */}
      {deletingSubject && (
        <div className="subject-centered-alert-backdrop">
          <div className="subject-centered-alert-card text-center p-4">
            <div className="bg-danger-subtle text-danger p-3 rounded-circle d-inline-flex mb-3">
              <Trash2 size={32} />
            </div>
            <h5 className="fw-bold mb-2">Delete Subject?</h5>
            <p className="text-muted small mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {deletingSubject.code} - {deletingSubject.name}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium"
                onClick={handleCloseDeleteModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISIBLE CENTERED LOADING / STATUS OVERLAY */}
      {isAlertVisible && (
        <div className="subject-centered-alert-backdrop">
          <div className="subject-centered-alert-card">
            {alertType === "loading" && (
              <div className="d-flex flex-column align-items-center">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="fw-semibold text-dark mb-0">{alertMessage}</h6>
              </div>
            )}

            {alertType === "success" && (
              <div className="d-flex flex-column align-items-center text-center">
                <CheckCircle2 size={42} className="text-success mb-2" />
                <h6 className="fw-semibold text-dark mb-0">{alertMessage}</h6>
              </div>
            )}

            {alertType === "error" && (
              <div className="d-flex flex-column align-items-center text-center">
                <AlertCircle size={42} className="text-danger mb-2" />
                <h6 className="fw-semibold text-dark mb-0">{alertMessage}</h6>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container-fluid py-3 py-md-4 subjects-page">
        {/* HEADER */}
        <div className="subjects-page-header mb-4">
          <div>
            <h1 className="fw-bold mb-1">Subject Offerings</h1>
            <p className="text-muted mb-0">
              Manage curriculum subjects and faculty assignments
            </p>
          </div>

          <button
            type="button"
            className="btn subjects-add-btn"
            onClick={handleOpenAddModal}
            disabled={isSubmitting}
          >
            <Plus size={20} />
            <span>Add Subject</span>
          </button>
        </div>

        {/* STATISTICS */}
        <SubjectStats items={stats} />

        {/* SEARCH / FILTER */}
        <div className="subjects-filter-card">
          <SubjectSearch
            search={search}
            onSearchChange={setSearch}
            program={program}
            onProgramChange={setProgram}
            programs={availablePrograms}
          />
        </div>

        {/* SUBJECT TABLE */}
        <div className="subjects-table-wrapper">
          {isLoadingSubjects ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading subjects...</span>
              </div>
              <p className="mt-2 text-muted">Loading subjects...</p>
            </div>
          ) : (
            <SubjectTable
              subjects={filteredSubjects}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          )}
        </div>

        {/* ADD / EDIT SUBJECT MODAL */}
        <AddSubjectModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSaveSubject}
          initialData={editingSubject}
          programs={availablePrograms}
          isLoadingPrograms={isLoadingPrograms}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}