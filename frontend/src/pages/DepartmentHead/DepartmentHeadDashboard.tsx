// ✅ src/pages/DepartmentHead/DepartmentHeadDashboard.tsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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
import { API_BASE_URL } from "../../config";

import {
  Users,
  BookOpen,
  CalendarDays,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import "../../styles/department-headDashboard.css";

export default function DepartmentHeadDashboard() {
  const navigate = useNavigate();

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
     BACK NAVIGATION LOGOUT & COUNTDOWN STATES
     ========================================================= */
  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  /* =========================================================
     DYNAMIC DATA STATES & LOADING
     ========================================================= */

  const [facultyCount, setFacultyCount] = useState<number>(0);
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [activeScheduleCount, setActiveScheduleCount] = useState<number>(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState<number>(0);

  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [teachingLoads, setTeachingLoads] = useState<TeachingLoadRow[]>([]);
  const [conflictsList, setConflictsList] = useState<ConflictRow[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<AssignmentRow[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* =========================================================
     GET SIGNED-IN USER'S DEPARTMENT & PROFILE
     ========================================================= */

  const currentUser = useMemo(() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }, []);

  const userDepartment = currentUser?.department || "";

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
     INTERCEPT BACK BUTTON (Trigger Logout Confirmation)
     ========================================================= */
  useEffect(() => {
    if (!window.history.state || !window.history.state.guarded) {
      window.history.pushState({ guarded: true }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowBackLogoutConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  /* =========================================================
     LOGOUT AUDIT & COUNTDOWN HANDLERS
     ========================================================= */
  const logLogoutActivity = async () => {
    try {
      const userEmail = currentUser?.email || "departmenthead@example.com";
      const userRole = currentUser?.role || "Department Head";

      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("token") ||
            localStorage.getItem("sessionToken") ||
            ""
          }`,
        },
        body: JSON.stringify({
          action: "Logout",
          user: userEmail,
          role: userRole,
          type: "Security",
          details: `${userEmail} logged out of the department head portal via back navigation.`,
          status: "success",
        }),
      });
    } catch (err) {
      console.error("Failed to log department head logout activity:", err);
    }
  };

  const handleBackLogoutConfirm = () => {
    setShowBackLogoutConfirm(false);
    setIsLoggingOut(true);
    setLogoutCountdown(3);
  };

  useEffect(() => {
    if (!isLoggingOut) return;

    if (logoutCountdown <= 0) {
      async function finalizeLogout() {
        await logLogoutActivity();

        // Clear session tokens
        localStorage.removeItem("token");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");

        setIsLoggingOut(false);
        navigate("/signin", { replace: true });
      }

      finalizeLogout();
      return;
    }

    const timer = setTimeout(() => {
      setLogoutCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoggingOut, logoutCountdown, navigate]);

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
          fetch(`${API_BASE_URL}/users/faculty${queryParam}`),
          fetch(`${API_BASE_URL}/subjects${queryParam}`),
          fetch(`${API_BASE_URL}/schedules${queryParam}`),
          fetch(`${API_BASE_URL}/rooms${queryParam}`),
          fetch(`${API_BASE_URL}/schedules/conflicts${queryParam}`),
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

      setSchedulesList(parsedSchedulesList);

      setFacultyCount(facultyList.length);
      setSubjectCount(subjectsList.length);
      setActiveScheduleCount(parsedSchedulesList.length);
      setAvailableRoomsCount(
        roomsList.filter(
          (r: any) => r.status?.toLowerCase() === "available" || r.isAvailable,
        ).length || roomsList.length,
      );

      const subjectUnitsMap = new Map<string, number>();
      subjectsList.forEach((sub: any) => {
        if (sub.code) {
          subjectUnitsMap.set(sub.code.trim().toUpperCase(), sub.units || 3);
        }
      });

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

      const mappedRecent: AssignmentRow[] = parsedSchedulesList
        .slice(-5)
        .reverse()
        .map((sch: any) => ({
          subject: `${sch.code || "SUBJ"} ${sch.title || "Subject"}`,
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

      {/* BACK NAVIGATION LOGOUT CONFIRMATION MODAL */}
      {showBackLogoutConfirm && (
        <div
          className="logout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="back-logout-title"
        >
          <div className="logout-modal">
            <h6 id="back-logout-title">Confirm Log Out</h6>
            <p>Going back will log you out of your session. Are you sure?</p>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowBackLogoutConfirm(false);
                  window.history.pushState({ guarded: true }, "", window.location.href);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleBackLogoutConfirm}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGGING OUT OVERLAY WITH COUNTDOWN */}
      {isLoggingOut && (
        <div className="logging-out-overlay" role="status" aria-live="polite">
          <div className="logging-out-box">
            <div className="logging-spinner" aria-hidden="true" />
            <h5>Logging out...</h5>
            <p>
              Redirecting in {logoutCountdown} second
              {logoutCountdown !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className="department-head-dashboard">
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
            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <StatCardsRow items={stats} />
            </div>

            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <div className="col-12 col-xl-6">
                <TeachingLoadsCard
                  title="Faculty Teaching Loads"
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

            <div className="row g-3 g-md-4">
              <div className="col-12">
                <RecentAssignmentsCard
                  title="Recent Schedule Assignments"
                  rows={recentAssignments}
                />
              </div>
            </div>
          </>
        )}
      </div>

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