// ✅ src/pages/DepartmentHead/DepartmentHeadDashboard.tsx
import { useMemo } from "react";
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
} from "lucide-react";

export default function DepartmentHeadDashboard() {
  const stats = useMemo<StatCardItem[]>(
    () => [
      { label: "Total Faculty", value: 24, icon: Users, tone: "purple" },
      { label: "Subjects", value: 48, icon: BookOpen, tone: "blue" },
      { label: "Active Schedules", value: 156, icon: CalendarDays, tone: "green" },
      { label: "Available Rooms", value: 12, icon: DoorOpen, tone: "orange" },
    ],
    []
  );

  // ✅ FIX: tone is now typed correctly ("ok" | "danger")
  const loads = useMemo<TeachingLoadRow[]>(
    () => [
      { name: "Dr. John Smith", dept: "Database Systems", current: 18, max: 21, tone: "ok" },
      { name: "Prof. Maria Garcia", dept: "Web Development", current: 21, max: 21, tone: "danger" },
      { name: "Dr. Robert Lee", dept: "Data Structures", current: 15, max: 21, tone: "ok" },
      { name: "Prof. Sarah Chen", dept: "Software Engineering", current: 12, max: 21, tone: "ok" },
    ],
    []
  );

  const conflicts = useMemo<ConflictRow[]>(
    () => [
      {
        room: "Room 301",
        time: "MWF 9:00-10:30",
        details: "Conflicting subjects: CSPC 101 & ITPC 202",
      },
      {
        room: "Lab 2",
        time: "TTh 1:00-2:30",
        details: "Conflicting subjects: CSPC 305 & CSPC 310",
      },
    ],
    []
  );

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

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Department Head Dashboard</h1>
        <p className="text-muted mb-0">
          Manage faculty assignments, schedules, and room allocations
        </p>
      </div>

      {/* Stats */}
      <StatCardsRow items={stats} />

      {/* Middle grid */}
      <div className="row g-4 mt-1">
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

      {/* Recent assignments */}
      <div className="mt-4">
        <RecentAssignmentsCard
          title="Recent Schedule Assignments"
          actionLabel="Manage Schedules"
          actionIcon={ArrowRight}
          rows={recent}
        />
      </div>
    </div>
  );
}
