import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
};

export default function FacultyToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-9">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>

              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, ID, or email..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(
                  e.target.value as "all" | "active" | "inactive"
                )
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
