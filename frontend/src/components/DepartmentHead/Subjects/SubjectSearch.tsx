// ✅ src/components/DepartmentHead/Subjects/SubjectSearch.tsx

import {
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

interface SubjectSearchProps {
  search: string;
  onSearchChange: (value: string) => void;

  program: string;
  onProgramChange: (value: string) => void;
}

export default function SubjectSearch({
  search,
  onSearchChange,
  program,
  onProgramChange,
}: SubjectSearchProps) {
  return (
    <div className="subject-search-wrapper">
      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="subject-search-box">
        <Search
          size={21}
          className="subject-search-icon"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search subject or code..."
        />
      </div>

      {/* =====================================================
          PROGRAM FILTER
          ===================================================== */}

      <div className="subject-program-filter">
        <Filter size={19} />

        <select
          value={program}
          onChange={(event) =>
            onProgramChange(event.target.value)
          }
          aria-label="Filter by program"
        >
          <option value="All Programs">
            All Programs
          </option>

          <option value="BSCS">
            BSCS
          </option>

          <option value="BSIT">
            BSIT
          </option>
        </select>

        <ChevronDown
          size={18}
          className="subject-filter-arrow"
        />
      </div>
    </div>
  );
}