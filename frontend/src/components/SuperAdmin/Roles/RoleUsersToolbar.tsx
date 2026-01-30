import { Search, SlidersHorizontal } from "lucide-react";

type StatusFilter = "All" | "Active" | "Inactive";

type Props = {
  q: string;
  onQChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
};

export default function RoleUsersToolbar({ q, onQChange, statusFilter, onStatusChange }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-body d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center">
        <div className="input-group flex-grow-1">
          <span className="input-group-text bg-white">
            <Search size={16} />
          </span>
          <input
            className="form-control"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search user id, name or email…"
          />
        </div>

        <div className="d-flex align-items-center gap-2" style={{ minWidth: 220 }}>
          <div className="text-muted small d-flex align-items-center gap-2 px-1 text-nowrap">
            <SlidersHorizontal size={16} />
            Status
          </div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
