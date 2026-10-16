// ✅ src/components/DepartmentHead/Sections/SectionCards.tsx

import { useState, useMemo } from "react";
import { Building2, Search } from "lucide-react";
import SectionStudentsModal from "./SectionStudentsModal";
import type { Section } from "../../../pages/DepartmentHead/DepartmentHeadSections";

interface SectionCardsProps {
  sections: Section[];
}

export default function SectionCards({ sections }: SectionCardsProps) {
  const [sectionSearch, setSectionSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [programFilter, setProgramFilter] = useState("All Programs");

  // Modal State
  const [selectedSection, setSelectedSection] = useState<{ id: string; name: string } | null>(null);

  const uniquePrograms = useMemo(() => {
    const progs = sections.map((s) => s.program);
    return Array.from(new Set(progs));
  }, [sections]);

  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      const matchesSearch =
        sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.room.toLowerCase().includes(sectionSearch.toLowerCase());

      const matchesYear =
        yearFilter === "All Years" || sec.year.toString() === yearFilter.replace("Year ", "");

      const matchesProgram =
        programFilter === "All Programs" || sec.program === programFilter;

      return matchesSearch && matchesYear && matchesProgram;
    });
  }, [sections, sectionSearch, yearFilter, programFilter]);

  return (
    <>
      <div 
        className="card border-0 shadow-sm p-4 mb-4" 
        style={{ 
          width: "100%", 
          maxWidth: "100%", 
          minWidth: 0, 
          overflow: "hidden", 
          boxSizing: "border-box" 
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3" style={{ minWidth: 0 }}>
          <h5 className="fw-bold mb-0 text-truncate">Active Sections ({filteredSections.length}/{sections.length})</h5>
          
          <div className="d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
            <div className="input-group input-group-sm" style={{ width: "200px" }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0 ps-0 shadow-none"
                placeholder="Search section..."
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select form-select-sm w-auto shadow-none"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option>All Years</option>
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
            </select>

            <select
              className="form-select form-select-sm w-auto shadow-none"
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
            >
              <option>All Programs</option>
              {uniquePrograms.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div 
          className="pe-1" 
          style={{ 
            maxHeight: "155px", 
            overflowY: "auto", 
            overflowX: "hidden", 
            width: "100%", 
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box" 
          }}
        >
          {filteredSections.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No sections match your filter criteria.
            </div>
          ) : (
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "12px", 
                width: "100%", 
                maxWidth: "100%",
                minWidth: 0, 
                boxSizing: "border-box" 
              }}
            >
              {filteredSections.map((sec) => {
                const progressPct = Math.min(100, (sec.enrolled / sec.capacity) * 100);
                return (
                  <div key={sec.id} style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
                    <div 
                      className="card border shadow-sm p-3 h-100 bg-white" 
                      style={{ 
                        width: "100%", 
                        maxWidth: "100%", 
                        minWidth: 0, 
                        boxSizing: "border-box", 
                        cursor: "pointer",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease" 
                      }}
                      onClick={() => setSelectedSection({ id: sec.id, name: sec.name })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2" style={{ minWidth: 0 }}>
                        <div style={{ minWidth: 0, overflow: "hidden" }}>
                          <h6 className="fw-bold mb-0 text-truncate">{sec.name}</h6>
                          <small className="text-muted text-truncate d-block" style={{ fontSize: "11px" }}>
                            {sec.program} · Year {sec.year}
                          </small>
                        </div>
                        <span className="badge bg-light text-dark border flex-shrink-0 ms-2">
                          {sec.enrolled}/{sec.capacity}
                        </span>
                      </div>
                      <div className="progress mb-2 bg-light" style={{ height: "6px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${progressPct}%`, backgroundColor: "#0d5173" }}
                          aria-valuenow={sec.enrolled}
                          aria-valuemin={0}
                          aria-valuemax={sec.capacity}
                        />
                      </div>
                      <div className="small text-muted d-flex flex-column gap-1" style={{ minWidth: 0, fontSize: "12px" }}>
                        <div className="text-truncate">
                          <Building2 size={13} className="me-1" /> {sec.room}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SectionStudentsModal
        sectionId={selectedSection?.id || null}
        sectionName={selectedSection?.name || ""}
        isOpen={!!selectedSection}
        onClose={() => setSelectedSection(null)}
      />
    </>
  );
}