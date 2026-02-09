import { useState } from "react";
import { Search, Filter } from "lucide-react";
import type { RoleTab } from "../../../pages/SuperAdmin/UsersPage";

export default function UsersToolbar({
  query,
  onQueryChange,
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  activeTab: RoleTab;
  onTabChange: (v: RoleTab) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
}) {
  const [open, setOpen] = useState(false);

  const tabs: RoleTab[] = [
    "All",
    "Admins",
    "Registrar",
    "Dept Heads",
    "Finance",
    "Faculty",
    "Students",
  ];

  return (
    <div className="users-toolbar">
      <div className="users-search">
        <Search size={18} />
        <input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="users-filter-wrap">
        <button
          className="users-filter-btn"
          onClick={() => setOpen((v) => !v)}
        >
          <Filter size={18} />
        </button>

        {open && (
          <div className="users-filter-menu">
            <button
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => {
                onStatusFilterChange("all");
                setOpen(false);
              }}
            >
              All
            </button>
            <button
              className={statusFilter === "active" ? "active" : ""}
              onClick={() => {
                onStatusFilterChange("active");
                setOpen(false);
              }}
            >
              Active
            </button>
            <button
              className={statusFilter === "inactive" ? "active" : ""}
              onClick={() => {
                onStatusFilterChange("inactive");
                setOpen(false);
              }}
            >
              Inactive
            </button>
          </div>
        )}
      </div>

      <div className="users-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`users-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => onTabChange(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
