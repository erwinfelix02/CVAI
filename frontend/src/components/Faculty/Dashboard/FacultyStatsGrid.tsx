import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";

export default function FacultyStatsGrid() {
  const [stats, setStats] = useState({
    totalAssignedClasses: 0,
    classesTodayCount: 0,
    classesCompletedCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : {};
        const facultyName = storedUser.name || `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim();

        const res = await fetch(`/api/schedules/stats?faculty=${encodeURIComponent(facultyName)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch faculty stats:", err);
      }
    };

    fetchStats();
  }, []);

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
          value="18"
          label="Pending Grades"
          sub="Due in 3 days"
          icon={<Clock size={18} />}
        />
      </div>

      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="green"
          value="94%"
          label="Attendance Rate"
          sub="+2% this week"
          icon={<TrendingUp size={18} />}
        />
      </div>
    </div>
  );
}