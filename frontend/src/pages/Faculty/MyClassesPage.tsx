import { useMemo } from "react";
import ClassCard from "../../components/Faculty/Classes/ClassCard";
import type { ClassItem } from "../../components/Faculty/Classes/types";
import { CalendarDays } from "lucide-react";
import "../../styles/faculty-classes.css";

const classes: ClassItem[] = [
  {
    id: "cs101",
    code: "CS 101",
    title: "Introduction to Programming",
    section: "Section A",
    schedule: "MWF 8:00-9:00 AM",
    room: "Lab 1",
    students: 35,
    capacity: 40,
    progress: 45,
    accent: "blue",
    assigned: true,
  },
  {
    id: "cs201",
    code: "CS 201",
    title: "Data Structures & Algorithms",
    section: "Section A",
    schedule: "TTH 10:00-11:30 AM",
    room: "Room 302",
    students: 42,
    capacity: 45,
    progress: 62,
    accent: "purple",
    assigned: true,
  },
  {
    id: "cs301",
    code: "CS 301",
    title: "Algorithm Analysis",
    section: "Section B",
    schedule: "MWF 1:00-2:00 PM",
    room: "Room 401",
    students: 28,
    capacity: 35,
    progress: 38,
    accent: "green",
    assigned: true,
  },
  {
    id: "cs401",
    code: "CS 401",
    title: "Software Engineering",
    section: "Section A",
    schedule: "TTH 3:00-4:30 PM",
    room: "Lab 2",
    students: 19,
    capacity: 25,
    progress: 55,
    accent: "orange",
    assigned: true,
  },
];

export default function AssignedClassesPage() {
  const stats = useMemo(() => {
    const assignedCourses = classes.length;
    const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
    const rooms = new Set(classes.map((c) => c.room)).size;
    const hoursPerWeek = 12; // sample (replace with real calc later)
    return { assignedCourses, totalStudents, rooms, hoursPerWeek };
  }, []);

  return (
    <div className="container-fluid faculty-classes-scope">

      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3 mb-md-4">
        <div>
          <h3 className="fw-bold mb-1">My Assigned Classes</h3>
          <p className="text-muted mb-0">
            View your assigned courses and schedules from the admin
          </p>
        </div>

        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 faculty-semester-pill">
          <CalendarDays size={16} />
          1st Semester 2024-2025
        </button>
      </div>

      {/* Info Banner */}
      <div className="card shadow-sm faculty-info-banner mb-3 mb-md-4">
        <div className="card-body d-flex gap-3 align-items-start">
          <div className="info-icon">
            <CalendarDays size={20} />
          </div>
          <div className="minw-0">
            <div className="fw-semibold">
              Schedules are assigned by the administration
            </div>
            <div className="text-muted small">
              Contact the admin office for schedule changes or course assignment requests
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3 mb-md-4">
        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.assignedCourses}</div>
              <div className="mini-stat-label">Assigned Courses</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.totalStudents}</div>
              <div className="mini-stat-label">Total Students</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.rooms}</div>
              <div className="mini-stat-label">Rooms</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card shadow-sm h-100 faculty-mini-stat">
            <div className="card-body text-center">
              <div className="mini-stat-value">{stats.hoursPerWeek}</div>
              <div className="mini-stat-label">Hours/Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3 g-md-4">
        {classes.map((item) => (
          <div key={item.id} className="col-12 col-lg-6">
            <ClassCard
              item={item}
              onStudents={() => console.log("Students:", item.id)}
              onMaterials={() => console.log("Materials:", item.id)}
              onGrades={() => console.log("Grades:", item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
