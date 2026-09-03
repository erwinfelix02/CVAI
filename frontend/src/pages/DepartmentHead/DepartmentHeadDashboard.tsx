// ✅ src/pages/DepartmentHead/DepartmentHeadDashboard.tsx

import { useEffect, useMemo, useState, useCallback } from "react";

import StatCardsRow, {
  type StatCardItem,
} from "../../components/DepartmentHead/Dashboard/StatCard";

import TeachingLoadsCard, {
  type TeachingLoadRow,
} from "../../components/DepartmentHead/Dashboard/TeachingLoadsCard";

import ScheduleConflictsCard, {
  type ConflictRow,
} from "../../components/DepartmentHead/Dashboard/ScheduleConflictsCard";

import RecentAssignmentsCard, {
  type AssignmentRow,
} from "../../components/DepartmentHead/Dashboard/RecentAssignmentsCard";

import ResolveConflictsModal from "../../components/DepartmentHead/Dashboard/ResolveConflictsModal";

import {
  Users,
  BookOpen,
  CalendarDays,
  DoorOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import "../../styles/department-headDashboard.css";

export default function DepartmentHeadDashboard() {
  /* =========================================================
     WELCOME MESSAGE
     ========================================================= */

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeClosing, setIsWelcomeClosing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  /* =========================================================
     RESOLVE CONFLICTS MODAL STATE
     ========================================================= */

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  /* =========================================================
     DYNAMIC DATA STATES & LOADING
     ========================================================= */

  const [facultyCount, setFacultyCount] = useState<number>(0);
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [activeScheduleCount, setActiveScheduleCount] = useState<number>(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState<number>(0);

  const [schedulesList, setSchedulesList] = useState<any[]>([]); // Track raw schedule records
  const [teachingLoads, setTeachingLoads] = useState<TeachingLoadRow[]>([]);
  const [conflictsList, setConflictsList] = useState<ConflictRow[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<AssignmentRow[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* =========================================================
     GET SIGNED-IN USER'S DEPARTMENT
     ========================================================= */

  const userDepartment = useMemo(() => {
    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;
    return currentUser?.department || "";
  }, []);

  /* =========================================================
     SHOW WELCOME MESSAGE AFTER LOGIN
     ========================================================= */

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");

    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);

      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  /* =========================================================
     AUTO CLOSE WELCOME MESSAGE
     ========================================================= */

  useEffect(() => {
    if (!showWelcome) return;

    const fadeTimer = setTimeout(() => {
      setIsWelcomeClosing(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsWelcomeClosing(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [showWelcome]);

  /* =========================================================
     DYNAMIC DATA FETCHING BASED ON DEPARTMENT
     ========================================================= */

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    const queryParam = userDepartment
      ? `?department=${encodeURIComponent(userDepartment)}`
      : "";

    try {
      const [facultyRes, subjectsRes, schedulesRes, roomsRes, conflictsRes] =
        await Promise.all([
          fetch(`/api/users/faculty${queryParam}`),
          fetch(`/api/subjects${queryParam}`),
          fetch(`/api/schedules${queryParam}`),
          fetch(`/api/rooms${queryParam}`),
          fetch(`/api/schedules/conflicts${queryParam}`),
        ]);

      const rawFaculty = facultyRes.ok ? await facultyRes.json() : [];
      const rawSubjects = subjectsRes.ok ? await subjectsRes.json() : [];
      const rawSchedules = schedulesRes.ok ? await schedulesRes.json() : [];
      const rawRooms = roomsRes.ok ? await roomsRes.json() : [];
      const rawConflicts = conflictsRes.ok ? await conflictsRes.json() : [];

      const facultyList = Array.isArray(rawFaculty) ? rawFaculty : [];
      const subjectsList = Array.isArray(rawSubjects) ? rawSubjects : [];
      const parsedSchedulesList = Array.isArray(rawSchedules) ? rawSchedules : [];
      const roomsList = Array.isArray(rawRooms) ? rawRooms : [];

      // Save raw schedule list for computing conflict-free targets
      setSchedulesList(parsedSchedulesList);

      // 1. STATS COMPUTATION
      setFacultyCount(facultyList.length);
      setSubjectCount(subjectsList.length);
      setActiveScheduleCount(parsedSchedulesList.length);
      setAvailableRoomsCount(
        roomsList.filter(
          (r: any) => r.status?.toLowerCase() === "available" || r.isAvailable,
        ).length || roomsList.length,
      );

      // Subject Units Map
      const subjectUnitsMap = new Map<string, number>();
      subjectsList.forEach((sub: any) => {
        if (sub.code) {
          subjectUnitsMap.set(sub.code.trim().toUpperCase(), sub.units || 3);
        }
      });

      // 2. TEACHING LOADS COMPUTATION
      const mappedLoads: TeachingLoadRow[] = facultyList.map((member: any) => {
        const facultyName =
          member.name ||
          `${member.firstName || ""} ${member.lastName || ""}`.trim();

        const assignedSchedules = parsedSchedulesList.filter(
          (sch: any) =>
            sch.faculty?.trim().toLowerCase() ===
            facultyName.trim().toLowerCase(),
        );

        const currentUnits = assignedSchedules.reduce(
          (acc: number, sch: any) => {
            const units =
              subjectUnitsMap.get(sch.code?.trim().toUpperCase()) || 3;
            return acc + units;
          },
          0,
        );

        const maxUnits = member.maxLoad || 21;

        return {
          name: facultyName,
          dept:
            member.specialization ||
            member.department ||
            userDepartment ||
            "General",
          current: currentUnits,
          max: maxUnits,
          tone: currentUnits >= maxUnits ? "danger" : "ok",
        };
      });

      setTeachingLoads(mappedLoads);

      // 3. SCHEDULE CONFLICTS COMPUTATION
      if (Array.isArray(rawConflicts) && rawConflicts.length > 0) {
        setConflictsList(
          rawConflicts.map((c: any) => ({
            room: c.room,
            time: c.time,
            details: c.details,
            schedules: c.schedules,
          })),
        );
      } else {
        // Fallback Client Computation (Uses days + time from Schedule model)
        const roomTimeMap = new Map<string, any[]>();
        parsedSchedulesList.forEach((sch: any) => {
          if (sch.room && (sch.days || sch.time)) {
            const timeSlot = `${sch.days || ""} ${sch.time || ""}`.trim();
            const key = `${sch.room.trim().toLowerCase()}__${timeSlot.toLowerCase()}`;
            if (!roomTimeMap.has(key)) {
              roomTimeMap.set(key, []);
            }
            roomTimeMap.get(key)!.push(sch);
          }
        });

        const fallbackConflicts: ConflictRow[] = [];
        roomTimeMap.forEach((schedules) => {
          if (schedules.length > 1) {
            const roomName = schedules[0].room;
            const timeSlot =
              `${schedules[0].days || ""} ${schedules[0].time || ""}`.trim();
            const subjectCodes = Array.from(
              new Set(schedules.map((s: any) => s.code || s.title)),
            ).join(" & ");

            fallbackConflicts.push({
              room: roomName,
              time: timeSlot,
              details: `Conflicting subjects: ${subjectCodes}`,
              schedules,
            });
          }
        });

        setConflictsList(fallbackConflicts);
      }

      // 4. RECENT ASSIGNMENTS COMPUTATION
      const mappedRecent: AssignmentRow[] = parsedSchedulesList
        .slice(-5)
        .reverse()
        .map((sch: any) => ({
          subject: `${sch.code || "SUBJ"} - ${sch.title || "Subject"}`,
          instructor: sch.faculty || "Unassigned",
          room: sch.room || "TBA",
          schedule: `${sch.days || ""} ${sch.time || ""}`.trim() || "TBA",
        }));

      setRecentAssignments(mappedRecent);
    } catch (err) {
      console.error("Error fetching department dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userDepartment]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* =========================================================
     COMPUTED STATS
     ========================================================= */

  const stats = useMemo<StatCardItem[]>(
    () => [
      {
        label: "Total Faculty",
        value: facultyCount,
        icon: Users,
        tone: "purple",
      },
      {
        label: "Subjects",
        value: subjectCount,
        icon: BookOpen,
        tone: "blue",
      },
      {
        label: "Active Schedules",
        value: activeScheduleCount,
        icon: CalendarDays,
        tone: "green",
      },
      {
        label: "Available Rooms",
        value: availableRoomsCount,
        icon: DoorOpen,
        tone: "orange",
      },
    ],
    [facultyCount, subjectCount, activeScheduleCount, availableRoomsCount],
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* WELCOME OVERLAY */}
      {showWelcome && (
        <div
          className={`welcome-overlay ${isWelcomeClosing ? "fade-out" : ""}`}
        >
          <div className={`welcome-box ${isWelcomeClosing ? "fade-out" : ""}`}>
            <div className="welcome-icon-wrap">
              <CheckCircle2 size={34} />
            </div>

            <h4>{welcomeMessage}</h4>

            <p>You have successfully signed in.</p>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className="department-head-dashboard">
        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">Department Head Dashboard</h2>

            <p className="text-muted mb-0">
              {userDepartment
                ? `Department of ${userDepartment} — Overview of faculty, schedules, and rooms`
                : "Manage faculty assignments, schedules, and room allocations"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Loader2
                className="spinner-border spinner-border-sm text-primary"
                size={22}
              />
              <span className="fw-medium">
                Loading department dashboard insights...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <StatCardsRow items={stats} />
            </div>

            {/* TEACHING LOADS + SCHEDULE CONFLICTS */}
            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <div className="col-12 col-xl-6">
                <TeachingLoadsCard
                  title="Faculty Teaching Loads"
                  actionLabel="View All"
                  actionIcon={ArrowRight}
                  rows={teachingLoads}
                />
              </div>

              <div className="col-12 col-xl-6">
                <ScheduleConflictsCard
                  title="Schedule Conflicts"
                  badgeLabel={
                    conflictsList.length > 0
                      ? `${conflictsList.length} ${conflictsList.length === 1 ? "Issue" : "Issues"}`
                      : "0 Issues"
                  }
                  badgeTone={conflictsList.length > 0 ? "warning" : "info"}
                  icon={AlertTriangle}
                  rows={conflictsList}
                  actionLabel="Resolve Conflicts"
                  onResolveClick={() => setIsResolveModalOpen(true)}
                />
              </div>
            </div>

            {/* RECENT ASSIGNMENTS */}
            <div className="row g-3 g-md-4">
              <div className="col-12">
                <RecentAssignmentsCard
                  title="Recent Schedule Assignments"
                  actionLabel="Manage Schedules"
                  actionIcon={ArrowRight}
                  rows={recentAssignments}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* RESOLVE SCHEDULE CONFLICTS MODAL */}
      <ResolveConflictsModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        rawConflicts={conflictsList}
        allSchedules={schedulesList}
        onResolutionsApplied={fetchDashboardData}
      />
    </>
  );
}