import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;

  course: string;
  onCourseChange: (v: string) => void;
  courseOptions: string[];
};

export default function SectionsToolbar({
  query,
  onQueryChange,
  course,
  onCourseChange,
  courseOptions,
}: Props) {
  return (
    <div className="card shadow-sm sections-toolbar mb-3 mb-md-4">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-8">
            <div className="sections-search">
              <Search size={18} className="sections-search-ic" />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="form-control sections-search-input"
                placeholder="Search sections or advisers..."
              />
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <select
              className="form-select sections-select"
              value={course}
              onChange={(e) => onCourseChange(e.target.value)}
            >
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
