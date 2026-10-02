// ✅ src/components/Faculty/Dashboard/FacultyStatsGrid.tsx

import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../../../config"; // 🟢 Centralized API Configuration

type Props = {
  activeTerm?: "prelim" | "midterm" | "finals"; // Optional term context
};

export default function FacultyStatsGrid({ activeTerm = "prelim" }: Props) {
  const [stats, setStats] = useState({
    totalAssignedClasses: 0,
    classesTodayCount: 0,
    classesCompletedCount: 0,
    pendingGrades: 0,
    attendanceRate: "0%",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : {};
        
        const facultyId = storedUser.id || storedUser._id || "";
        const facultyName = storedUser.name || `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim();
        const department = storedUser.department || "";

        // 1. Fetch schedule stats & assigned classes
        const schedRes = await fetch(`${API_BASE_URL}/schedules/stats?faculty=${encodeURIComponent(facultyName)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        
        let schedData = { totalAssignedClasses: 0, classesTodayCount: 0, classesCompletedCount: 0 };
        if (schedRes.ok) {
          schedData = await schedRes.json();
        }

        // 2. Fetch assigned schedules for pending grade calculation
        const schedulesRes = await fetch(`${API_BASE_URL}/schedules?department=${encodeURIComponent(department)}&faculty=${encodeURIComponent(facultyName)}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        let pendingCount = 0;
        if (schedulesRes.ok) {
          const schedules = await schedulesRes.json();

          const studentRes = await fetch(`${API_BASE_URL}/students?facultyName=${encodeURIComponent(facultyName)}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          });

          if (studentRes.ok) {
            const allStudents = await studentRes.json();

            schedules.forEach((sch: any) => {
              const code = sch.code?.trim().toUpperCase();
              const targetSection = String(sch.section || "").trim().toLowerCase();

              const matchedStudents = allStudents.filter((st: any) => {
                const studentSection = String(st.section || "").trim().toLowerCase();
                const matchesSection = targetSection ? studentSection === targetSection : true;
                const enrolledList = st.enrolledSubjects || st.courses || [];
                const matchesSubject = enrolledList.some((sub: string) => sub.toUpperCase().includes(code));
                return matchesSection || matchesSubject;
              });

              const termPending = matchedStudents.filter((st: any) => {
                const studentGrades = st.grades?.[code] || st.grades?.[sch._id] || {};
                const termData = studentGrades[activeTerm];
                return !termData || termData.grade === "—" || termData.grade === undefined || termData.grade === "";
              }).length;

              pendingCount += termPending;
            });
          }
        }

        // 3. Fetch attendance records to compute overall live attendance rate
        const attParams = new URLSearchParams();
        if (facultyId) attParams.append("facultyId", facultyId);

        const attendanceRes = await fetch(`${API_BASE_URL}/attendance?${attParams.toString()}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        let calculatedAttendanceRate = "100%";
        if (attendanceRes.ok) {
          const attendanceRecords = await attendanceRes.json();
          if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
            let totalMarks = 0;
            let presentMarks = 0;

            attendanceRecords.forEach((record: any) => {
              if (Array.isArray(record.students)) {
                record.students.forEach((st: any) => {
                  totalMarks += 1;
                  if (st.status === "present" || st.status === "late") {
                    presentMarks += 1;
                  }
                });
              }
            });

            if (totalMarks > 0) {
              const ratePct = Math.round((presentMarks / totalMarks) * 100);
              calculatedAttendanceRate = `${ratePct}%`;
            }
          }
        }

        setStats({
          totalAssignedClasses: schedData.totalAssignedClasses || 0,
          classesTodayCount: schedData.classesTodayCount || 0,
          classesCompletedCount: schedData.classesCompletedCount || 0,
          pendingGrades: pendingCount,
          attendanceRate: calculatedAttendanceRate,
        });
      } catch (err) {
        console.error("Failed to fetch faculty stats:", err);
      }
    };

    fetchStats();
  }, [activeTerm]);

  const capitalizedTerm = activeTerm.charAt(0).toUpperCase() + activeTerm.slice(1);

  return (
    <div className="row g-3 faculty-stats">
      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="blue"
          value={String(stats.totalAssignedClasses)}
          label="Total Assigned Sections"
          sub="Active Schedule Slots"
          icon={<Users size={18} />}
        />
      </div>

      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="purple"
          value={String(stats.classesTodayCount)}
          label="Classes Today"
          sub={`${stats.classesCompletedCount} completed`}
          icon={<BookOpen size={18} />}
        />
      </div>

      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="orange"
          value={String(stats.pendingGrades)}
          label="Pending Grades"
          sub={`${capitalizedTerm} Term Queue`}
          icon={<Clock size={18} />}
        />
      </div>

      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="green"
          value={stats.attendanceRate}
          label="Attendance Rate"
          sub="Overall student sessions"
          icon={<TrendingUp size={18} />}
        />
      </div>
    </div>
  );
}