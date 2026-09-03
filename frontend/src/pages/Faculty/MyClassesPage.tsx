import { useEffect, useState, useMemo, useCallback } from "react";
import ClassCard from "../../components/Faculty/Classes/ClassCard";
import type { ClassItem } from "../../components/Faculty/Classes/types";
import { CalendarDays, Loader2, AlertCircle } from "lucide-react";
import "../../styles/faculty-classes.css";

const ACCENTS: ClassItem["accent"][] = ["blue", "purple", "green", "orange"];

export default function AssignedClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic registrar settings state
  const [currentSemester, setCurrentSemester] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");

  // Retrieve current user details from localStorage
  const user = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchAssignedClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params based on logged-in user
      const facultyName =
        user?.name ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      const department = user?.department || "";

      const queryParams = new URLSearchParams();
      if (facultyName) queryParams.append("faculty", facultyName);
      if (department) queryParams.append("department", department);

      // Fetch registrar settings, assigned schedules, and room capacities in parallel with individual error handling
      const [settingsRes, schedulesRes, roomsRes] = await Promise.all([
        fetch("/api/registrar-settings").catch((err) => {
          console.error("Registrar settings fetch failed:", err);
          return null;
        }),
        fetch(`/api/schedules?${queryParams.toString()}`),
        fetch(`/api/rooms${department ? `?department=${encodeURIComponent(department)}` : ""}`).catch(() => null),
      ]);

      // 1. Parse Registrar Settings for current semester & academic year
      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCurrentSemester(settingsData?.semester || "1st Semester");
        setAcademicYear(settingsData?.academicYear || "2024-2025");
      } else {
        console.warn("Could not retrieve registrar settings, applying fallback.");
        setCurrentSemester("1st Semester");
        setAcademicYear("2024-2025");
      }

      // 2. Parse Schedules
      if (!schedulesRes.ok) {
        throw new Error("Failed to load assigned schedules.");
      }

      const schedulesData = await schedulesRes.json();
      const roomsData = roomsRes && roomsRes.ok ? await roomsRes.json() : [];

      // Map room names to capacities
      const roomCapacityMap = new Map<string, number>();
      if (Array.isArray(roomsData)) {
        roomsData.forEach((room: any) => {
          if (room.name) {
            roomCapacityMap.set(
              room.name.trim().toLowerCase(),
              room.seats || 40
            );
          }
        });
      }

      // Format raw schedule items to ClassItem model
      const formattedClasses: ClassItem[] = (
        Array.isArray(schedulesData) ? schedulesData : []
      ).map((sch: any, idx: number) => {
        const roomCapacity =
          roomCapacityMap.get(sch.room?.trim().toLowerCase()) || 40;
        const enrolledStudents = sch.students ?? 0;

        return {
          id: sch._id || `class-${idx}`,
          code: sch.code || "N/A",
          title: sch.title || "Untitled Course",
          section: sch.section || "Section A",
          schedule: `${sch.days || ""} ${sch.time || ""}`.trim() || "TBA",
          room: sch.room || "TBA",
          students: enrolledStudents,
          capacity: roomCapacity,
          progress: sch.progress ?? 0,
          accent: ACCENTS[idx % ACCENTS.length],
          assigned: true,
        };
      });

      setClasses(formattedClasses);
    } catch (err: any) {
      console.error("Error fetching faculty classes:", err);
      setError(err.message || "Failed to load assigned classes.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedClasses();
  }, [fetchAssignedClasses]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const assignedCourses = classes.length;
    const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
    const rooms = new Set(
      classes.map((c) => c.room).filter((r) => r && r !== "TBA")
    ).size;
    const hoursPerWeek = classes.length * 3; // Standard 3 hours per course schedule

    return { assignedCourses, totalStudents, rooms, hoursPerWeek };
  }, [classes]);

  return (
    <div className="container-fluid faculty-classes-scope">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
        <div>
          <h3 className="fw-bold mb-1">My Assigned Classes</h3>
          <p className="text-muted mb-0">
            View your assigned courses and schedules from the admin
          </p>
        </div>

        {/* Dynamic Semester Badge */}
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 faculty-semester-pill"
        >
          <CalendarDays size={16} />
          {currentSemester || academicYear
            ? `${currentSemester} ${academicYear}`.trim()
            : "Loading Semester..."}
        </button>
      </div>

      {/* Info Banner */}
      <div className="card shadow-sm faculty-info-banner mb-3 mb-md-4">
        <div className="card-body d-flex gap-3 align-items-start">
          <div className="info-icon">
            <CalendarDays size={20} />
          </div>
          <div className="minw-0">
            <div className="fw-semibold">
              Schedules are assigned by the administration
            </div>
            <div className="text-muted small">
              Contact the admin office for schedule changes or course assignment requests
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3 mb-md-4">
        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.assignedCourses}</div>
              <div className="mini-stat-label">Assigned Courses</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.totalStudents}</div>
              <div className="mini-stat-label">Total Students</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.rooms}</div>
              <div className="mini-stat-label">Rooms</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.hoursPerWeek}</div>
              <div className="mini-stat-label">Hours/Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid / Loading / Error State */}
      {isLoading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2 className="spinner-border spinner-border-sm text-primary" size={22} />
            <span className="fw-medium">Loading assigned classes...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : classes.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <p className="mb-0 fs-6">No assigned classes found for this semester.</p>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {classes.map((item) => (
            <div key={item.id} className="col-12 col-lg-6">
              <ClassCard
                item={item}
                onStudents={() => console.log("Students:", item.id)}
                onMaterials={() => console.log("Materials:", item.id)}
                onGrades={() => console.log("Grades:", item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}