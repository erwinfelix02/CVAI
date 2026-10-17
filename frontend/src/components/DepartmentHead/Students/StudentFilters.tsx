// ✅ src/components/DepartmentHead/Students/StudentFilters.tsx

import React from 'react';
import { Search } from 'lucide-react';

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  selectedSection: string;
  onSectionChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  years: string[];
  sections: string[];
  courses: string[];
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  selectedCourse,
  onCourseChange,
  years,
  sections,
  courses,
}) => {
  return (
    <div className="row g-2 w-100 m-0">
      {/* Search Bar */}
      <div className="col-12 col-lg-3 p-0 pe-lg-2 mb-2 mb-lg-0">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 rounded-start-3 text-muted ps-3">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or student no..."
            className="form-control border-start-0 rounded-end-3 shadow-none py-2"
          />
        </div>
      </div>

      {/* Dropdown Filters Group */}
      <div className="col-12 col-lg-9 p-0">
        <div className="row g-2">
          {/* Course / Program Filter */}
          <div className="col-6 col-md-3">
            <select
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              className="form-select rounded-3 shadow-none py-2"
            >
              <option value="All">All Programs</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Enrollment Status Filter */}
          <div className="col-6 col-md-3">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="form-select rounded-3 shadow-none py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Unassigned">Unassigned</option>
              <option value="Drop Requested">Drop Requested</option>
              <option value="Transfer Pending">Transfer Pending</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="col-6 col-md-3">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="form-select rounded-3 shadow-none py-2"
            >
              <option value="All">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="col-6 col-md-3">
            <select
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="form-select rounded-3 shadow-none py-2"
            >
              <option value="All">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};