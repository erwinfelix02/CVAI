import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";

import SectionStatsRow from "../../components/Registrar/Sections/SectionStatsRow";
import SectionsToolbar from "../../components/Registrar/Sections/SectionsToolbar";
import SectionsGrid from "../../components/Registrar/Sections/SectionsGrid";
import AddSectionModal from "../../components/Registrar/Sections/AddSectionModal";

import type { SectionItem } from "../../components/Registrar/Sections/types";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../api/sectionService";

import { getCourses } from "../../api/courseService";

import "../../styles/registrar-sections.css";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  yearLevels: number;
   status: "Active" | "Inactive";
};

const SETTINGS_URL = "http://localhost:5000/api/registrar/settings";

export default function SectionsManagementPage() {
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("All Courses");

  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<SectionItem | null>(null);

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // ✅ NEW: max capacity from registrar settings
  const [maxCapacity, setMaxCapacity] = useState<number>(45);

  const [isLoading, setIsLoading] = useState(false);
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

  // ✅ NEW: LOAD REGISTRAR SETTINGS (max capacity)
  const loadRegistrarSettings = async () => {
    try {
      const res = await fetch(SETTINGS_URL);
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to load registrar settings", data);
        return;
      }

      const max = Number(data?.maxStudentsPerSection ?? 45);
      setMaxCapacity(Number.isFinite(max) && max > 0 ? max : 45);
    } catch (err) {
      console.error("Failed to fetch registrar settings", err);
    }
  };
// ✅ LOAD COURSES
const loadCourses = async () => {
  try {
    const data = await getCourses();

    const mapped: CourseOption[] = (Array.isArray(data) ? data : [])
      .map((c: any): CourseOption => {
        const status: CourseOption["status"] =
          c.status === "Inactive" ? "Inactive" : "Active";

        return {
          id: c._id,
          code: c.code,
          name: c.name,
          yearLevels: Number(c.yearLevels ?? 4),
          status,
        };
      })
      .filter((c) => c.status === "Active"); // ✅ ONLY ACTIVE COURSES

    setCourses(mapped);
  } catch (err: any) {
    console.error(err);
    setCourses([]);
    showAlert(err.response?.data?.message || "Failed to load courses.", "error");
  }
};

  // ✅ LOAD SECTIONS
  const loadSections = async () => {
    try {
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
          capacity: s.capacity,
        }),
      );

      setSections(mapped);
    } catch (err: any) {
      console.error(err);
      setSections([]);
      showAlert(
        err.response?.data?.message || "Failed to load sections.",
        "error",
      );
    }
  };

  // ✅ INITIAL LOAD (settings + courses + sections)
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await Promise.all([loadRegistrarSettings(), loadCourses(), loadSections()]);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    // ✅ IMPORTANT: clear editing first so modal is CREATE mode
    setEditing(null);
    setOpenAdd(true);
  };

  const openEdit = (item: SectionItem) => {
    setEditing(item);
    setOpenAdd(true);
  };

  // helper: clamp capacity to max
  const clampCapacity = (cap: number) => {
    const n = Number(cap);
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(n, 1), maxCapacity);
  };

  // ✅ CREATE -> DB
  const onCreateSection = async (newItem: SectionItem) => {
    try {
      setIsLoading(true);

      await createSection({
        code: newItem.code,
        yearLevel: (newItem as any).yearLevel,
        program: newItem.program,
        capacity: clampCapacity(newItem.capacity),
        room: newItem.room,
        schedule: newItem.schedule,
        adviser: newItem.adviser ?? "TBA",
        enrolled: newItem.enrolled ?? 0,
      });

      await loadSections();
      showAlert("Section created successfully!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to create section.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATE -> DB
  const onUpdateSection = async (updated: SectionItem) => {
    try {
      setIsLoading(true);

      await updateSection(updated.id, {
        code: updated.code,
        yearLevel: (updated as any).yearLevel,
        program: updated.program,
        capacity: clampCapacity(updated.capacity),
        room: updated.room,
        schedule: updated.schedule,
        adviser: updated.adviser ?? "TBA",
        enrolled: updated.enrolled ?? 0,
      });

      await loadSections();
      showAlert("Section updated successfully!", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to update section.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DELETE -> DB
  const onDeleteSection = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteSection(id);
      await loadSections();
      showAlert("Section deleted successfully.", "success");
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to delete section.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onViewStudents = (item: SectionItem) => {
    showAlert(`View students for ${item.code}`, "success");
  };

  const courseOptions = useMemo(() => {
    const unique = courses.map((c) => c.name);
    return ["All Courses", ...unique];
  }, [courses]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return sections.filter((s) => {
      const matchCourse =
        courseFilter === "All Courses" ? true : s.program === courseFilter;

      const matchQuery =
        query.length === 0
          ? true
          : `${s.code} ${s.program} ${s.adviser}`.toLowerCase().includes(query);

      return matchCourse && matchQuery;
    });
  }, [sections, q, courseFilter]);

  const totals = useMemo(() => {
    const totalSections = sections.length;
    const totalEnrolled = sections.reduce((a, s) => a + (s.enrolled || 0), 0);
    const totalCapacity = sections.reduce((a, s) => a + (s.capacity || 0), 0);
    const utilization =
      totalCapacity === 0
        ? 0
        : Math.round((totalEnrolled / totalCapacity) * 100);

    return { totalSections, totalEnrolled, totalCapacity, utilization };
  }, [sections]);

  const hasCourses = courses.length > 0;

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="registrar-sections-page">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">Sections Management</h2>
            <p className="text-muted mb-0">Create and manage class sections</p>
          </div>

          <button
            className="btn btn-primary btn-lg sections-add-btn"
            onClick={openCreate}
            disabled={isLoading || !hasCourses}
            title={!hasCourses ? "Add courses first before creating sections" : ""}
          >
            <Plus size={18} />
            <span className="ms-2">Add Section</span>
          </button>
        </div>

        <SectionStatsRow
          totalSections={totals.totalSections}
          totalEnrolled={totals.totalEnrolled}
          totalCapacity={totals.totalCapacity}
          utilization={totals.utilization}
        />

        <SectionsToolbar
          query={q}
          onQueryChange={setQ}
          course={courseFilter}
          onCourseChange={setCourseFilter}
          courseOptions={courseOptions}
        />

        {!hasCourses ? (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state">
                <div className="users-empty-icon">📚</div>
                <h5 className="fw-semibold mb-1">No courses available</h5>
                <p className="text-muted mb-0">
                  Please add courses first. Sections require a course and its year levels.
                </p>
              </div>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <SectionsGrid
            items={filtered}
            onDelete={onDeleteSection}
            onEdit={openEdit}
            onViewStudents={onViewStudents}
          />
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No sections found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search/filters or click <b>Add Section</b>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ PASS maxCapacity AND force remount by key */}
        <AddSectionModal
          key={editing ? `edit-${editing.id}` : "create"} // ✅ fixes stale values
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          initial={editing}
          onCreate={onCreateSection}
          onUpdate={onUpdateSection}
          courses={courses}
          maxCapacity={maxCapacity} // ✅ NEW
        />
      </div>
    </>
  );
}