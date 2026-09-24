// ✅ src/components/Student/Announcements.tsx

import { useState, useEffect } from "react";
import { Bell, Loader2, Inbox } from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  message?: string;
  body?: string;
  date?: string;
  createdAt?: string;
}

// 🟢 Helper function to format dates into a clean, readable text format
const formatReadableDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardAnnouncements() {
      try {
        setLoading(true);

        // Retrieve student profile details from storage to build matching query params
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
        const mappedData: AnnouncementItem[] = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id || item._id,
              title: item.title,
              message: item.message || item.body,
              date: formatReadableDate(item.date || item.createdAt),
            }))
          : [];

        setAnnouncements(mappedData);
      } catch (err: any) {
        console.error("Fetch announcements error:", err);
        setError("Unable to load announcements.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardAnnouncements();
  }, []);

  return (
    <div className="card announcements-card shadow-sm p-3 d-flex flex-column h-100">
      {/* Title */}
      <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2 flex-shrink-0">
        <Bell size={20} className="text-primary" />
        Recent Announcements
      </h5>

      {/* Scrollable list content */}
      <div className="announcements-list-wrapper flex-grow-1 overflow-auto" style={{ maxHeight: "280px" }}>
        {loading ? (
          <div className="text-center py-4 text-muted">
            <Loader2 className="spinner-border spinner-border-sm text-primary mb-1" size={20} />
            <p className="small mb-0">Loading...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger p-2 small text-center my-2">
            {error}
          </div>
        ) : announcements.length > 0 ? (
          <ul className="announcements-list list-unstyled mb-0">
            {announcements.map((a) => (
              <li key={a.id} className="border rounded p-2 mb-2 bg-white">
                <p className="small fw-bold mb-1 text-dark">{a.title}</p>
                {a.message && (
                  <p className="text-muted small mb-1 text-truncate" style={{ fontSize: "0.8rem" }}>
                    {a.message}
                  </p>
                )}
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {a.date}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-muted">
            <Inbox size={28} className="mb-1 opacity-50" />
            <p className="small mb-0">No announcements available.</p>
          </div>
        )}
      </div>
    </div>
  );
}