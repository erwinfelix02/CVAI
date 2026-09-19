import { useEffect, useState } from "react";
import "../../styles/attendance.css";
import StatCard from "../../components/Student/Attendance/StatCard";
import AttendanceBySubject from "../../components/Student/Attendance/AttendanceBySubject";
import RecentAttendance from "../../components/Student/Attendance/RecentAttendance";

import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
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

// =========================================================
// HELPER: CONVERT RAW DATE STRINGS (YYYY-MM-DD / ISO) TO READABLE TEXT
// e.g., "2026-09-15" -> "Sep 15, 2026"
// =========================================================
const formatReadableDate = (rawDateStr: string): string => {
  if (!rawDateStr) return "N/A";

  try {
    // If date string is formatted like "YYYY-MM-DD", append time to prevent timezone shift issues
    const safeDateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDateStr.trim())
      ? `${rawDateStr.trim()}T00:00:00`
      : rawDateStr;

    const parsedDate = new Date(safeDateStr);

    if (isNaN(parsedDate.getTime())) {
      return rawDateStr; // Return original string if unparseable
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return rawDateStr;
  }
};

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    overall: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
  });

  const [bySubject, setBySubject] = useState<SubjectAttendance[]>([]);
  const [recent, setRecent] = useState<RecentAttendanceRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSignedUserAttendance() {
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("sessionToken");

        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;

        let activeStudentId =
          storedUser?.studentId || storedUser?.id || storedUser?._id || "";
        let activeStudentNo =
          storedUser?.studentIdNumber || storedUser?.idNumber || "";

        // 1. Fetch current signed-in user profile from server to guarantee valid identifiers
        if (storedUser?.email || activeStudentId) {
          const profileParams = new URLSearchParams();
          if (storedUser?.email) profileParams.append("email", storedUser.email);
          if (activeStudentId) profileParams.append("id", activeStudentId);

          try {
            const profileRes = await fetch(
              `/api/users/me?${profileParams.toString()}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }
            );

            if (profileRes.ok) {
              const profile = await profileRes.json();
              activeStudentId = profile.studentId || profile.id || activeStudentId;
              activeStudentNo =
                profile.studentIdNumber || profile.idNumber || activeStudentNo;
            }
          } catch (profileErr) {
            console.warn("Using local storage fallback for student identity:", profileErr);
          }
        }

        // 2. Query attendance sessions matching the signed-in student
        const queryParams = new URLSearchParams();
        if (activeStudentId) queryParams.append("studentId", activeStudentId);
        if (activeStudentNo) queryParams.append("studentNo", activeStudentNo);

        const res = await fetch(`/api/attendance?${queryParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load attendance records.");
        }

        const attendanceLogs = await res.json();

        if (Array.isArray(attendanceLogs) && isMounted) {
          let totalPresent = 0;
          let totalAbsent = 0;
          let totalLate = 0;

          const subjectMap: Record<
            string,
            { total: number; present: number; absent: number; late: number }
          > = {};

          const recentRows: RecentAttendanceRow[] = [];

          // Process attendance records matching the current student
          attendanceLogs.forEach((session: any) => {
            const studentEntry = session.students?.find(
              (s: any) =>
                (activeStudentId && s.studentId === activeStudentId) ||
                (activeStudentNo && s.studentNo === activeStudentNo) ||
                (activeStudentNo &&
                  s.studentNo?.toLowerCase() === activeStudentNo.toLowerCase())
            );

            if (studentEntry && studentEntry.status !== "pending") {
              const statusRaw = String(studentEntry.status).toLowerCase();
              const subjectCode = session.subject || "General";

              if (!subjectMap[subjectCode]) {
                subjectMap[subjectCode] = { total: 0, present: 0, absent: 0, late: 0 };
              }

              subjectMap[subjectCode].total += 1;

              let formattedStatus: "Present" | "Late" | "Absent" = "Absent";

              if (statusRaw === "present") {
                totalPresent += 1;
                subjectMap[subjectCode].present += 1;
                formattedStatus = "Present";
              } else if (statusRaw === "late") {
                totalLate += 1;
                subjectMap[subjectCode].late += 1;
                formattedStatus = "Late";
              } else if (statusRaw === "absent") {
                totalAbsent += 1;
                subjectMap[subjectCode].absent += 1;
                formattedStatus = "Absent";
              }

              // Format date into human-readable string here
              recentRows.push({
                date: formatReadableDate(session.date),
                subject: subjectCode,
                timeIn: statusRaw === "absent" ? "-" : "Recorded Session",
                status: formattedStatus,
              });
            }
          });

          // Calculate summary stats
          const totalDays = totalPresent + totalAbsent + totalLate;
          const overallPercent =
            totalDays > 0 ? Math.round(((totalPresent + totalLate) / totalDays) * 100) : 0;

          setSummary({
            overall: overallPercent,
            presentDays: totalPresent,
            absentDays: totalAbsent,
            lateDays: totalLate,
          });

          // Calculate per-subject attendance totals
          const calculatedBySubject: SubjectAttendance[] = Object.entries(subjectMap).map(
            ([code, data]) => {
              const pct =
                data.total > 0
                  ? Math.round(((data.present + data.late) / data.total) * 100)
                  : 0;

              return {
                subject: code,
                code: code,
                percent: pct,
                totalClasses: data.total,
                present: data.present,
                absent: data.absent,
                late: data.late,
              };
            }
          );

          setBySubject(calculatedBySubject);
          setRecent(recentRows);
        }
      } catch (err: any) {
        console.error("Attendance fetch error:", err);
        if (isMounted) setError(err.message || "Failed to load attendance.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSignedUserAttendance();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header mb-3">
        <h2 className="fw-bold mb-1">Attendance Record</h2>
        <p className="text-muted mb-0">Track your class attendance</p>
      </div>

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2 className="spinner-border spinner-border-sm text-primary" size={22} />
            <span className="fw-medium">Fetching attendance records...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2 my-3" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}