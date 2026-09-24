import { useState, useEffect } from "react";
import "../../styles/announcements.css";
import PinnedGrid from "../../components/Student/Announcements/PinnedGrid";
import AnnouncementsList from "../../components/Student/Announcements/AnnouncementsList";
import type { Announcement } from "../../components/Student/Announcements/types";
import { Bell, Pin, Loader2, Inbox } from "lucide-react";

const PINNED_STORAGE_KEY = "pinned_announcement_ids";
const READ_STORAGE_KEY = "read_announcement_ids";

function getStoredIds(key: string): string[] {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return [];
  }
}

function getCategoryTone(
  priority?: string
): "danger" | "primary" | "success" | "warning" | "purple" {
  switch (priority?.toLowerCase()) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "primary";
    default:
      return "purple";
  }
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);

        const storedUser =
          localStorage.getItem("user") || localStorage.getItem("studentProfile");
        const student = storedUser ? JSON.parse(storedUser) : null;

        const studentSection = student?.section || "BSHTM-01";
        const studentCourses = Array.isArray(student?.enrolledSubjects)
          ? student.enrolledSubjects.join(",")
          : "MAT151";
        const department =
          student?.department || "College of Hospitality Management Technology";

        const params = new URLSearchParams({
          studentSection,
          studentCourses,
          department,
        });

        const res = await fetch(`/api/announcements?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load announcements");

        const data = await res.json();
        const savedPinnedIds = getStoredIds(PINNED_STORAGE_KEY);
        const savedReadIds = getStoredIds(READ_STORAGE_KEY);

        const mappedData: Announcement[] = data.map((item: any) => {
          const id = item.id || item._id;
          return {
            id,
            title: item.title,
            body: item.message,
            date:
              item.date ||
              new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            category: item.subjectCode
              ? `${item.subjectCode} (${item.section || "All"})`
              : "General",
            categoryTone: getCategoryTone(item.priority),
            pinned: savedPinnedIds.includes(id) || Boolean(item.pinned),
            read: savedReadIds.includes(id),
            priority: item.priority,
            author: item.author,
            department: item.department,
          };
        });

        setAnnouncements(mappedData);
      } catch (err: any) {
        console.error("Fetch announcements error:", err);
        setError("Unable to load announcements at this time.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleTogglePin = (id: string) => {
    setAnnouncements((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      );

      const pinnedIds = updated.filter((item) => item.pinned).map((item) => item.id);
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedIds));

      return updated;
    });
  };

  const handleMarkAsRead = (id: string) => {
    setAnnouncements((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );

      const readIds = updated.filter((item) => item.read).map((item) => item.id);
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds));

      return updated;
    });
  };

  const pinned = announcements.filter((a) => a.pinned);
  const all = announcements.filter((a) => !a.pinned);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Loader2 className="spinner-border text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }

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
          <span className="fw-semibold">{announcements.length} announcements</span>
        </div>
      </div>

      {/* Pinned Section */}
      {pinned.length > 0 && (
        <>
          <div className="d-flex align-items-center gap-2 mb-2 mt-2">
            <div className="ann-section-icon">
              <Pin size={18} />
            </div>
            <h4 className="fw-bold mb-0">Pinned</h4>
          </div>
          <PinnedGrid
            items={pinned}
            onTogglePin={handleTogglePin}
            onMarkAsRead={handleMarkAsRead}
          />
        </>
      )}

      {/* All / Unpinned Announcements Section */}
      <h4 className="fw-bold mt-4 mb-2">
        {pinned.length > 0 ? "All Announcements" : "Recent Announcements"}
      </h4>

      {all.length > 0 ? (
        <AnnouncementsList
          items={all}
          onTogglePin={handleTogglePin}
          onMarkAsRead={handleMarkAsRead}
        />
      ) : (
        /* Empty State when all announcements are pinned or none exist */
        <div className="card text-center p-4 border-dashed bg-light my-2">
          <div className="card-body d-flex flex-column align-items-center">
            <Inbox size={40} className="text-muted mb-2" />
            <p className="fw-semibold text-secondary mb-1">
              {pinned.length > 0
                ? "All announcements are currently pinned above."
                : "No announcements available."}
            </p>
            <small className="text-muted">
              Check back later for new course updates.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}