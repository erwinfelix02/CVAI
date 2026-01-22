import type { Announcement } from "../../../pages/Student/AnnouncementsPage";
import AnnouncementCard from "./AnnouncementCard";

export default function PinnedGrid({ items }: { items: Announcement[] }) {
  return (
    <div className="row g-3">
      {items.map((a) => (
        <div key={a.id} className="col-12 col-lg-6">
          <AnnouncementCard item={a} pinnedStyle />
        </div>
      ))}
    </div>
  );
}
