import type { Announcement } from "./types";
import AnnouncementCard from "./AnnouncementCard";

export default function PinnedGrid({
  items,
  onTogglePin,
  onMarkAsRead,
}: {
  items: Announcement[];
  onTogglePin?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}) {
  return (
    <div className="row g-3">
      {items.map((a) => (
        <div key={a.id} className="col-12 col-lg-6">
          <AnnouncementCard
            item={a}
            pinnedStyle
            onTogglePin={onTogglePin}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
      ))}
    </div>
  );
}