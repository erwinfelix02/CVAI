import { MegaphoneOff } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import type { Announcement } from "./types";

interface AnnouncementListProps {
  items: Announcement[];
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
}

export default function AnnouncementList({
  items,
  onEdit,
  onDelete,
}: AnnouncementListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
        <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted mb-3"
            style={{ width: 64, height: 64 }}
          >
            <MegaphoneOff size={32} className="opacity-75" />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Announcements Yet</h5>
          <p className="text-muted small mb-0" style={{ maxWidth: 360 }}>
            There are currently no announcements posted for your department or courses. Click <strong>"New Announcement"</strong> above to publish one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((a) => (
        <AnnouncementCard
          key={a.id}
          item={a}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}