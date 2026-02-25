import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import CourseStatsRow from "../../components/Registrar/Courses/CourseStatsRow";
import CoursesToolbar from "../../components/Registrar/Courses/CoursesToolbar";
import CoursesTable from "../../components/Registrar/Courses/CoursesTable";
import AddCourseModal from "../../components/Registrar/Courses/AddCourseModal";
import AuthAlert from "../../components/Authentication/AuthAlert";

import type { CourseItem } from "../../components/Registrar/Courses/types";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/courseService";

import "../../styles/registrar-courses.css";

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<CourseItem | null>(null);

  // ✅ AuthAlert state (same pattern as UsersPage)
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

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
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  // ✅ LOAD COURSES FROM DB
  const loadCourses = async () => {
    try {
      setIsLoading(true);

      const data = await getCourses();

      const mapped: CourseItem[] = (Array.isArray(data) ? data : []).map(
        (c: any) => ({
          id: c._id,
          code: c.code,
          name: c.name,
          yearLevels: c.yearLevels,
          department: c.department,
          status: c.status ?? "Active",
        })
      );

      setCourses(mapped);
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to load courses.",
        "error"
      );
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // ✅ FILTER
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) => {
      const hay = `${c.code} ${c.name} ${c.department} ${c.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [courses, query]);

  // ✅ STATS
  const totals = useMemo(() => {
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === "Active").length;
    const departments = new Set(courses.map((c) => c.department)).size;
    return { totalCourses, activeCourses, departments };
  }, [courses]);

  const openCreate = () => {
    setEditing(null);
    setOpenAdd(true);
  };

  const openEdit = (item: CourseItem) => {
    setEditing(item);
    setOpenAdd(true);
  };

  // ✅ CREATE -> DB (called AFTER confirm inside modal)
  const onCreate = async (item: CourseItem) => {
    try {
      setIsLoading(true);

      await createCourse({
        code: item.code,
        name: item.name,
        yearLevels: item.yearLevels,
        department: item.department,
        status: item.status,
      });

      await loadCourses();

      setOpenAdd(false);
      setEditing(null);
      showAlert("Course created successfully!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to create course.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATE -> DB (called AFTER confirm inside modal)
  const onUpdate = async (item: CourseItem) => {
    try {
      setIsLoading(true);

      await updateCourse(item.id, {
        code: item.code,
        name: item.name,
        yearLevels: item.yearLevels,
        department: item.department,
        status: item.status,
      });

      await loadCourses();

      setOpenAdd(false);
      setEditing(null);
      showAlert("Course updated successfully!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to update course.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

// ✅ DELETE -> DB (NO window.confirm here)
const onDelete = async (id: string) => {
  try {
    setIsLoading(true);

    await deleteCourse(id);
    await loadCourses();

    showAlert("Course deleted successfully.", "success");
  } catch (err: any) {
    showAlert(
      err.response?.data?.message || "Failed to delete course.",
      "error"
    );
  } finally {
    setIsLoading(false);
  }
};

  // ✅ EMPTY STATE uses same style as UsersPage
  const hasRows = filtered.length > 0;

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="registrar-courses-page container-fluid px-3 px-md-4">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">Courses Management</h2>
            <p className="text-muted mb-0">
              Manage academic programs and their year levels
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg courses-add-btn"
            onClick={openCreate}
            disabled={isLoading}
          >
            <Plus size={18} />
            <span className="ms-2">Add Course</span>
          </button>
        </div>

        <CourseStatsRow
          totalCourses={totals.totalCourses}
          activeCourses={totals.activeCourses}
          departments={totals.departments}
        />

        <div className="card shadow-sm border-0 mt-3 mt-md-4">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <h5 className="fw-bold mb-0">All Courses</h5>
              <CoursesToolbar query={query} onQueryChange={setQuery} />
            </div>

            {hasRows ? (
              <CoursesTable
                items={filtered}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            ) : (
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No courses found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search or click <b>Add Course</b>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ADD / EDIT COURSE MODAL (confirmation is inside) */}
        <AddCourseModal
          open={openAdd}
          onClose={() => {
            setOpenAdd(false);
            setEditing(null);
          }}
          initial={editing}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </div>
    </>
  );
}