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

  year: number | "All";
  setYear: (v: number | "All") => void;
  years: Array<number | "All">;

  section: string | "All";
  setSection: (v: string | "All") => void;
  sections: string[];
};

export default function RecordsFilters({
  query,
  setQuery,
  status,
  setStatus,
  course,
  setCourse,
  courses,
  year,
  setYear,
  years,
  section,
  setSection,
  sections,
}: Props) {
  return (
    <div className="card shadow-sm registrar-card mb-3 mb-md-4 registrar-filters-card">
      <div className="card-body registrar-filters-body">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-xl">
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

          <div className="col-12 col-sm-6 col-xl-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as StudentStatus | "All")
                }
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Dropped">Dropped</option>
                <option value="Graduated">Graduated</option>
              </select>
              <ChevronDown size={16} className="caret" />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={course}
                onChange={(e) => setCourse(e.target.value as string | "All")}
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

          <div className="col-12 col-sm-6 col-xl-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value === "All" ? "All" : Number(e.target.value))
                }
              >
                {years.map((y) => (
                  <option key={String(y)} value={y}>
                    {y === "All" ? "All Years" : `Year ${y}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="caret" />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-auto">
            <div className="registrar-pill-select">
              <select
                className="form-select"
                value={section}
                onChange={(e) => setSection(e.target.value as string | "All")}
              >
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Sections" : s}
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