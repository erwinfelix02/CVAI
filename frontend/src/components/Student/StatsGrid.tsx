import { useEffect, useState } from "react";
import "../../styles/student-statsgrid.css";
import {
  GraduationCap,
  CheckCircle,
  BookOpen,
  Award,
  Loader2,
} from "lucide-react";

export default function StatsGrid() {
  const [attendancePercent, setAttendancePercent] = useState<number | null>(null);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchStudentStats() {
      setLoading(true);

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("sessionToken");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;

        let activeStudentId =
          storedUser?.studentId || storedUser?.id || storedUser?._id || "";
        let activeStudentNo =
          storedUser?.studentIdNumber || storedUser?.idNumber || storedUser?.id || "";

        // 1. Fetch student user profile to get exact IDs and enrolled subjects
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

              if (Array.isArray(profile.enrolledSubjects)) {
                setEnrolledCoursesCount(profile.enrolledSubjects.length);
              }
            }
          } catch (profileErr) {
            console.warn("Using local storage fallback for student identity:", profileErr);
          }
        }

        // 2. Fetch attendance records matching the student
        const queryParams = new URLSearchParams();
        if (activeStudentId) queryParams.append("studentId", activeStudentId);
        if (activeStudentNo) queryParams.append("studentNo", activeStudentNo);

        const res = await fetch(`/api/attendance?${queryParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const attendanceLogs = await res.json();

          if (Array.isArray(attendanceLogs) && isMounted) {
            let totalPresent = 0;
            let totalLate = 0;
            let totalAbsent = 0;

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
                if (statusRaw === "present") totalPresent += 1;
                else if (statusRaw === "late") totalLate += 1;
                else if (statusRaw === "absent") totalAbsent += 1;
              }
            });

            const totalSessions = totalPresent + totalLate + totalAbsent;
            const overallPct =
              totalSessions > 0
                ? Math.round(((totalPresent + totalLate) / totalSessions) * 100)
                : 100;

            setAttendancePercent(overallPct);
          }
        }
      } catch (err) {
        console.error("StatsGrid fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStudentStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: "Current GPA", value: "3.75", icon: GraduationCap },
    {
      label: "Attendance",
      value: loading
        ? "..."
        : attendancePercent !== null
        ? `${attendancePercent}%`
        : "N/A",
      icon: CheckCircle,
    },
    {
      label: "Courses",
      value: enrolledCoursesCount > 0 ? String(enrolledCoursesCount) : "6",
      icon: BookOpen,
    },
    { label: "Credits", value: "18", icon: Award },
  ];

  return (
    <div className="row g-3 mb-3">
      {stats.map((s) => {
        const Icon = s.icon;

        return (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card stats-card h-100">
              <div className="stats-card-content">
                {/* Icon on the left */}
                <div className="stats-icon">
                  {loading && s.label === "Attendance" ? (
                    <Loader2 size={18} className="spinner-border spinner-border-sm" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>

                {/* Text content */}
                <div className="stats-text">
                  <p className="stats-label">{s.label}</p>
                  <p className="stats-value">{s.value}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}