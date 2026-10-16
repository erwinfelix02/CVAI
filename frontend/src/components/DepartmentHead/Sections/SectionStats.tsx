// ✅ src/components/DepartmentHead/Sections/SectionStats.tsx
import { ShieldCheck, Users, Grid } from "lucide-react";

export default function SectionStats() {
  return (
    <div className="row row-cols-1 row-cols-md-3 g-3 mb-4" style={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <div className="col" style={{ minWidth: 0, boxSizing: "border-box" }}>
        <div className="card border-0 shadow-sm p-3 h-100" style={{ minWidth: 0, boxSizing: "border-box" }}>
          <div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
            <div className="p-2 bg-light rounded text-primary flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <h6 className="fw-bold mb-1">Curriculum Compliance</h6>
              <p className="text-muted small mb-0 text-truncate">
                Only students matching the program, year level and completed prerequisites can be placed.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col" style={{ minWidth: 0, boxSizing: "border-box" }}>
        <div className="card border-0 shadow-sm p-3 h-100" style={{ minWidth: 0, boxSizing: "border-box" }}>
          <div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
            <div className="p-2 bg-light rounded text-primary flex-shrink-0">
              <Users size={24} />
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <h6 className="fw-bold mb-1">Class Capacity Control</h6>
              <p className="text-muted small mb-0 text-truncate">
                Assignments stop automatically once a section reaches its room capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col" style={{ minWidth: 0, boxSizing: "border-box" }}>
        <div className="card border-0 shadow-sm p-3 h-100" style={{ minWidth: 0, boxSizing: "border-box" }}>
          <div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
            <div className="p-2 bg-light rounded text-primary flex-shrink-0">
              <Grid size={24} />
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <h6 className="fw-bold mb-1">Cohort Stability</h6>
              <p className="text-muted small mb-0 text-truncate">
                Regular students are kept together in block sections across semesters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}