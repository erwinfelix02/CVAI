import { useState } from "react";
import StatsCards from "../../components/Faculty/Student/StatsCards";
import StudentList from "../../components/Faculty/Student/StudentList";
import { Download, UserPlus, Search, Filter } from "lucide-react";
import "../../styles/faculty-students.css";

export default function StudentsPage() {
  const [sectionFilter, setSectionFilter] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <div className="container-fluid faculty-students-page">
      {/* HEADER */}
      <div className="students-header">
        <div>
          <h3 className="fw-bold mb-1">Student Management</h3>
          <p className="text-muted mb-0">
            Manage and view your students' information
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-success d-flex align-items-center gap-2">
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* STATS */}
      <StatsCards />

      {/* SEARCH + FILTER */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row gap-3">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-white">
              <Search size={16} />
            </span>
            <input
              className="form-control"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dropdown w-100 w-md-auto">
            <button
              className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
            >
              <Filter size={16} />
              {sectionFilter === "All" ? "All Sections" : sectionFilter}
            </button>

            <ul className="dropdown-menu dropdown-menu-end w-100">
              {["All", "CS-3A", "CS-3B"].map((s) => (
                <li key={s}>
                  <button
                    className={`dropdown-item ${
                      sectionFilter === s ? "active" : ""
                    }`}
                    onClick={() => setSectionFilter(s)}
                  >
                    {s === "All" ? "All Sections" : s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* LIST */}
      <StudentList search={search} sectionFilter={sectionFilter} />
    </div>
  );
}
