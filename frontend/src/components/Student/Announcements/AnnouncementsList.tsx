import type { Announcement } from "./types";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementsList({
  items,
  onTogglePin,
  onMarkAsRead,
}: {
  items: Announcement[];
  onTogglePin?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}) {
  return (
    <div className="d-flex flex-column gap-3">
      {items.map((a) => (
        <AnnouncementCard
          key={a.id}
          item={a}
          onTogglePin={onTogglePin}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}