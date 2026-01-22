import { Calendar, ExternalLink } from "lucide-react";
import type { Announcement } from "../../../pages/Student/AnnouncementsPage";

function toneDotClass(tone: Announcement["categoryTone"]) {
  switch (tone) {
    case "danger":
      return "bg-danger";
    case "primary":
      return "bg-warning"; // matches your screenshot for Facilities
    case "success":
      return "bg-success";
    case "warning":
      return "bg-warning";
    case "purple":
      return "bg-purple";
    default:
      return "bg-secondary";
  }
}

function badgeClass(tone: Announcement["categoryTone"]) {
  switch (tone) {
    case "danger":
      return "ann-badge danger";
    case "primary":
      return "ann-badge primary";
    case "success":
      return "ann-badge success";
    case "warning":
      return "ann-badge warning";
    case "purple":
      return "ann-badge purple";
    default:
      return "ann-badge";
  }
}

export default function AnnouncementCard({
  item,
  pinnedStyle = false,
}: {
  item: Announcement;
  pinnedStyle?: boolean;
}) {
  return (
    <div className={`card shadow-sm ann-card ${pinnedStyle ? "ann-card--pinned" : ""}`}>
      <div className="card-body p-3 p-md-4">
        {/* Title Row */}
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3 min-w-0">
            <span className={`ann-dot ${toneDotClass(item.categoryTone)}`} />
            <div className="min-w-0">
              <h5 className="fw-bold mb-1 text-truncate">{item.title}</h5>
              <p className="text-muted mb-0 ann-body">
                {item.body}
              </p>
            </div>
          </div>

          <span className={badgeClass(item.categoryTone)}>{item.category}</span>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between mt-3 gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Calendar size={16} />
            {item.date}
          </div>

          <button className="btn btn-link p-0 ann-readmore">
            Read more <ExternalLink size={16} className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
