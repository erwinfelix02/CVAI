import { Search } from "lucide-react";
import type { CourseOption } from "./types";

type Props = {
  courses: CourseOption[];
  courseId: string;
  setCourseId: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
};

export default function GradesFilters({
  courses,
  courseId,
  setCourseId,
  search,
  setSearch,
}: Props) {
  return (
    <div className="card shadow-sm mb-3 mb-md-4 faculty-grades-filters">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                className="form-control"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
