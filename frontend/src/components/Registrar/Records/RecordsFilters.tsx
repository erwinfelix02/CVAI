import { Search, ChevronDown } from "lucide-react";
import type { StudentStatus } from "./types";

type Props = {
  query: string;
  setQuery: (v: string) => void;

  status: StudentStatus | "All";
  setStatus: (v: StudentStatus | "All") => void;

  course: string | "All";
  setCourse: (v: string | "All") => void;

  courses: string[];
};

export default function RecordsFilters({
  query,
  setQuery,
  status,
  setStatus,
  course,
  setCourse,
  courses,
}: Props) {
  return (
    <div className="card shadow-sm registrar-card mb-3 mb-md-4 registrar-filters-card">
      <div className="card-body registrar-filters-body">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-lg">
            <div className="input-group registrar-search">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                className="form-control"
                placeholder="Search by name or student ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-lg-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Dropped">Dropped</option>
                <option value="Graduated">Graduated</option>
              </select>
              <ChevronDown size={16} className="caret" />
            </div>
          </div>

          <div className="col-12 col-lg-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={course}
                onChange={(e) => setCourse(e.target.value as any)}
              >
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Courses" : c}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="caret" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
