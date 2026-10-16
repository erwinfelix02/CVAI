import { useMemo, useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import AuthAlert from "../../components/Authentication/AuthAlert";

import SectionStatsRow from "../../components/Registrar/Sections/SectionStatsRow";
import SectionsToolbar from "../../components/Registrar/Sections/SectionsToolbar";
import SectionsGrid from "../../components/Registrar/Sections/SectionsGrid";
import AddSectionModal from "../../components/Registrar/Sections/AddSectionModal";
import ViewStudentsModal from "../../components/Registrar/Sections/ViewStudentsModal";
import ExportSectionsModal from "../../components/Registrar/Sections/ExportSectionsModal";
import SectionRequestsCard from "../../components/Registrar/Sections/SectionRequestsCard";

import type { SectionItem, SectionRequest } from "../../components/Registrar/Sections/types";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionRequests,
  approveSectionRequest,
  rejectSectionRequest,
} from "../../api/sectionService";

import { getCourses } from "../../api/courseService";
import { API_BASE_URL } from "../../config";

import "../../styles/registrar-sections.css";

type CourseOption = {
  id: string;
  code: string;
  name: string;
  department: string;
  yearLevels: number;
  status: "Active" | "Inactive";
};

export default function SectionsManagementPage() {
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("All Courses");

  const [openAdd, setOpenAdd] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [editing, setEditing] = useState<SectionItem | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<SectionRequest | null>(null);

  const [viewingStudentsSection, setViewingStudentsSection] = useState<SectionItem | null>(null);

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [requests, setRequests] = useState<SectionRequest[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

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

  const loadRegistrarSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/registrar/settings`);
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
            department: c.department || "",
            yearLevels: Number(c.yearLevels ?? 4),
            status,
          };
        })
        .filter((c) => c.status === "Active");

      setCourses(mapped);
    } catch (err: any) {
      console.error(err);
      setCourses([]);
      showAlert(err.response?.data?.message || "Failed to load courses.", "error");
    }
  };

  const loadSections = async () => {
    try {
      const data = await getSections();

      const mapped: SectionItem[] = (Array.isArray(data) ? data : []).map(
        (s: any) => ({
          id: s._id,
          code: s.code,
          yearLevel: s.yearLevel,
          program:
            typeof s.program === "object"
              ? s.program.name
              : s.program,
          department: s.department || "",
          room: s.room,
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

  const loadRequests = async () => {
    try {
      const data = await getSectionRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load section requests:", err);
      setRequests([]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          loadRegistrarSettings(),
          loadCourses(),
          loadSections(),
          loadRequests(),
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setApprovingRequest(null);
    setOpenAdd(true);
  };

  const openEdit = (item: SectionItem) => {
    setEditing(item);
    setApprovingRequest(null);
    setOpenAdd(true);
  };

  const handleOpenApproveFromRequest = (req: SectionRequest) => {
    setApprovingRequest(req);
    setEditing(null);
    setOpenAdd(true);
  };

  const clampCapacity = (cap: number) => {
    const n = Number(cap);
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(n, 1), maxCapacity);
  };

  const onCreateSection = async (newItem: SectionItem) => {
    try {
      setIsLoading(true);

      if (approvingRequest) {
        await approveSectionRequest(approvingRequest.id, newItem.room);
        await Promise.all([loadSections(), loadRequests()]);
        showAlert("Section request approved and created successfully!", "success");
      } else {
        await createSection({
          code: newItem.code,
          yearLevel: (newItem as any).yearLevel,
          program: newItem.program,
          department: newItem.department,
          capacity: clampCapacity(newItem.capacity),
          room: newItem.room,
          enrolled: newItem.enrolled ?? 0,
        });
        await loadSections();
        showAlert("Section created successfully!", "success");
      }
    } catch (err: any) {
      showAlert(
        err.response?.data?.message || "Failed to create section.",
        "error",
      );
    } finally {
      setIsLoading(false);
      setApprovingRequest(null);
    }
  };

  const onUpdateSection = async (updated: SectionItem) => {
    try {
      setIsLoading(true);

      await updateSection(updated.id, {
        code: updated.code,
        yearLevel: (updated as any).yearLevel,
        program: updated.program,
        department: updated.department,
        capacity: clampCapacity(updated.capacity),
        room: updated.room,
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

  const handleRejectRequest = async (requestId: string, feedback: string) => {
    try {
      setIsLoading(true);
      await rejectSectionRequest(requestId, feedback);
      await loadRequests();
      showAlert("Section request returned/rejected.", "success");
    } catch (err: any) {
      showAlert(err.response?.data?.message || "Failed to reject request.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onViewStudents = (item: SectionItem) => {
    setViewingStudentsSection(item);
  };

  const courseOptions = useMemo(() => {
    const unique = courses.map((c) => c.name);
    return ["All Courses", ...Array.from(new Set(unique))];
  }, [courses]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const result = sections.filter((s) => {
      const matchCourse =
        courseFilter === "All Courses" ? true : s.program === courseFilter;

      const matchQuery =
        query.length === 0
          ? true
          : `${s.code} ${s.program} ${s.department || ""}`.toLowerCase().includes(query);

      return matchCourse && matchQuery;
    });

    return result.sort((a, b) => a.code.localeCompare(b.code));
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

  const modalInitialData = useMemo(() => {
    if (editing) return editing;
    if (approvingRequest) {
      const yNum = Number(approvingRequest.yearLevel) || 1;
      const suffix = yNum === 1 ? "st" : yNum === 2 ? "nd" : yNum === 3 ? "rd" : "th";
      const yearLabelStr = `${yNum}${suffix} Year`;

      const matchingCourse = courses.find((c) => c.name === approvingRequest.program);

      return {
        id: approvingRequest.id,
        code: approvingRequest.sectionName || approvingRequest.code || "",
        program: approvingRequest.program || "",
        department: matchingCourse?.department || "",
        yearLevel: yearLabelStr,
        capacity: approvingRequest.requestedCapacity || approvingRequest.capacity || 45,
        room: approvingRequest.preferredRoom || approvingRequest.room || "",
        enrolled: 0,
        _isRequestApproval: true, // <--- Flag to mark this as an approval action
      } as unknown as SectionItem;
    }
    return null;
  }, [editing, approvingRequest, courses]);

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={isLoading}
      />

      <div className="registrar-sections-page container-fluid px-3 px-md-4 py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">Sections Management</h2>
            <p className="text-muted mb-0">Create and manage class sections</p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              className="btn btn-outline-secondary btn-lg d-flex align-items-center"
              onClick={() => setOpenExport(true)}
              disabled={isLoading || sections.length === 0}
            >
              <Download size={18} />
              <span className="ms-2">Export</span>
            </button>

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
        </div>

        <SectionRequestsCard
          requests={requests}
          onApproveClick={handleOpenApproveFromRequest}
          onReject={handleRejectRequest}
        />

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

        {isLoading && sections.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 text-center text-muted">
              Loading sections...
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <SectionsGrid
            items={filtered}
            onDelete={onDeleteSection}
            onEdit={openEdit}
            onViewStudents={onViewStudents}
          />
        ) : !hasCourses ? (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state text-center py-5">
                <div className="users-empty-icon fs-1 mb-2">📚</div>
                <h5 className="fw-semibold mb-1">No courses available</h5>
                <p className="text-muted mb-0">
                  Please add courses first. Sections require a course and its year levels.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="users-empty-state text-center py-5">
                <div className="users-empty-icon fs-1 mb-2">📭</div>
                <h5 className="fw-semibold mb-1">No sections found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search/filters or click <b>Add Section</b>.
                </p>
              </div>
            </div>
          </div>
        )}

        <AddSectionModal
          key={editing ? `edit-${editing.id}` : approvingRequest ? `approve-${approvingRequest.id}` : "create"}
          open={openAdd}
          onClose={() => {
            setOpenAdd(false);
            setApprovingRequest(null);
          }}
          initial={modalInitialData}
          onCreate={onCreateSection}
          onUpdate={onUpdateSection}
          courses={courses}
          maxCapacity={maxCapacity}
        />

        <ViewStudentsModal
          open={Boolean(viewingStudentsSection)}
          onClose={() => setViewingStudentsSection(null)}
          section={viewingStudentsSection}
        />

        <ExportSectionsModal
          open={openExport}
          onClose={() => setOpenExport(false)}
          sections={sections}
          onSuccess={(msg) => showAlert(msg, "success")}
          onError={(msg) => showAlert(msg, "error")}
        />
      </div>
    </>
  );
}