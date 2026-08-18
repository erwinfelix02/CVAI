// ✅ src/pages/DepartmentHead/DepartmentHeadDashboard.tsx

import { useEffect, useMemo, useState } from "react";

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

import {
  Users,
  BookOpen,
  CalendarDays,
  DoorOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
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
     SHOW WELCOME MESSAGE AFTER LOGIN
     ========================================================= */

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");

    if (message) {
      setWelcomeMessage(message);
      setShowWelcome(true);
      setIsWelcomeClosing(false);

      // Prevent the welcome message from appearing again
      // when the user refreshes the dashboard.
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  /* =========================================================
     AUTO CLOSE WELCOME MESSAGE
     ========================================================= */

  useEffect(() => {
    if (!showWelcome) return;

    // Start fade-out
    const fadeTimer = setTimeout(() => {
      setIsWelcomeClosing(true);
    }, 1800);

    // Completely remove overlay
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
     STATISTICS
     ========================================================= */

  const stats = useMemo<StatCardItem[]>(
    () => [
      {
        label: "Total Faculty",
        value: 24,
        icon: Users,
        tone: "purple",
      },
      {
        label: "Subjects",
        value: 48,
        icon: BookOpen,
        tone: "blue",
      },
      {
        label: "Active Schedules",
        value: 156,
        icon: CalendarDays,
        tone: "green",
      },
      {
        label: "Available Rooms",
        value: 12,
        icon: DoorOpen,
        tone: "orange",
      },
    ],
    []
  );

  /* =========================================================
     FACULTY TEACHING LOADS
     ========================================================= */

  const loads = useMemo<TeachingLoadRow[]>(
    () => [
      {
        name: "Dr. John Smith",
        dept: "Database Systems",
        current: 18,
        max: 21,
        tone: "ok",
      },
      {
        name: "Prof. Maria Garcia",
        dept: "Web Development",
        current: 21,
        max: 21,
        tone: "danger",
      },
      {
        name: "Dr. Robert Lee",
        dept: "Data Structures",
        current: 15,
        max: 21,
        tone: "ok",
      },
      {
        name: "Prof. Sarah Chen",
        dept: "Software Engineering",
        current: 12,
        max: 21,
        tone: "ok",
      },
    ],
    []
  );

  /* =========================================================
     SCHEDULE CONFLICTS
     ========================================================= */

  const conflicts = useMemo<ConflictRow[]>(
    () => [
      {
        room: "Room 301",
        time: "MWF 9:00-10:30",
        details:
          "Conflicting subjects: CSPC 101 & ITPC 202",
      },
      {
        room: "Lab 2",
        time: "TTh 1:00-2:30",
        details:
          "Conflicting subjects: CSPC 305 & CSPC 310",
      },
    ],
    []
  );

  /* =========================================================
     RECENT ASSIGNMENTS
     ========================================================= */

  const recent = useMemo<AssignmentRow[]>(
    () => [
      {
        subject: "CSPC 101 - Intro to Programming",
        instructor: "Dr. John Smith",
        room: "Room 301",
        schedule: "MWF 8:00-9:00",
      },
      {
        subject: "ITPC 202 - Web Development",
        instructor: "Prof. Maria Garcia",
        room: "Lab 1",
        schedule: "TTh 10:00-11:30",
      },
      {
        subject: "CSPC 305 - Database Systems",
        instructor: "Dr. Robert Lee",
        room: "Room 405",
        schedule: "MWF 1:00-2:00",
      },
    ],
    []
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =====================================================
          WELCOME OVERLAY
          ===================================================== */}

      {showWelcome && (
        <div
          className={`welcome-overlay ${
            isWelcomeClosing ? "fade-out" : ""
          }`}
        >
          <div
            className={`welcome-box ${
              isWelcomeClosing ? "fade-out" : ""
            }`}
          >
            <div className="welcome-icon-wrap">
              <CheckCircle2 size={34} />
            </div>

            <h4>{welcomeMessage}</h4>

            <p>
              You have successfully signed in.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          DASHBOARD
          ===================================================== */}

      <div className="department-head-dashboard">
        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
          <div>
            <h2 className="fw-bold mb-1">
              Department Head Dashboard
            </h2>

            <p className="text-muted mb-0">
              Manage faculty assignments, schedules, and room
              allocations
            </p>
          </div>
        </div>

        {/* ===================================================
            STAT CARDS
            =================================================== */}

        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          <StatCardsRow items={stats} />
        </div>

        {/* ===================================================
            TEACHING LOADS + SCHEDULE CONFLICTS
            =================================================== */}

        <div className="row g-3 g-md-4 mb-3 mb-md-4">
          <div className="col-12 col-xl-6">
            <TeachingLoadsCard
              title="Faculty Teaching Loads"
              actionLabel="View All"
              actionIcon={ArrowRight}
              rows={loads}
            />
          </div>

          <div className="col-12 col-xl-6">
            <ScheduleConflictsCard
              title="Schedule Conflicts"
              badgeLabel="2 Issues"
              badgeTone="warning"
              icon={AlertTriangle}
              rows={conflicts}
              actionLabel="Resolve Conflicts"
            />
          </div>
        </div>

        {/* ===================================================
            RECENT ASSIGNMENTS
            =================================================== */}

        <div className="row g-3 g-md-4">
          <div className="col-12">
            <RecentAssignmentsCard
              title="Recent Schedule Assignments"
              actionLabel="Manage Schedules"
              actionIcon={ArrowRight}
              rows={recent}
            />
          </div>
        </div>
      </div>
    </>
  );
}