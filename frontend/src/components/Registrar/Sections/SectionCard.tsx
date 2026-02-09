import { MoreVertical, BookOpen, User, MapPin, Clock } from "lucide-react";
import type { SectionItem } from "./types";

function getTone(enrolled: number, capacity: number) {
  const pct = capacity === 0 ? 0 : enrolled / capacity;
  if (pct >= 0.9) return "danger";  // red
  if (pct >= 0.7) return "warning"; // yellow/orange
  return "primary";                // blue
}

export default function SectionCard({ item }: { item: SectionItem }) {
  const tone = getTone(item.enrolled, item.capacity);
  const pct = item.capacity === 0 ? 0 : Math.min(100, Math.round((item.enrolled / item.capacity) * 100));

  return (
    <div className="card shadow-sm sections-card h-100">
      <div className="card-body">
        {/* Top row */}
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2">
              <BookOpen size={18} className="sections-card-ic" />
              <div className="sections-card-title text-truncate">{item.code}</div>
            </div>
            <div className="text-muted sections-card-sub text-truncate">
              {item.program}
            </div>
          </div>

          <button className="btn btn-link p-0 sections-kebab" type="button" aria-label="More">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Enrolled + badge */}
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div className="text-muted">Enrolled</div>

          {/* ✅ FIXED badge: no cut / no weird shape */}
          <span className={`sections-chip tone-${tone}`}>
            {item.enrolled}/{item.capacity}
          </span>
        </div>

        {/* Progress */}
        <div className="progress sections-progress mt-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`progress-bar tone-${tone}`} style={{ width: `${pct}%` }} />
        </div>

        {/* Adviser */}
        <div className="d-flex align-items-center gap-2 mt-3 sections-meta">
          <User size={16} />
          <span className="text-truncate">{item.adviser}</span>
        </div>

        {/* Bottom row */}
        <div className="d-flex align-items-center justify-content-between gap-3 mt-2 sections-meta">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <MapPin size={16} />
            <span className="text-truncate">{item.room}</span>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <Clock size={16} />
            <span className="text-nowrap">{item.schedule}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
