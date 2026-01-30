import { Search } from "lucide-react";
import type { UserRole } from "../../../pages/SuperAdmin/UsersPage";

export default function UsersToolbar({
  query,
  onQueryChange,
  roleFilter,
  onRoleFilterChange,
  roleOptions,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  roleFilter: "All" | UserRole;
  onRoleFilterChange: (v: "All" | UserRole) => void;
  roleOptions: Array<"All" | UserRole>;
}) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3 mb-3">
      {/* ✅ Search (responsive width) */}
      <div className="position-relative users-search">
        <span className="users-search-icon" aria-hidden="true">
          <Search size={18} />
        </span>

        <input
          className="form-control users-search-input"
          placeholder="Search by name, email, or ID..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {/* Role filter pills */}
      <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-lg-end users-filters">
        {roleOptions.map((opt) => {
          const active = roleFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              className={`btn btn-sm rounded-pill ${
                active ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => onRoleFilterChange(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
