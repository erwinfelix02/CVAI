// ✅ src/components/DepartmentHead/Faculty/FacultySearch.tsx

import {
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

interface FacultySearchProps {
  search: string;
  onSearchChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;
}

export default function FacultySearch({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: FacultySearchProps) {
  return (
    <div className="faculty-search-wrapper">
      {/* Search */}
      <div className="faculty-search-box">
        <Search
          size={21}
          className="faculty-search-icon"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search faculty or specialization..."
        />
      </div>

      {/* Filter */}
      <div className="faculty-status-filter">
        <Filter size={19} />

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          aria-label="Filter faculty status"
        >
          <option value="All">
            All Status
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Full Load">
            Full Load
          </option>

          <option value="Overloaded">
            Overloaded
          </option>
        </select>

        <ChevronDown
          size={18}
          className="faculty-filter-arrow"
        />
      </div>
    </div>
  );
}