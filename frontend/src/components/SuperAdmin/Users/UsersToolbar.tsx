import { Search,  } from "lucide-react";
import type { RoleFilter } from "../../../pages/SuperAdmin/UsersPage";

export default function UsersToolbar({
  query,
  onQueryChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (v: RoleFilter) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
}) {
  const roleOptions: RoleFilter[] = [
    "All",
    "Super Admin",
    "Registrar",
    "Dept Head",
    "Finance",
    "Faculty",
    "Student",
  ];

  return (
    <div className="users-toolbar d-flex flex-wrap align-items-center gap-3 mb-4">
      <div className="users-search">
        <Search size={18} />
        <input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="d-flex align-items-center gap-2">

        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value as RoleFilter)}
          style={{ minWidth: "180px" }}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role === "All" ? "All Roles" : role}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value as "all" | "active" | "inactive"
            )
          }
          style={{ minWidth: "160px" }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}