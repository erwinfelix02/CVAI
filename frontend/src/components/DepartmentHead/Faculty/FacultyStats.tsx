import type { LucideIcon } from "lucide-react";

export interface FacultyStatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

interface FacultyStatsProps {
  items: FacultyStatItem[];
}

export default function FacultyStats({ items }: FacultyStatsProps) {
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div className="col-12 col-sm-6 col-xl-3" key={item.label}>
            <div className="dept-stat-card h-100">
              <div className="dept-stat-icon">
                <Icon size={24} />
              </div>

              <div className="dept-stat-content">
                <div className="dept-stat-label">{item.label}</div>
                <div className="dept-stat-value">{item.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
