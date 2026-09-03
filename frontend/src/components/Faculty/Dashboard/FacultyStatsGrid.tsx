import StatCard from "./StatCard";
import { Users, BookOpen, Clock, TrendingUp } from "lucide-react";

export default function FacultyStatsGrid() {
  return (
    <div className="row g-3 faculty-stats">
      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="blue"
          value="124"
          label="Total Students"
          sub="+8 this sem"
          icon={<Users size={18} />}
        />
      </div>

      <div className="col-12 col-md-6 col-xl-3">
        <StatCard
          tone="purple"
          value="4"
          label="Classes Today"
          sub="2 completed"
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