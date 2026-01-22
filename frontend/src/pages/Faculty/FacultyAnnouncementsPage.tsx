import { useState } from "react";
import { Plus } from "lucide-react";
import AnnouncementStats from "../../components/Faculty/Announcements/AnnouncementStats";
import AnnouncementList from "../../components/Faculty/Announcements/AnnouncementList";
import type { Announcement } from "../../components/Faculty/Announcements/types";
import "../../styles/faculty-announcements.css";

const initialData: Announcement[] = [
  {
    id: "1",
    course: "CS 401",
    priority: "medium",
    title: "Project Deadline Extended",
    message:
      "Due to popular request, the project deadline has been extended by one week.",
    date: "3/8/2025",
    recipients: 19,
  },
  {
    id: "2",
    course: "CS 101",
    priority: "high",
    title: "Lab Session Cancelled",
    message:
      "Tomorrow's lab session is cancelled. We will have a make-up session next week.",
    date: "3/7/2025",
    recipients: 35,
  },
  {
    id: "3",
    course: "CS 301",
    priority: "low",
    title: "Reading Materials Updated",
    message:
      "New reading materials have been uploaded to the course portal. Please review before next class.",
    date: "3/6/2025",
    recipients: 28,
  },
];

export default function FacultyAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>(initialData);

  const handleDelete = (a: Announcement) => {
    // simple confirm for now
    const ok = window.confirm(`Delete announcement: "${a.title}"?`);
    if (!ok) return;
    setItems((prev) => prev.filter((x) => x.id !== a.id));
  };

  const handleEdit = (a: Announcement) => {
    // placeholder: open your modal here later
    alert(`Edit: ${a.title}`);
  };

  return (
    <div className="container-fluid py-3 py-md-4 faculty-announcements-page">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Announcements</h3>
          <p className="text-muted mb-0">Create and manage class announcements</p>
        </div>

        <button className="btn btn-success d-flex align-items-center gap-2">
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {/* Stats */}
      <AnnouncementStats items={items} />

      {/* List */}
      <AnnouncementList items={items} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
