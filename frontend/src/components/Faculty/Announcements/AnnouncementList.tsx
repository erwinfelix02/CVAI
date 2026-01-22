import AnnouncementCard from "./AnnouncementCard";
import type { Announcement } from "./types";

export default function AnnouncementList({
  items,
  onEdit,
  onDelete,
}: {
  items: Announcement[];
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
}) {
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
