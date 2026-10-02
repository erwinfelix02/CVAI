import { Search } from "lucide-react";

type Props = {
  courses: string[];
  courseFilter: string;
  setCourseFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
};

export default function MaterialsFilters({
  courses,
  courseFilter,
  setCourseFilter,
  search,
  setSearch,
}: Props) {
  return (
    <div className="card shadow-sm mb-3 mb-md-4 faculty-materials-filters">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Course dropdown */}
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="col-12 col-md-9">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                className="form-control"
                placeholder="Search materials..."
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
