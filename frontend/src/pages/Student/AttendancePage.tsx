import "../../styles/attendance.css";
import StatCard from "../../components/Student/Attendance/StatCard";
import AttendanceBySubject from "../../components/Student/Attendance/AttendanceBySubject";
import RecentAttendance from "../../components/Student/Attendance/RecentAttendance";

import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export type SubjectAttendance = {
  subject: string;
  code: string;
  percent: number; // 0-100
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
};

export type RecentAttendanceRow = {
  date: string;
  subject: string;
  timeIn: string;
  status: "Present" | "Late" | "Absent";
};

const summary = {
  overall: 93,
  presentDays: 158,
  absentDays: 8,
  lateDays: 5,
};

const bySubject: SubjectAttendance[] = [
  {
    subject: "Mathematics 101",
    code: "MATH101",
    percent: 90,
    totalClasses: 31,
    present: 28,
    absent: 2,
    late: 1,
  },
  {
    subject: "Computer Science",
    code: "CS201",
    percent: 97,
    totalClasses: 31,
    present: 30,
    absent: 1,
    late: 0,
  },
  {
    subject: "English Literature",
    code: "ENG102",
    percent: 84,
    totalClasses: 32,
    present: 27,
    absent: 3,
    late: 2,
  },
  {
    subject: "Physics",
    code: "PHY101",
    percent: 94,
    totalClasses: 31,
    present: 29,
    absent: 1,
    late: 1,
  },
  {
    subject: "Filipino",
    code: "FIL101",
    percent: 97,
    totalClasses: 31,
    present: 30,
    absent: 0,
    late: 1,
  },
  {
    subject: "Physical Education",
    code: "PE101",
    percent: 93,
    totalClasses: 15,
    present: 14,
    absent: 1,
    late: 0,
  },
];

const recent: RecentAttendanceRow[] = [
  { date: "Jan 15, 2025", subject: "Mathematics 101", timeIn: "8:00 AM", status: "Present" },
  { date: "Jan 15, 2025", subject: "Computer Science", timeIn: "10:00 AM", status: "Present" },
  { date: "Jan 14, 2025", subject: "Physics", timeIn: "8:15 AM", status: "Late" },
  { date: "Jan 14, 2025", subject: "English Literature", timeIn: "10:00 AM", status: "Present" },
  { date: "Jan 13, 2025", subject: "Filipino", timeIn: "1:00 PM", status: "Present" },
  { date: "Jan 13, 2025", subject: "Data Structures", timeIn: "-", status: "Absent" },
];

export default function AttendancePage() {
  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header mb-3">
        <h2 className="fw-bold mb-1">Attendance Record</h2>
        <p className="text-muted mb-0">Track your class attendance</p>
      </div>

      {/* Summary cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={Clock}
            iconBgClass="bg-primary-subtle"
            iconClass="text-primary"
            value={`${summary.overall}%`}
            label="Overall Attendance"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={CheckCircle2}
            iconBgClass="bg-success-subtle"
            iconClass="text-success"
            value={`${summary.presentDays}`}
            label="Days Present"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={XCircle}
            iconBgClass="bg-danger-subtle"
            iconClass="text-danger"
            value={`${summary.absentDays}`}
            label="Days Absent"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            icon={AlertCircle}
            iconBgClass="bg-warning-subtle"
            iconClass="text-warning"
            value={`${summary.lateDays}`}
            label="Days Late"
          />
        </div>
      </div>

      {/* By Subject */}
      <div className="mt-3">
        <AttendanceBySubject items={bySubject} />
      </div>

      {/* Recent Table */}
      <div className="mt-3">
        <RecentAttendance rows={recent} />
      </div>
    </div>
  );
}
