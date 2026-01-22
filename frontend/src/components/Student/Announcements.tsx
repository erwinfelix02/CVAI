import { Bell } from "lucide-react";

const announcements = [
  { text: "Mid-term exams schedule released", time: "2 hours ago" },
  { text: "Library extended hours during finals", time: "1 day ago" },
  { text: "Campus event: Science Fair 2024", time: "2 days ago" },
];

export default function Announcements() {
  return (
    <div className="card announcements-card shadow-sm p-3 d-flex flex-column h-100">
      {/* Title */}
      <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2 flex-shrink-0">
        <Bell size={20} className="text-primary" />
        Recent Announcements
      </h5>

      {/* ✅ Scrollable list */}
      <ul className="announcements-list list-unstyled mb-0">
        {announcements.map((a, i) => (
          <li key={i} className="border rounded p-2 mb-2">
            <p className="small mb-1">{a.text}</p>
            <span className="text-muted small">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
