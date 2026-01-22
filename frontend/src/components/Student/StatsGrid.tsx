import "../../styles/student-statsgrid.css";
import {
  GraduationCap,
  CheckCircle,
  BookOpen,
  Award,
} from "lucide-react";

const stats = [
  { label: "Current GPA", value: "3.75", icon: GraduationCap },
  { label: "Attendance", value: "92%", icon: CheckCircle },
  { label: "Courses", value: "6", icon: BookOpen },
  { label: "Credits", value: "18", icon: Award },
];

export default function StatsGrid() {
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
                  <Icon size={18} />
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
