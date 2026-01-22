import { CalendarDays, Users, Pencil, Trash2 } from "lucide-react";
import type { Announcement } from "./types";

const toneClass: Record<Announcement["priority"], string> = {
  low: "tone-low",
  medium: "tone-medium",
  high: "tone-high",
};

export default function AnnouncementCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Announcement;
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
}) {
  return (
    <div className={`card shadow-sm announcement-card ${toneClass[item.priority]}`}>
      <div className="card-body p-3 p-md-4">
        {/* Top row: chips + actions */}
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="chip chip-course">{item.course}</span>
            <span className={`chip chip-priority ${item.priority}`}>
              {item.priority}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 announcement-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit?.(item)}
              aria-label="Edit"
            >
              <Pencil size={18} />
            </button>

            <button
              type="button"
              className="icon-btn danger"
              onClick={() => onDelete?.(item)}
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Title + message */}
        <h5 className="fw-bold mt-2 mb-2">{item.title}</h5>
        <p className="text-muted mb-3">{item.message}</p>

        {/* Bottom meta */}
        <div className="d-flex flex-wrap gap-3 text-muted small">
          <span className="d-flex align-items-center gap-2">
            <CalendarDays size={16} />
            {item.date}
          </span>
          <span className="d-flex align-items-center gap-2">
            <Users size={16} />
            {item.recipients} recipients
          </span>
        </div>
      </div>
    </div>
  );
}
