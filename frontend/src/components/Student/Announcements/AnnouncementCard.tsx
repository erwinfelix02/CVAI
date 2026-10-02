import { useState } from "react";
import { Calendar, ExternalLink, Pin } from "lucide-react";
import type { Announcement } from "./types";

function toneDotClass(tone?: Announcement["categoryTone"]) {
  switch (tone) {
    case "danger":
      return "bg-danger";
    case "primary":
      return "bg-primary";
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

function badgeClass(tone?: Announcement["categoryTone"]) {
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

// 🟢 Helper to format any date input into a clean, readable text string
const formatReadableDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // If it's already a valid date string or text, check if it parses correctly
  if (isNaN(date.getTime())) return dateString; 

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function AnnouncementCard({
  item,
  pinnedStyle = false,
  onTogglePin,
  onMarkAsRead,
}: {
  item: Announcement;
  pinnedStyle?: boolean;
  onTogglePin?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const isUnread = !item.read;
  const readableDate = formatReadableDate(item.date);

  const handleOpenReadMore = () => {
    setShowModal(true);
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
  };

  return (
    <>
      <div
        className={`card shadow-sm ann-card ${pinnedStyle ? "ann-card--pinned" : ""} ${
          isUnread ? "border-start border-4 border-primary bg-light-subtle" : ""
        }`}
        style={{
          transition: "all 0.3s ease",
        }}
      >
        <div className="card-body p-3 p-md-4">
          {/* Title Row */}
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="d-flex align-items-start gap-3 min-w-0">
              <span className={`ann-dot mt-2 ${toneDotClass(item.categoryTone)}`} />
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold mb-1 text-truncate">{item.title}</h5>
                  {isUnread && (
                    <span className="badge bg-primary rounded-pill small mb-1">
                      New
                    </span>
                  )}
                </div>
                <p className="text-muted mb-0 ann-body text-truncate">{item.body}</p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className={badgeClass(item.categoryTone)}>{item.category}</span>
              {onTogglePin && (
                <button
                  type="button"
                  className={`btn btn-sm p-1 border-0 ${item.pinned ? "text-primary" : "text-muted"}`}
                  onClick={() => onTogglePin(item.id)}
                  title={item.pinned ? "Unpin Announcement" : "Pin Announcement"}
                  style={{ background: "transparent" }}
                >
                  <Pin
                    size={18}
                    style={{
                      transform: item.pinned ? "rotate(-45deg)" : "none",
                      transition: "transform 0.2s ease",
                      fill: item.pinned ? "currentColor" : "none",
                    }}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="d-flex align-items-center justify-content-between mt-3 gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2 text-muted small">
              <Calendar size={16} />
              {readableDate}
              {item.author && <span className="ms-1">• By {item.author}</span>}
            </div>

            <button
              type="button"
              className="btn btn-link p-0 ann-readmore fw-semibold"
              onClick={handleOpenReadMore}
            >
              Read more <ExternalLink size={16} className="ms-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Modal Dialog */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header align-items-start">
                <div>
                  <span className={`mb-2 ${badgeClass(item.categoryTone)}`}>
                    {item.category}
                  </span>
                  <h5 className="modal-title fw-bold mt-1">{item.title}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <p style={{ whiteSpace: "pre-wrap" }}>{item.body}</p>
                {item.department && (
                  <p className="text-muted small mb-0 mt-3">
                    <strong>Department:</strong> {item.department}
                  </p>
                )}
              </div>

              <div className="modal-footer d-flex justify-content-between">
                <small className="text-muted">
                  Posted on {readableDate} {item.author ? `by ${item.author}` : ""}
                </small>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}