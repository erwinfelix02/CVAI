// ✅ src/components/DepartmentHead/Subjects/SubjectSearch.tsx

import { Search, Filter, ChevronDown } from "lucide-react";
import type { CourseItem } from "./AddSubjectModal";

interface SubjectSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  program: string;
  onProgramChange: (value: string) => void;
  programs?: CourseItem[];
}

export default function SubjectSearch({
  search,
  onSearchChange,
  program,
  onProgramChange,
  programs = [],
}: SubjectSearchProps) {
  return (
    <div className="subject-search-wrapper">
      {/* SEARCH */}
      <div className="subject-search-box">
        <Search size={21} className="subject-search-icon" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search subject or code..."
        />
      </div>

      {/* PROGRAM FILTER */}
      <div className="subject-program-filter">
        <Filter size={19} />
        <select
          value={program}
          onChange={(event) => onProgramChange(event.target.value)}
          aria-label="Filter by program"
        >
          <option value="All Programs">All Programs</option>
          {programs.map((prog) => (
            <option key={prog._id} value={prog.code}>
              {prog.code}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="subject-filter-arrow" />
      </div>
    </div>
  );
}