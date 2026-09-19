import { CalendarDays, Users, Pencil, Trash2 } from "lucide-react";
import type { Announcement } from "./types";

const toneClass: Record<Announcement["priority"], string> = {
  low: "tone-low",
  medium: "tone-medium",
  high: "tone-high",
};

// Robust date parser that handles "9/11/2026", "2026-09-11", and ISO strings
const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";

  let year: number, month: number, day: number;

  // Handles "M/D/YYYY" or "MM/DD/YYYY" (e.g., "9/11/2026")
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      month = parts[0] - 1; // Month is 0-indexed in JS
      day = parts[1];
      year = parts[2];
    }
  }
  // Handles "YYYY-MM-DD" (e.g., "2026-09-11")
  else if (dateStr.includes("-")) {
    const cleanDate = dateStr.split("T")[0];
    const parts = cleanDate.split("-").map((p) => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    }
  }

  // Construct date using explicit local Year, Month, Day to avoid timezone shifts
  if (year! && month! !== undefined && day!) {
    const localDate = new Date(year, month, day);
    if (!isNaN(localDate.getTime())) {
      return localDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Fallback native parse attempt
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return dateStr;
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
  const readableDate = formatReadableDate(item.date);
  const formattedRecipients =
    typeof item.recipients === "number"
      ? item.recipients.toLocaleString()
      : item.recipients;

  return (
    <div
      className={`card shadow-sm announcement-card ${toneClass[item.priority]}`}
    >
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
              aria-label="Edit announcement"
            >
              <Pencil size={18} />
            </button>

            <button
              type="button"
              className="icon-btn danger"
              onClick={() => onDelete?.(item)}
              aria-label="Delete announcement"
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
            {readableDate}
          </span>
          <span className="d-flex align-items-center gap-2">
            <Users size={16} />
            {formattedRecipients} recipients
          </span>
        </div>
      </div>
    </div>
  );
}
