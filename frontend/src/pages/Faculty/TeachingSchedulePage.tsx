import { useEffect, useState } from "react";
import FacultyScheduleHeader from "../../components/Faculty/Schedule/FacultyScheduleHeader";
import FacultyScheduleGrid from "../../components/Faculty/Schedule/FacultyScheduleGrid";
import FacultyScheduleStats from "../../components/Faculty/Schedule/FacultyScheduleStats";
import { transformApiScheduleToGrid } from "../../utils/scheduleTransform";
import { CalendarX } from "lucide-react";
import "../../styles/faculty-schedule.css";

export type ScheduleItem = {
  id: string;
  start: string;
  end: string;
  meridiem: "AM" | "PM";
  code: string;
  title: string;
  locationLabel: string;
  students: number;
  tone: "blue" | "purple" | "green" | "orange";
};

export type DaySchedule = {
  key: string;
  label: string;
  isToday?: boolean;
  items: ScheduleItem[];
};

export default function TeachingSchedulePage() {
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userDepartment = storedUser?.department || "";
  const facultyName = storedUser?.name || "";

  useEffect(() => {
    const fetchAssignedSchedule = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const query = new URLSearchParams({
          department: userDepartment,
          faculty: facultyName,
        }).toString();

        const response = await fetch(`/api/schedules?${query}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load schedule data.");
        }

        const data = await response.json();
        const formattedDays = transformApiScheduleToGrid(data);
        setScheduleData(formattedDays);
      } catch (err: any) {
        console.error("Schedule fetch error:", err);
        setError(err.message || "Error loading schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedSchedule();
  }, [userDepartment, facultyName]);

  const totalClassesCount = scheduleData.reduce((acc, day) => acc + day.items.length, 0);

  const uniqueCourses = new Set(
    scheduleData.flatMap((d) => d.items.map((it) => it.code))
  ).size;

  const totalHours = scheduleData.reduce(
    (sum, day) => sum + day.items.length * 1.5,
    0
  );

  const totalStudents = scheduleData.reduce(
    (sum, day) => sum + day.items.reduce((s, it) => s + it.students, 0),
    0
  );

  const roomsUsed = new Set(
    scheduleData.flatMap((d) => d.items.map((it) => it.locationLabel))
  ).size;

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading schedule...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 faculty-schedule-page">
      <FacultyScheduleHeader
        title="Teaching Schedule"
        subtitle={`Schedule for ${facultyName || "Faculty Member"}`}
        pillText={`${userDepartment || "General"} Department`}
      />

      <div className="faculty-schedule-stats-wrap mb-4">
        <FacultyScheduleStats
          items={[
            { label: "Courses", value: uniqueCourses, tone: "blue" },
            { label: "Hours/Week", value: totalHours, tone: "purple" },
            { label: "Total Students", value: totalStudents, tone: "green" },
            { label: "Rooms Used", value: roomsUsed, tone: "orange" },
          ]}
        />
      </div>

      {totalClassesCount === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center">
          <CalendarX size={48} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="fw-bold text-dark">No Teaching Schedule Assigned</h5>
          <p className="text-muted mb-0">
            There are currently no active class schedules assigned to your account for this semester.
          </p>
        </div>
      ) : (
        <FacultyScheduleGrid days={scheduleData} />
      )}
    </div>
  );
}