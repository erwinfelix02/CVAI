// ✅ src/pages/DepartmentHead/DepartmentHeadDashboard.tsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import StatCardsRow, {
  type StatCardItem,
} from "../../components/DepartmentHead/Dashboard/StatCard";

import SectionEnrollmentCard, {
  type SectionEnrollmentRow,
} from "../../components/DepartmentHead/Dashboard/SectionEnrollmentCard";

import NeedsAttentionCard, {
  type AttentionRow,
} from "../../components/DepartmentHead/Dashboard/NeedsAttentionCard";

import MySectionRequestsCard, {
  type SectionRequestRow,
} from "../../components/DepartmentHead/Dashboard/MySectionRequestsCard";

import RecentSectionAssignmentsCard, {
  type SectionAssignmentRow,
} from "../../components/DepartmentHead/Dashboard/RecentSectionAssignmentsCard";

import { API_BASE_URL } from "../../config";

import {
  Users,
  UserCheck,
  UserX,
  Layers,
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
     BACK NAVIGATION LOGOUT & COUNTDOWN STATES
     ========================================================= */
  const [showBackLogoutConfirm, setShowBackLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  /* =========================================================
     DYNAMIC DATA STATES & LOADING
     ========================================================= */
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [assignedStudentsCount, setAssignedStudentsCount] = useState<number>(0);
  const [unassignedStudentsCount, setUnassignedStudentsCount] = useState<number>(0);
  const [activeSectionsCount, setActiveSectionsCount] = useState<number>(0);

  const [sectionEnrollments, setSectionEnrollments] = useState<SectionEnrollmentRow[]>([]);
  const [attentionList, setAttentionList] = useState<AttentionRow[]>([]);
  const [sectionRequests, setSectionRequests] = useState<SectionRequestRow[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<SectionAssignmentRow[]>([]);

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
     DYNAMIC DATA FETCHING (Unified Section & Student Count Alignment)
     ========================================================= */
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [studentsRes, sectionsRes, requestsRes, attentionRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students`),
        fetch(`${API_BASE_URL}/sections`),
        fetch(`${API_BASE_URL}/section-requests`),
        fetch(`${API_BASE_URL}/students/attention`),
      ]);

      const rawStudents = studentsRes.ok ? await studentsRes.json() : [];
      const rawSections = sectionsRes.ok ? await sectionsRes.json() : [];
      const rawRequests = requestsRes.ok ? await requestsRes.json() : [];
      const rawAttention = attentionRes.ok ? await attentionRes.json() : [];

      const allStudents = Array.isArray(rawStudents) ? rawStudents : [];
      const allSections = Array.isArray(rawSections) ? rawSections : [];
      const allRequests = Array.isArray(rawRequests) ? rawRequests : [];
      const allAttention = Array.isArray(rawAttention) ? rawAttention : [];

      // 1. Filter students strictly by the signed-in user's department
      const studentsList = userDepartment
        ? allStudents.filter(
            (s: any) =>
              s.department &&
              s.department.trim().toLowerCase() === userDepartment.trim().toLowerCase()
          )
        : allStudents;

      // 2. Filter sections strictly by department
      const sectionsListParsed = userDepartment
        ? allSections.filter(
            (sec: any) =>
              !sec.department ||
              sec.department.trim().toLowerCase() === userDepartment.trim().toLowerCase()
          )
        : allSections;

      setActiveSectionsCount(sectionsListParsed.length);
      setTotalStudentsCount(studentsList.length);

      // 3. Map Section Enrollments and robustly compute student matches
      const mappedSections: SectionEnrollmentRow[] = sectionsListParsed.map((sec: any) => {
        const secName = (sec.name || sec.code || "").trim().toLowerCase();
        const secCode = (sec.code || "").trim().toLowerCase();
        const secId = String(sec._id || sec.id || "").trim();

        const currentEnrolled = studentsList.filter((s: any) => {
          const studentSection = (s.section || "").trim().toLowerCase();
          const studentSectionName = (s.sectionName || "").trim().toLowerCase();
          const studentSectionCode = (s.sectionCode || "").trim().toLowerCase();
          const studentSectionId = String(s.sectionId || s.sectionRef || "").trim();

          return (
            (secName && (studentSection === secName || studentSectionName === secName)) ||
            (secCode && studentSectionCode === secCode) ||
            (secId && studentSectionId === secId)
          );
        }).length;

        return {
          name: sec.code || sec.name || "Section",
          room: sec.room || "",
          schedule: sec.schedule || "",
          current: currentEnrolled,
          max: sec.capacity || 40,
        };
      });

      setSectionEnrollments(mappedSections);

      // 4. Compute exact assigned vs unassigned student counts
      const assignedStudentsCountTotal = studentsList.filter((s: any) => {
        const sec = (s.section || s.sectionName || "").trim();
        return sec && sec !== "" && sec !== "—";
      }).length;

      setAssignedStudentsCount(assignedStudentsCountTotal);
      setUnassignedStudentsCount(Math.max(0, studentsList.length - assignedStudentsCountTotal));

      // 5. Map Attention Items for unassigned students & Transfer/Drop Pending workflows
      const formattedAttention: AttentionRow[] = [];

      // A. Check for workflow-pending students (Transfer Pending / Drop Requested)
      const workflowPendingStudents = studentsList.filter((s: any) => {
        const wf = s.workflowState || "None";
        return wf === "Transfer Pending" || wf === "Drop Requested";
      });

      workflowPendingStudents.forEach((student: any, idx: number) => {
        const studentName = student.fullName || student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
        const studentId = student.studentIdNumber || student.id || student.studentNo || "2024-0000";
        const wfState = student.workflowState;

        formattedAttention.push({
          id: `workflow-${student._id || student.id || idx}`,
          type: "student-card",
          studentName: studentName,
          studentNo: studentId,
          year: `Year ${student.year || student.yearLevel || 1} · ${student.program || "Program"}`,
          reason: wfState === "Transfer Pending" ? "Student requested a department/section transfer" : "Student requested course drop",
          badgeTone: "warning",
          badgeText: wfState,
          onAction: () => navigate("/dept-head/sections", { state: { activeTab: "bulk" } }),
        });
      });

      // B. Check for unassigned students
      const unassignedStudents = studentsList.filter((s: any) => {
        const sec = (s.section || s.sectionName || "").trim();
        const wf = s.workflowState || "None";
        return (!sec || sec === "" || sec === "—") && wf === "None";
      });

      unassignedStudents.forEach((student: any, idx: number) => {
        const studentName = student.fullName || student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
        const studentId = student.studentIdNumber || student.id || student.studentNo || "2024-0000";

        formattedAttention.push({
          id: `unassigned-${student._id || student.id || idx}`,
          type: "warning-banner",
          title: `${studentName} (${studentId})`,
          subtitle: "Needs section assignment",
          actionLabel: "Assign",
          onAction: () => navigate("/dept-head/sections", { state: { activeTab: "bulk" } }),
        });
      });

      allAttention
        .filter(
          (att: any) =>
            !userDepartment ||
            att.department?.trim().toLowerCase() === userDepartment.trim().toLowerCase()
        )
        .forEach((att: any, idx: number) => {
          formattedAttention.push({
            id: `att-${idx}`,
            type: "student-card",
            studentName: att.name || `${att.firstName || ""} ${att.lastName || ""}`.trim(),
            studentNo: att.studentNo || att.idNumber || "2024-0000",
            year: att.year || "Year 1",
            reason: att.reason || "Prerequisites incomplete",
            badgeTone: att.badgeTone || "danger",
            badgeText: att.badgeText || "Blocked",
          });
        });

      setAttentionList(formattedAttention);

      // 6. Map Section Requests with clean naming to show section names instead of IDs
      setSectionRequests(
        allRequests
          .filter(
            (req: any) =>
              !userDepartment ||
              (req.department && req.department.trim().toLowerCase() === userDepartment.trim().toLowerCase())
          )
          .map((req: any) => ({
            id: req._id || req.id,
            student: req.sectionName || req.name || "New Section",
            requestedSection: `${req.program || "Program"} · Year ${req.yearLevel || req.year || 1} (Cap: ${req.requestedCapacity || req.capacity || 40})`,
            status: req.status || "Pending",
          }))
      );

      // 7. Map Recent Assignments
      setRecentAssignments(
        studentsList
          .filter((s: any) => {
            const sec = (s.section || s.sectionName || "").trim();
            return sec && sec !== "" && sec !== "—";
          })
          .slice(-5)
          .reverse()
          .map((s: any) => ({
            student: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || "Student",
            studentNo: s.studentIdNumber || s.studentNo || s.id || "2024-0000",
            section: s.section || s.sectionName,
            assignedDate: s.assignedDate || s.updatedAt || "Today",
          }))
      );
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userDepartment, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo<StatCardItem[]>(
    () => [
      {
        label: "Students in Department",
        value: totalStudentsCount,
        icon: Users,
        tone: "purple",
      },
      {
        label: "Assigned to Sections",
        value: assignedStudentsCount,
        icon: UserCheck,
        tone: "green",
      },
      {
        label: "Unassigned Students",
        value: unassignedStudentsCount,
        icon: UserX,
        tone: "orange",
      },
      {
        label: "Active Sections",
        value: activeSectionsCount,
        icon: Layers,
        tone: "purple-light",
      },
    ],
    [totalStudentsCount, assignedStudentsCount, unassignedStudentsCount, activeSectionsCount]
  );

  return (
    <>
      {/* WELCOME OVERLAY */}
      {showWelcome && (
        <div className={`welcome-overlay ${isWelcomeClosing ? "fade-out" : ""}`}>
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
        <div className="logout-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal">
            <h6>Confirm Log Out</h6>
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
                ? `Department of ${userDepartment} — Student enrollment and section placement at a glance`
                : "Student enrollment and section placement at a glance"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Loader2 className="spinner-border spinner-border-sm text-primary" size={22} />
              <span className="fw-medium">Loading section placement insights...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <StatCardsRow items={stats} />
            </div>

            <div className="row g-3 g-md-4 mb-3 mb-md-4">
              <div className="col-12 col-xl-6">
                <SectionEnrollmentCard
                  title="Section Enrollment"
                  actionLabel="Manage"
                  onManageClick={() => navigate("/dept-head/sections")}
                  rows={sectionEnrollments}
                />
              </div>

              <div className="col-12 col-xl-6">
                <NeedsAttentionCard
                  title="Needs Attention"
                  badgeLabel={`${attentionList.length} ${attentionList.length === 1 ? "Item" : "Items"}`}
                  badgeTone="warning"
                  icon={AlertTriangle}
                  rows={attentionList}
                  actionPath="/dept-head/sections"
                />
              </div>
            </div>

            <div className="row g-3 g-md-4">
              <div className="col-12 col-xl-6">
                <MySectionRequestsCard
                  title="My Section Requests"
                  actionLabel="View All"
                  onViewAllClick={() => navigate("/dept-head/sections", { state: { activeTab: "requests" } })}
                  rows={sectionRequests}
                />
              </div>

              <div className="col-12 col-xl-6">
                <RecentSectionAssignmentsCard
                  title="Recent Section Assignments"
                  actionLabel="View Students"
                  onViewStudentsClick={() => navigate("/dept-head/sections", { state: { activeTab: "bulk" } })}
                  rows={recentAssignments}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}