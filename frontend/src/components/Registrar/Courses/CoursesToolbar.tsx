import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  departmentOptions: string[];
};

export default function CoursesToolbar({
  query,
  onQueryChange,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  departmentOptions,
}: Props) {
  return (
    <div className="courses-toolbar">
      <div className="courses-search">
        <Search size={18} className="courses-search-icon" />
        <input
          className="form-control courses-search-input"
          placeholder="Search courses..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="courses-filter">
        <select
          className="form-select courses-filter-select"
          value={departmentFilter}
          onChange={(e) => onDepartmentFilterChange(e.target.value)}
        >
          <option value="All Departments">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="courses-filter">
        <select
          className="form-select courses-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}