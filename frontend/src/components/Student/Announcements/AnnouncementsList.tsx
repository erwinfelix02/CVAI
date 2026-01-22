import type { Announcement } from "../../../pages/Student/AnnouncementsPage";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementsList({ items }: { items: Announcement[] }) {
  return (
    <div className="d-flex flex-column gap-3">
      {items.map((a) => (
        <AnnouncementCard key={a.id} item={a} />
      ))}
    </div>
  );
}
