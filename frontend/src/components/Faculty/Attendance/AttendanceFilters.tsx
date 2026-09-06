import { Search } from "lucide-react";

export default function AttendanceFilters({
  subject,
  subjects,
  onSubjectChange,
  date,
  onDateChange,
  query,
  onQueryChange,
}: {
  subject: string;
  subjects: { value: string; label: string }[];
  onSubjectChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="card att-filters-card mb-3">
      <div className="card-body">
        <div className="row g-3 align-items-center att-filters-row">
          <div className="col-12 col-lg-4">
            <select
              className="form-select att-input"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
            >
              <option value="" disabled>
                Select Course...
              </option>
              {subjects.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-lg-3">
            <input
              type="date"
              className="form-control att-input"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          <div className="col-12 col-lg-5">
            <div className="input-group att-search-group">
              <span className="input-group-text att-search-icon">
                <Search size={18} />
              </span>
              <input
                className="form-control att-search-input"
                placeholder="Search students..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}