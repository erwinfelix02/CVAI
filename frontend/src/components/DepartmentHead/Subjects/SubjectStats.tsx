// ✅ src/components/DepartmentHead/Subjects/SubjectStats.tsx

import type { LucideIcon } from "lucide-react";

export interface SubjectStatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

interface SubjectStatsProps {
  items: SubjectStatItem[];
}

export default function SubjectStats({
  items,
}: SubjectStatsProps) {
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className="col-12 col-md-4"
            key={item.label}
          >
            <div className="subject-stat-card h-100">
              <div className="subject-stat-icon">
                <Icon
                  size={24}
                  strokeWidth={2}
                />
              </div>

              <div className="subject-stat-content">
                <span className="subject-stat-label">
                  {item.label}
                </span>

                <span className="subject-stat-value">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}