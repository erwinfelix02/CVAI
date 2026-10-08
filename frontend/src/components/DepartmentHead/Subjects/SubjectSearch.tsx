// ✅ src/components/DepartmentHead/Subjects/SubjectSearch.tsx

import { Search, Filter, ChevronDown, Calendar } from "lucide-react";
import type { CourseItem } from "./AddSubjectModal";

interface SubjectSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  program: string;
  onProgramChange: (value: string) => void;
  semester: string;
  onSemesterChange: (value: string) => void;
  programs?: CourseItem[];
}

export default function SubjectSearch({
  search,
  onSearchChange,
  program,
  onProgramChange,
  semester,
  onSemesterChange,
  programs = [],
}: SubjectSearchProps) {
  return (
    <div className="subject-search-wrapper flex-wrap">
      {/* SEARCH */}
      <div className="subject-search-box flex-fill">
        <Search size={21} className="subject-search-icon" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search subject or code..."
        />
      </div>

      {/* SEMESTER FILTER */}
      <div className="subject-program-filter">
        <Calendar size={18} />
        <select
          value={semester}
          onChange={(event) => onSemesterChange(event.target.value)}
          aria-label="Filter by semester"
        >
          <option value="All Semesters">All Semesters</option>
          <option value="1st Semester">1st Semester</option>
          <option value="2nd Semester">2nd Semester</option>
          <option value="Summer">Summer</option>
        </select>
        <ChevronDown size={18} className="subject-filter-arrow" />
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