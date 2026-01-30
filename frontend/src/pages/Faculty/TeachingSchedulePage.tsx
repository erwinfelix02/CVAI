import FacultyScheduleHeader from "../../components/Faculty/Schedule/FacultyScheduleHeader";
import FacultyScheduleGrid from "../../components/Faculty/Schedule/FacultyScheduleGrid";
import FacultyScheduleStats from "../../components/Faculty/Schedule/FacultyScheduleStats";
import "../../styles/faculty-schedule.css";

export type ScheduleItem = {
  id: string;
  start: string; // "8:00"
  end: string; // "9:00"
  meridiem: "AM" | "PM";
  code: string; // "CS 101"
  title: string; // "Intro to Programming"
  locationLabel: string; // "Lab 1" / "Room 401"
  students: number;
  tone: "blue" | "purple" | "green" | "orange";
};

export type DaySchedule = {
  key: string; // "monday"
  label: string; // "Monday"
  isToday?: boolean;
  items: ScheduleItem[];
};

const scheduleData: DaySchedule[] = [
  {
    key: "monday",
    label: "Monday",
    items: [
      {
        id: "m1",
        start: "8:00",
        end: "9:00",
        meridiem: "AM",
        code: "CS 101",
        title: "Intro to Programming",
        locationLabel: "Lab 1",
        students: 35,
        tone: "blue",
      },
      {
        id: "m2",
        start: "1:00",
        end: "2:00",
        meridiem: "PM",
        code: "CS 301",
        title: "Algorithm Analysis",
        locationLabel: "Room 401",
        students: 28,
        tone: "green",
      },
    ],
  },
  {
    key: "tuesday",
    label: "Tuesday",
    items: [
      {
        id: "t1",
        start: "10:00",
        end: "11:30",
        meridiem: "AM",
        code: "CS 201",
        title: "Data Structures",
        locationLabel: "Room 302",
        students: 42,
        tone: "purple",
      },
      {
        id: "t2",
        start: "3:00",
        end: "4:30",
        meridiem: "PM",
        code: "CS 401",
        title: "Software Engineering",
        locationLabel: "Lab 2",
        students: 19,
        tone: "orange",
      },
    ],
  },
  {
    key: "wednesday",
    label: "Wednesday",
    items: [
      {
        id: "w1",
        start: "8:00",
        end: "9:00",
        meridiem: "AM",
        code: "CS 101",
        title: "Intro to Programming",
        locationLabel: "Lab 1",
        students: 35,
        tone: "blue",
      },
      {
        id: "w2",
        start: "1:00",
        end: "2:00",
        meridiem: "PM",
        code: "CS 301",
        title: "Algorithm Analysis",
        locationLabel: "Room 401",
        students: 28,
        tone: "green",
      },
    ],
  },
  {
    key: "thursday",
    label: "Thursday",
    items: [
      {
        id: "th1",
        start: "10:00",
        end: "11:30",
        meridiem: "AM",
        code: "CS 201",
        title: "Data Structures",
        locationLabel: "Room 302",
        students: 42,
        tone: "purple",
      },
      {
        id: "th2",
        start: "3:00",
        end: "4:30",
        meridiem: "PM",
        code: "CS 401",
        title: "Software Engineering",
        locationLabel: "Lab 2",
        students: 19,
        tone: "orange",
      },
    ],
  },
  {
    key: "friday",
    label: "Friday",
    isToday: true,
    items: [
      {
        id: "f1",
        start: "8:00",
        end: "9:00",
        meridiem: "AM",
        code: "CS 101",
        title: "Intro to Programming",
        locationLabel: "Lab 1",
        students: 35,
        tone: "blue",
      },
      {
        id: "f2",
        start: "1:00",
        end: "2:00",
        meridiem: "PM",
        code: "CS 301",
        title: "Algorithm Analysis",
        locationLabel: "Room 401",
        students: 28,
        tone: "green",
      },
    ],
  },
];

export default function TeachingSchedulePage() {
  // quick stats derived
  const courses = 4;
  const hoursWeek = 18;
  const totalStudents = 124;
  const roomsUsed = 4;

  return (
    <div className="container-fluid py-4 faculty-schedule-page">
      <FacultyScheduleHeader
        title="Teaching Schedule"
        subtitle="Your weekly class schedule"
        pillText="2nd Semester, AY 2024-2025"
      />
        {/* ✅ ADD THIS WRAPPER */}
      <div className="faculty-schedule-stats-wrap">
        <FacultyScheduleStats
          items={[
            { label: "Courses", value: courses, tone: "blue" },
            { label: "Hours/Week", value: hoursWeek, tone: "purple" },
            { label: "Total Students", value: totalStudents, tone: "green" },
            { label: "Rooms Used", value: roomsUsed, tone: "orange" },
          ]}
        />
      </div>

      <FacultyScheduleGrid days={scheduleData} />
    </div>
  );
}
