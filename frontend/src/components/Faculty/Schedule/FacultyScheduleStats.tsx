import { CalendarDays, Clock, Users, MapPin } from "lucide-react";

type StatTone = "blue" | "purple" | "green" | "orange";
type StatItem = { label: string; value: number; tone: StatTone };

const iconMap: Record<StatTone, React.ElementType> = {
  blue: CalendarDays,
  purple: Clock,
  green: Users,
  orange: MapPin,
};

export default function FacultyScheduleStats({ items }: { items: StatItem[] }) {
  return (
    <div className="row g-3">
      {items.map((s) => {
        const Icon = iconMap[s.tone];
        return (
          <div className="col-12 col-md-6 col-xl-3" key={s.label}>
            <div className="card faculty-stat-card">
              <div className="card-body d-flex align-items-center gap-3">
               <div className={`faculty-stat-icon stat-tone-${s.tone}`}>
                  <Icon size={20} />
                </div>

                <div>
                  <div className="faculty-stat-value">{s.value}</div>
                  <div className="text-muted">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
