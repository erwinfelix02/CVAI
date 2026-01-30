// src/pages/DepartmentHead/ScheduleManagementPage.tsx
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import ScheduleToolbar from "../../components/DepartmentHead/Schedules/ScheduleToolbar";
import ScheduleCard from "../../components/DepartmentHead/Schedules/ScheduleCard";
import type { DayFilter, ScheduleRow } from "../../components/DepartmentHead/Schedules/types";

import "../../styles/dept-schedules.css";

const seed: ScheduleRow[] = [
  {
    id: "1",
    code: "CSPC 101",
    section: "BSCS-1A",
    title: "Introduction to Programming",
    faculty: "Dr. John Smith",
    room: "Room 301",
    days: "MWF",
    time: "08:00-09:00",
  },
  {
    id: "2",
    code: "ITPC 202",
    section: "BSIT-2A",
    title: "Web Development",
    faculty: "Prof. Maria Garcia",
    room: "Lab 1",
    days: "TTh",
    time: "10:00-11:30",
  },
  {
    id: "3",
    code: "CSPC 305",
    section: "BSCS-3A",
    title: "Database Systems",
    faculty: "Dr. Robert Lee",
    room: "Room 405",
    days: "MWF",
    time: "13:00-14:00",
  },
  {
    id: "4",
    code: "CSPC 401",
    section: "BSCS-4A",
    title: "Software Engineering",
    faculty: "Prof. Sarah Chen",
    room: "Room 302",
    days: "TTh",
    time: "08:00-09:30",
  },
];

export default function ScheduleManagementPage() {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<DayFilter>("All Days");
  const [rows, setRows] = useState<ScheduleRow[]>(seed);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.faculty.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q);

      const matchesDay = day === "All Days" ? true : r.days === day;
      return matchesQuery && matchesDay;
    });
  }, [rows, query, day]);

  const onCreate = () => {
    // replace with your modal
    alert("Create Schedule clicked");
  };

  const onEdit = (row: ScheduleRow) => {
    // replace with your modal
    alert(`Edit: ${row.code}`);
  };

  const onDelete = (row: ScheduleRow) => {
    if (!confirm(`Delete schedule for ${row.code} (${row.section})?`)) return;
    setRows((p) => p.filter((x) => x.id !== row.id));
  };

  return (
    <div className="dept-page">
      {/* Header row */}
      <div className="d-flex align-items-start align-items-md-center justify-content-between gap-3 flex-wrap">
        <div>
          <h2 className="dept-h2 mb-1">Schedule Management</h2>
          <div className="text-muted">
            Assigning subjects, faculty, rooms, and time slots
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-4 px-4 py-2 dept-primary-btn d-inline-flex align-items-center gap-2"
          onClick={onCreate}
        >
          <Plus size={18} />
          Create Schedule
        </button>
      </div>

      {/* Toolbar */}
      <div className="mt-4">
        <ScheduleToolbar
          query={query}
          onQueryChange={setQuery}
          day={day}
          onDayChange={setDay}
        />
      </div>

      {/* List */}
      <div className="mt-4 d-flex flex-column gap-3">
        {filtered.map((row) => (
          <ScheduleCard key={row.id} row={row} onEdit={onEdit} onDelete={onDelete} />
        ))}

        {filtered.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-muted">
              No schedules match your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
