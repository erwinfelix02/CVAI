import { useEffect, useState } from "react";
import { CalendarDays, CalendarX2, Loader2 } from "lucide-react";
import ClassRow from "./ClassRow";

interface ClassItem {
  id: string;
  time: string;
  code: string;
  title: string;
  meta: string;
  status: "completed" | "ongoing" | "upcoming";
}

export default function TodayClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : {};
        const facultyName =
          storedUser.name ||
          `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim();

        const res = await fetch(
          `/api/schedules/today?faculty=${encodeURIComponent(facultyName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setClasses(data);
        }
      } catch (err) {
        console.error("Failed to fetch today's classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);

  return (
    <div className="card shadow-sm faculty-card h-100">
      <div className="card-body p-3 p-md-4 d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="faculty-section-icon">
            <CalendarDays size={18} />
          </span>
          <h5 className="mb-0 fw-bold">Today's Classes</h5>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center flex-grow-1 py-5 text-muted gap-2">
            <Loader2 size={20} className="spinner-border spinner-border-sm" />
            <span>Loading schedule...</span>
          </div>
        ) : classes.length === 0 ? (
          /* CENTERED EMPTY STATE MODAL-STYLE UI */
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-5 text-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#f1f5f9",
                color: "#64748b",
              }}
            >
              <CalendarX2 size={32} />
            </div>
            <h6 className="fw-bold text-dark mb-1">No Classes Today</h6>
            <p className="text-muted small mb-0" style={{ maxWidth: "280px" }}>
              You don't have any classes assigned to your schedule for today.
              Enjoy your free time!
            </p>
          </div>
        ) : (
          <div className="faculty-class-list">
            {classes.map((c) => (
              <ClassRow key={c.id || `${c.time}-${c.code}`} {...c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
