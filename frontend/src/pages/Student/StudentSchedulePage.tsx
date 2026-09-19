// ✅ src/pages/Student/StudentSchedulePage.tsx
import { useEffect, useMemo, useState } from "react";
import ScheduleCard from "../../components/Student/ScheduleCard";
import WeeklySummary from "../../components/Student/WeeklySummary";
import { Download, Loader2, AlertCircle, Calendar } from "lucide-react";
import "./../../styles/student-schedulepage.css";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type StudentScheduleItem = {
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

function getTodayIndexMonToSat() {
  const js = new Date().getDay();
  const idx = js - 1;
  return idx < 0 ? 5 : Math.min(idx, 5);
}

export function matchesDay(daysStr: string, targetDay: string): boolean {
  if (!daysStr) return false;
  const upper = daysStr.toUpperCase();

  if (targetDay === "Monday") {
    return (
      upper.includes("MON") ||
      upper.includes("MWF") ||
      (upper.includes("M") && !upper.includes("TH"))
    );
  }
  if (targetDay === "Tuesday") {
    return (
      upper.includes("TUE") ||
      upper.includes("TTH") ||
      (upper.includes("T") && !upper.includes("TH") && !upper.includes("SAT"))
    );
  }
  if (targetDay === "Wednesday") {
    return (
      upper.includes("WED") || upper.includes("MWF") || upper.includes("W")
    );
  }
  if (targetDay === "Thursday") {
    return (
      upper.includes("THU") ||
      upper.includes("TTH") ||
      upper.includes("TH") ||
      upper.includes("H")
    );
  }
  if (targetDay === "Friday") {
    return (
      upper.includes("FRI") || upper.includes("MWF") || upper.includes("F")
    );
  }
  if (targetDay === "Saturday") {
    return (
      upper.includes("SAT") || (upper.includes("S") && !upper.includes("TH"))
    );
  }

  return false;
}

export default function StudentSchedulePage() {
  const todayIndex = useMemo(() => getTodayIndexMonToSat(), []);
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);

  const [allSchedules, setAllSchedules] = useState<StudentScheduleItem[]>([]);
  const [studentDetails, setStudentDetails] = useState<{
    name: string;
    idNumber: string;
  }>({
    name: "Student",
    idNumber: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeDay = days[activeDayIndex];

  useEffect(() => {
    let isMounted = true;

    async function fetchSignedStudentSchedules() {
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("sessionToken");

        const rawUser =
          localStorage.getItem("user") ||
          localStorage.getItem("student") ||
          localStorage.getItem("authUser");

        const storedUser = rawUser ? JSON.parse(rawUser) : null;

        let section = storedUser?.section || "";
        let department = storedUser?.department || storedUser?.program || "";
        let enrolledSubjects: string[] = Array.isArray(
          storedUser?.enrolledSubjects,
        )
          ? storedUser.enrolledSubjects
          : [];

        // Try identifiers: email, studentIdNumber, id, _id
        const lookupKeys = [
          storedUser?.email,
          storedUser?.studentIdNumber,
          storedUser?.idNumber,
          storedUser?.studentId,
          storedUser?.id,
          storedUser?._id,
        ].filter((k) => k && String(k).trim() !== "");

        let studentName =
          storedUser?.fullName ||
          storedUser?.name ||
          storedUser?.studentName ||
          "Student";

        let primaryId = lookupKeys[0] || "N/A";

        // Query student record from DB using any available lookup key
        for (const key of lookupKeys) {
          try {
            const studentRes = await fetch(
              `/api/students/${encodeURIComponent(key)}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              },
            );

            if (studentRes.ok) {
              const studentData = await studentRes.json();
              if (studentData.section && studentData.section !== "—") {
                section = studentData.section;
              }
              if (studentData.department) {
                department = studentData.department;
              }
              if (studentData.fullName || studentData.name) {
                studentName = studentData.fullName || studentData.name;
              }
              if (studentData.studentIdNumber || studentData.id) {
                primaryId = studentData.studentIdNumber || studentData.id;
              }
              if (
                Array.isArray(studentData.enrolledSubjects) &&
                studentData.enrolledSubjects.length > 0
              ) {
                enrolledSubjects = studentData.enrolledSubjects;
              }
              break; // Record found, stop searching keys
            }
          } catch (fetchErr) {
            console.warn(`Lookup failed for key ${key}`);
          }
        }

        if (isMounted) {
          setStudentDetails({
            name: studentName,
            idNumber: primaryId,
          });
        }

        // Construct parameters for schedule query
        const scheduleParams = new URLSearchParams();
        if (section && section !== "—" && section !== "N/A") {
          scheduleParams.append("section", section);
        }
        if (department && department !== "—") {
          scheduleParams.append("department", department);
        }
        if (enrolledSubjects.length > 0) {
          scheduleParams.append("enrolledSubjects", enrolledSubjects.join(","));
        }

        const targetUrl = `/api/schedules/student?${scheduleParams.toString()}`;

        const res = await fetch(targetUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load your class schedule.");
        }

        const data = await res.json();
        if (Array.isArray(data) && isMounted) {
          setAllSchedules(data);
        }
      } catch (err: any) {
        console.error("Schedule fetch error:", err);
        if (isMounted) setError(err.message || "Failed to load schedule.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSignedStudentSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeDaySchedules = useMemo(() => {
    return allSchedules.filter((sch) => matchesDay(sch.days, activeDay));
  }, [allSchedules, activeDay]);

  const handleExportPDF = () => {
    if (allSchedules.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = allSchedules
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.days}</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${item.code}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.title}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.time}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.room}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.faculty}</td>
        </tr>`,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Class Schedule - ${studentDetails.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
            .header { margin-bottom: 25px; border-bottom: 2px solid #0056b3; padding-bottom: 12px; }
            .header h1 { margin: 0 0 6px 0; color: #0056b3; font-size: 24px; }
            .header p { margin: 2px 0; color: #444; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #0056b3; color: white; padding: 12px 10px; text-align: left; font-size: 13px; }
            td { font-size: 13px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Official Class Schedule</h1>
            <p><strong>Student Name:</strong> ${studentDetails.name}</p>
            <p><strong>Student ID:</strong> ${studentDetails.idNumber}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Days</th>
                <th>Course Code</th>
                <th>Subject Title</th>
                <th>Time</th>
                <th>Room</th>
                <th>Instructor</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="student-schedule">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 header-container">
        <div className="header-text">
          <h3 className="fw-bold mb-1">Class Schedule</h3>
          <p className="text-muted mb-0">
            Current Term • <span className="fw-semibold">{activeDay}</span>
          </p>
        </div>

        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2 mt-3 mt-md-0"
          onClick={handleExportPDF}
          disabled={allSchedules.length === 0 || loading}
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body p-2">
          <div className="row g-2">
            {days.map((day, i) => {
              const isActive = i === activeDayIndex;
              const isToday = i === todayIndex;

              return (
                <div key={day} className="col">
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex(i)}
                    className={`w-100 rounded-pill py-2 fw-medium border-0 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-light text-secondary"
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span
                        className={`badge ms-2 ${
                          isActive
                            ? "bg-white text-primary"
                            : "bg-primary text-white"
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-4">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <Loader2
              className="spinner-border spinner-border-sm text-primary"
              size={22}
            />
            <span className="fw-medium">
              Loading your enrolled class schedule...
            </span>
          </div>
        </div>
      ) : error ? (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 mb-3"
          role="alert"
        >
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      ) : activeDaySchedules.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted my-3 bg-light">
          <Calendar
            size={32}
            className="mx-auto mb-2 text-secondary opacity-50"
          />
          <h5 className="fw-bold text-dark mb-1">No Classes Scheduled</h5>
          <p className="small mb-0">
            You have no scheduled classes on {activeDay}.
          </p>
        </div>
      ) : (
        activeDaySchedules.map((sch) => (
          <ScheduleCard
            key={sch._id}
            time={sch.time}
            title={sch.title}
            code={sch.code}
            room={sch.room}
            instructor={sch.faculty}
            type={
              sch.title.toLowerCase().includes("lab") ? "Laboratory" : "Lecture"
            }
          />
        ))
      )}

      <WeeklySummary schedules={allSchedules} />
    </div>
  );
}
