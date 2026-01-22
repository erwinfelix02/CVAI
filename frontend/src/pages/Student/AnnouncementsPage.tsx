import "../../styles/announcements.css";
import PinnedGrid from "../../components/Student/Announcements/PinnedGrid";
import AnnouncementsList from "../../components/Student/Announcements/AnnouncementsList";

import { Bell, Pin } from "lucide-react";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
  categoryTone: "danger" | "primary" | "success" | "warning" | "purple";
  pinned?: boolean;
};

const data: Announcement[] = [
  {
    id: "a1",
    pinned: true,
    title: "Mid-term Examination Schedule Released",
    body:
      "The mid-term examination schedule for the 2nd semester has been released. Please check your student portal for your specific exam dates and venues. Make sure to review your subjects and prepare accordingly.",
    date: "January 15, 2025",
    category: "Examinations",
    categoryTone: "danger",
  },
  {
    id: "a2",
    pinned: true,
    title: "Library Extended Hours During Finals",
    body:
      "The university library will extend its operating hours from January 20-31. The library will be open from 6:00 AM to 12:00 MN to accommodate students preparing for finals. Please observe library rules and guidelines.",
    date: "January 14, 2025",
    category: "Facilities",
    categoryTone: "primary",
  },
  {
    id: "a3",
    title: "Campus Science Fair 2025",
    body:
      "Join us for the annual Campus Science Fair on February 5-7, 2025. Students from all departments are encouraged to participate. Registration deadline is January 25, 2025.",
    date: "January 13, 2025",
    category: "Events",
    categoryTone: "purple",
  },
  {
    id: "a4",
    title: "Scholarship Application for AY 2025-2026",
    body:
      "Applications for various scholarship programs for AY 2025-2026 are now open. Visit the Office of Student Affairs for more information and requirements.",
    date: "January 12, 2025",
    category: "Scholarships",
    categoryTone: "success",
  },
  {
    id: "a5",
    title: "Campus Maintenance Notice",
    body:
      "Scheduled maintenance will take place this weekend. Some facilities and online services may experience intermittent downtime. Thank you for your understanding.",
    date: "January 11, 2025",
    category: "Maintenance",
    categoryTone: "warning",
  },
];

export default function AnnouncementsPage() {
  const pinned = data.filter((a) => a.pinned);
  const all = data.filter((a) => !a.pinned);

  return (
    <div className="ann-page">
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <h2 className="fw-bold mb-1">Announcements</h2>
          <p className="text-muted mb-0">Stay updated with campus news</p>
        </div>

        <div className="ann-pill-count">
          <Bell size={16} />
          <span className="fw-semibold">{data.length} announcements</span>
        </div>
      </div>

      {/* Pinned */}
      <div className="d-flex align-items-center gap-2 mb-2 mt-2">
  <div className="ann-section-icon">
    <Pin size={18} />
  </div>
  <h4 className="fw-bold mb-0">Pinned</h4>
</div>

      <PinnedGrid items={pinned} />

      {/* All */}
      <h4 className="fw-bold mt-4 mb-2">All Announcements</h4>
      <AnnouncementsList items={all} />
    </div>
  );
}
