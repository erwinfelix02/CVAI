// ✅ src/components/DepartmentHead/Sections/BulkAssignmentTab.tsx

import { useState, useMemo } from "react";
import { Search, Check, ListChecks, UserMinus } from "lucide-react";
import type {
  Section,
  StudentAssignment,
} from "../../../pages/DepartmentHead/DepartmentHeadSections";

interface BulkAssignmentTabProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  yearFilter: string;
  onYearFilterChange: (y: string) => void;
  programFilter: string;
  onProgramFilterChange: (p: string) => void;
  uniquePrograms: string[];
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  selectedStudents: string[];
  targetSection: string;
  onTargetSectionChange: (sec: string) => void;
  sections: Section[];
  filteredStudents: StudentAssignment[];
  students: StudentAssignment[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectStudent: (id: string) => void;
  onAutoSelectByProgram: () => void;
  onAssignSelected: () => void;
  onUnassignSelected: () => void;
}

export default function BulkAssignmentTab({
  searchQuery,
  onSearchChange,
  yearFilter,
  onYearFilterChange,
  programFilter,
  onProgramFilterChange,
  uniquePrograms,
  statusFilter,
  onStatusFilterChange,
  selectedStudents,
  targetSection,
  onTargetSectionChange,
  sections,
  filteredStudents,
  students,
  onSelectAll,
  onSelectStudent,
  onAutoSelectByProgram,
  onAssignSelected,
  onUnassignSelected,
}: BulkAssignmentTabProps) {
  const [isHoveredAuto, setIsHoveredAuto] = useState(false);
  const allSelected =
    filteredStudents.length > 0 &&
    selectedStudents.length === filteredStudents.length;

  const availableSections = useMemo(() => {
    if (selectedStudents.length === 0) {
      return sections.filter((sec) => {
        const matchesProg = programFilter === "All Programs" || sec.program === programFilter;
        const matchesYear = yearFilter === "All Years" || sec.year.toString() === yearFilter.replace("Year ", "");
        return matchesProg && matchesYear;
      });
    }

    const selectedObjs = students.filter((s) => selectedStudents.includes(s.id));
    const firstProg = selectedObjs[0]?.program;
    const firstYear = selectedObjs[0]?.year;

    const allSameProgramAndYear = selectedObjs.every(
      (s) => s.program === firstProg && s.year === firstYear
    );

    if (!allSameProgramAndYear) {
      return [];
    }

    return sections.filter(
      (sec) => sec.program === firstProg && sec.year === firstYear
    );
  }, [selectedStudents, students, sections, programFilter, yearFilter]);

  return (
    <div
      className="card border-0 shadow-sm p-4 w-100"
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* SEARCH & FILTERS BAR */}
      <div
        className="row g-2 mb-3 align-items-center mx-0"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <div className="col-12 col-md-3 px-1">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 shadow-none"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="col-6 col-md-3 px-1">
          <select
            className="form-select shadow-none"
            value={programFilter}
            onChange={(e) => onProgramFilterChange(e.target.value)}
          >
            <option>All Programs</option>
            {uniquePrograms.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3 px-1">
          <select
            className="form-select shadow-none"
            value={yearFilter}
            onChange={(e) => onYearFilterChange(e.target.value)}
          >
            <option>All Years</option>
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
          </select>
        </div>
        <div className="col-12 col-md-3 px-1">
          <select
            className="form-select shadow-none"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option>All Students</option>
            <option>Assigned</option>
            <option>Unassigned</option>
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      <div
        className="bg-light p-3 rounded mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
        style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
      >
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="small fw-semibold badge bg-secondary px-2 py-2">
            {selectedStudents.length} student
            {selectedStudents.length !== 1 ? "s" : ""} selected
          </span>
          {programFilter !== "All Programs" && (
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center gap-1 text-nowrap py-1 px-3 shadow-sm"
              style={{
                fontSize: "12px",
                backgroundColor: isHoveredAuto ? "#0d5173" : "#ffffff",
                color: isHoveredAuto ? "#ffffff" : "#0d5173",
                borderColor: "#0d5173",
                borderWidth: "1px",
                borderStyle: "solid",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={() => setIsHoveredAuto(true)}
              onMouseLeave={() => setIsHoveredAuto(false)}
              onClick={onAutoSelectByProgram}
            >
              <ListChecks size={14} /> Auto-Select {programFilter} ({yearFilter}
              )
            </button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-1">
            <label
              className="small fw-semibold text-secondary text-nowrap mb-0"
              style={{ fontSize: "13px" }}
            >
              Target Section:
            </label>
            <select
              className="form-select form-select-sm w-auto shadow-none"
              style={{ borderColor: targetSection ? "#0d5173" : "#ced4da" }}
              value={targetSection}
              onChange={(e) => onTargetSectionChange(e.target.value)}
            >
              <option value="">
                {selectedStudents.length > 0
                  ? "Select matching section..."
                  : "Select section (or pick students first)..."}
              </option>
              {availableSections.map((sec) => (
                <option key={sec.id} value={sec.name}>
                  {sec.name} ({sec.program} · Yr {sec.year}) - {sec.enrolled}/{sec.capacity}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-sm text-nowrap text-white px-3"
            style={{
              backgroundColor:
                selectedStudents.length > 0 && targetSection
                  ? "#0d5173"
                  : "#6c757d",
              borderColor:
                selectedStudents.length > 0 && targetSection
                  ? "#0d5173"
                  : "#6c757d",
              opacity:
                selectedStudents.length === 0 || !targetSection ? 0.65 : 1,
              transition: "all 0.2s ease-in-out",
            }}
            disabled={selectedStudents.length === 0 || !targetSection}
            onClick={onAssignSelected}
          >
            Assign Selected
          </button>
          <button
            className="btn btn-outline-danger btn-sm text-nowrap px-3 d-flex align-items-center gap-1 shadow-sm"
            disabled={selectedStudents.length === 0}
            onClick={onUnassignSelected}
          >
            <UserMinus size={14} /> Unassign
          </button>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div
        className="table-responsive w-100"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        <table
          className="table align-middle mb-0"
          style={{ width: "100%", minWidth: "650px" }}
        >
          <thead className="table-light text-muted small">
            <tr>
              <th
                style={{ width: "40px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "20px",
                    height: "20px",
                    border: allSelected
                      ? "2px solid #0d5173"
                      : "2px solid #cbd5e1",
                    backgroundColor: allSelected ? "#0d5173" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => {
                    const fakeEvent = {
                      target: { checked: !allSelected },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onSelectAll(fakeEvent);
                  }}
                >
                  {allSelected && (
                    <Check size={12} color="#fff" strokeWidth={3} />
                  )}
                </div>
              </th>
              <th>Student</th>
              <th>Year</th>
              <th>Status</th>
              <th>Program</th>
              <th>Section</th>
              <th>Assigned Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
                  No students found matching your filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedStudents.includes(st.id);
                return (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStudent(st.id)}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "20px",
                          height: "20px",
                          border: isSelected
                            ? "2px solid #0d5173"
                            : "2px solid #cbd5e1",
                          backgroundColor: isSelected ? "#0d5173" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onClick={() => onSelectStudent(st.id)}
                      >
                        {isSelected && (
                          <Check size={12} color="#fff" strokeWidth={3} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{st.name}</div>
                      <small className="text-muted">{st.studentNo}</small>
                    </td>
                    <td>{st.year}</td>
                    <td>
                      <span
                        className={`badge ${
                          st.status === "Assigned"
                            ? "bg-success text-white"
                            : "bg-warning text-white"
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td>
                      <span className="small text-secondary fw-medium">
                        {st.program}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          st.section !== "—" && st.section !== ""
                            ? "bg-dark text-white"
                            : "bg-light text-muted border"
                        }`}
                      >
                        {st.section || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="small text-muted">{st.assignedAt}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}