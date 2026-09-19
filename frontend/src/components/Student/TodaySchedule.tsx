import { useEffect, useState, useMemo } from "react";
import {
  CalendarClock,
  Loader2,
  AlertCircle,
  CalendarX,
  Info,
  MapPin,
  Clock,
  BookOpen,
  User,
} from "lucide-react";

export type ScheduleItem = {
  _id: string;
  code: string;
  title: string;
  faculty: string;
  room: string;
  section: string;
  days: string;
  time: string;
  status: string;
  department: string;
};

export type FormattedTodaySchedule = {
  id: string;
  code: string;
  time: string;
  title: string;
  room: string;
  faculty: string;
  days: string;
  department: string;
  status: "completed" | "ongoing" | "upcoming";
};

// Helper: Checks if schedule's day string matches today's day name
function matchesToday(daysStr: string): boolean {
  if (!daysStr) return false;
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = daysOfWeek[new Date().getDay()];
  const upper = daysStr.toUpperCase();

  if (todayName === "Monday" && (upper.includes("M") || upper.includes("MON"))) return true;
  if (todayName === "Tuesday" && (upper.includes("TUE") || upper.includes("T") || upper.includes("TH"))) return true;
  if (todayName === "Wednesday" && (upper.includes("W") || upper.includes("WED"))) return true;
  if (todayName === "Thursday" && (upper.includes("THU") || upper.includes("TH") || upper.includes("H"))) return true;
  if (todayName === "Friday" && (upper.includes("F") || upper.includes("FRI"))) return true;
  if (todayName === "Saturday" && (upper.includes("SAT") || upper.includes("S"))) return true;

  return false;
}

// Helper: Calculates status based on current time
function evaluateStatus(timeStr: string): "completed" | "ongoing" | "upcoming" {
  if (!timeStr) return "upcoming";

  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parts = timeStr.split(/–|-/).map((p) => p.trim());
    if (parts.length < 2) return "upcoming";

    const parseToMinutes = (str: string) => {
      const match = str.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3]?.toUpperCase();

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = parseToMinutes(parts[0]);
    const endMinutes = parseToMinutes(parts[1]);

    if (startMinutes === null || endMinutes === null) return "upcoming";

    if (currentMinutes > endMinutes) return "completed";
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return "ongoing";
    return "upcoming";
  } catch {
    return "upcoming";
  }
}

export default function TodaySchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<FormattedTodaySchedule | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTodaySchedules() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
        const userJson = localStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;

        let section = storedUser?.section || "";
        let department = storedUser?.department || storedUser?.program || "";
        let enrolledSubjects: string[] = [];
        let studentId = storedUser?.idNumber || storedUser?.studentIdNumber || storedUser?.email || "";

        if (studentId) {
          try {
            const studentRes = await fetch(`/api/students/${studentId}`, {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });

            if (studentRes.ok) {
              const studentData = await studentRes.json();
              if (studentData.section) section = studentData.section;
              if (studentData.department) department = studentData.department;
              if (Array.isArray(studentData.enrolledSubjects)) {
                enrolledSubjects = studentData.enrolledSubjects;
              }
            }
          } catch (fetchErr) {
            console.warn("Could not fetch student record, falling back:", fetchErr);
          }
        }

        const scheduleParams = new URLSearchParams();
        if (section) scheduleParams.append("section", section);
        if (department) scheduleParams.append("department", department);
        if (enrolledSubjects.length > 0) {
          scheduleParams.append("enrolledSubjects", enrolledSubjects.join(","));
        }

        const res = await fetch(`/api/schedules/student?${scheduleParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load today's schedule.");
        }

        const data = await res.json();
        if (Array.isArray(data) && isMounted) {
          setSchedules(data);
        }
      } catch (err: any) {
        console.error("TodaySchedule fetch error:", err);
        if (isMounted) setError(err.message || "Failed to load schedule.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTodaySchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const todaySchedulesFormatted: FormattedTodaySchedule[] = useMemo(() => {
    return schedules
      .filter((sch) => matchesToday(sch.days))
      .map((sch) => ({
        id: sch._id,
        code: sch.code || "N/A",
        time: sch.time,
        title: sch.title,
        room: sch.room || "Room TBA",
        faculty: sch.faculty || "TBA",
        days: sch.days,
        department: sch.department || "General",
        status: evaluateStatus(sch.time),
      }));
  }, [schedules]);

  return (
    <>
      <div className="card schedule-card shadow-sm p-3 d-flex flex-column h-100 position-relative">
        {/* Title */}
        <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2 flex-shrink-0">
          <CalendarClock size={20} className="text-primary" />
          Today's Schedule
        </h5>

        {/* Schedule List / Empty State */}
        <div className="schedule-list flex-grow-1 d-flex flex-column justify-content-center">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center p-4 text-muted gap-2 my-auto">
              <Loader2 className="spinner-border spinner-border-sm text-primary" size={18} />
              <span className="small">Loading classes...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 my-auto" role="alert">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          ) : todaySchedulesFormatted.length === 0 ? (
            /* CENTERED NO CLASS UI */
            <div className="d-flex flex-column align-items-center justify-content-center text-center p-4 my-auto bg-light rounded-4 border border-secondary-subtle">
              <div
                className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: 56, height: 56 }}
              >
                <CalendarX size={28} />
              </div>
              <h6 className="fw-bold text-dark mb-1">No Classes Scheduled Today</h6>
              <p className="text-muted small mb-0" style={{ maxWidth: 260 }}>
                You're all clear! Take time to study, rest, or prepare for upcoming sessions.
              </p>
            </div>
          ) : (
            <div className="w-100 my-auto">
              {todaySchedulesFormatted.map((c) => (
                <div
                  key={c.id}
                  className={`d-flex justify-content-between align-items-center p-2.5 mb-2 border rounded-3 transition-all ${
                    c.status === "ongoing"
                      ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                      : c.status === "completed"
                      ? "bg-light opacity-75"
                      : "bg-white"
                  }`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="text-muted small fw-semibold"
                      style={{ minWidth: 70, textAlign: "right" }}
                    >
                      {c.time}
                    </span>
                    <div>
                      <p className="mb-0 fw-semibold text-dark">{c.title}</p>
                      <small className="text-muted d-block">{c.room}</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge text-capitalize ${
                        c.status === "ongoing"
                          ? "bg-primary text-white"
                          : c.status === "completed"
                          ? "bg-secondary text-white"
                          : "bg-info-subtle text-info-emphasis border border-info-subtle"
                      }`}
                    >
                      {c.status}
                    </span>

                    <button
                      type="button"
                      className="btn btn-sm btn-light border-0 text-muted p-1 rounded-circle"
                      onClick={() => setSelectedSchedule(c)}
                      title="View Details"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SCHEDULE DETAILS MODAL */}
      {selectedSchedule && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  <h5 className="modal-title fw-bold">Class Details</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSchedule(null)}
                ></button>
              </div>

              <div className="modal-body py-4">
                <div className="mb-3">
                  <span className="badge bg-primary-subtle text-primary mb-1">
                    {selectedSchedule.code}
                  </span>
                  <h4 className="fw-bold mb-1 text-dark">{selectedSchedule.title}</h4>
                  <p className="text-muted small mb-0">{selectedSchedule.department}</p>
                </div>

                <div className="card border-0 bg-light rounded-3 p-3 mb-3">
                  <div className="row g-3">
                    <div className="col-6 d-flex align-items-center gap-2">
                      <Clock size={16} className="text-secondary" />
                      <div>
                        <div className="text-muted small">Time</div>
                        <div className="fw-semibold small">{selectedSchedule.time}</div>
                      </div>
                    </div>

                    <div className="col-6 d-flex align-items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      <div>
                        <div className="text-muted small">Room</div>
                        <div className="fw-semibold small">{selectedSchedule.room}</div>
                      </div>
                    </div>

                    <div className="col-6 d-flex align-items-center gap-2">
                      <User size={16} className="text-secondary" />
                      <div>
                        <div className="text-muted small">Instructor</div>
                        <div className="fw-semibold small">{selectedSchedule.faculty}</div>
                      </div>
                    </div>

                    <div className="col-6 d-flex align-items-center gap-2">
                      <CalendarClock size={16} className="text-secondary" />
                      <div>
                        <div className="text-muted small">Days</div>
                        <div className="fw-semibold small">{selectedSchedule.days}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center px-1">
                  <span className="text-muted small">Current Status:</span>
                  <span
                    className={`badge text-capitalize px-3 py-1.5 ${
                      selectedSchedule.status === "ongoing"
                        ? "bg-primary text-white"
                        : selectedSchedule.status === "completed"
                        ? "bg-secondary text-white"
                        : "bg-info-subtle text-info-emphasis border border-info-subtle"
                    }`}
                  >
                    {selectedSchedule.status}
                  </span>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary w-100 rounded-pill"
                  onClick={() => setSelectedSchedule(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}