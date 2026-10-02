// ✅ src/components/DepartmentHead/Subjects/SubjectTable.tsx

import { Pencil, Trash2, Scale, AlertTriangle } from "lucide-react";

export interface GradingComponent {
  quizzes: number;
  activities: number;
  examination: number;
}

export interface GradingSystemData {
  subjectType: string;
  termWeights: {
    prelim: number;
    midterm: number;
    finals: number;
  };
  components: {
    prelim: GradingComponent;
    midterm: GradingComponent;
    finals: GradingComponent;
  };
}

export interface SubjectRow {
  _id?: string;
  id?: number | string;
  code: string;
  name: string;
  units: number;
  year: string;
  semester: string;
  program: string;
  faculty: string;
  description?: string;
  gradingSystem?: GradingSystemData | null;
}

interface SubjectTableProps {
  subjects: SubjectRow[];
  onEdit?: (subject: SubjectRow) => void;
  onDelete?: (subject: SubjectRow) => void;
  onOpenGradingSystem?: (subject: SubjectRow) => void;
}

export default function SubjectTable({
  subjects,
  onEdit,
  onDelete,
  onOpenGradingSystem,
}: SubjectTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="subjects-empty-state">
        <div className="subjects-empty-icon">
          <Trash2 size={28} />
        </div>
        <h5>No subjects found</h5>
        <p>Try changing your search or program filter.</p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="subjects-desktop-table">
        <div className="table-responsive">
          <table className="table subjects-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Units</th>
                <th>Year / Sem</th>
                <th>Program</th>
                <th>Faculty</th>
                <th>Grading</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const key = subject._id || subject.id;
                const gs = subject.gradingSystem;
                const isConfigured = Boolean(gs && gs.termWeights);
                const subType = gs?.subjectType || "Laboratory";
                const tw = gs?.termWeights || { prelim: 30, midterm: 30, finals: 40 };

                return (
                  <tr key={key}>
                    <td>
                      <span className="subject-code">{subject.code}</span>
                    </td>
                    <td>
                      <span className="subject-name">{subject.name}</span>
                    </td>
                    <td>
                      <span className="subject-units">{subject.units}</span>
                    </td>
                    <td>
                      <span className="subject-year-sem">
                        {subject.year}
                        <span> · </span>
                        {subject.semester}
                      </span>
                    </td>
                    <td>
                      <span className="subject-program-badge">
                        {subject.program}
                      </span>
                    </td>
                    <td>
                      {subject.faculty ? (
                        <span className="subject-faculty">{subject.faculty}</span>
                      ) : (
                        <span className="subject-unassigned">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div
                        className="d-inline-flex flex-column"
                        style={{ cursor: "pointer" }}
                        onClick={() => onOpenGradingSystem?.(subject)}
                        title={isConfigured ? "Configure Grading System" : "Missing Grading System! Click to configure."}
                      >
                        {isConfigured ? (
                          <>
                            <span className="badge bg-light text-primary border border-primary-subtle fw-semibold mb-1" style={{ width: "fit-content" }}>
                              {subType}
                            </span>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                              P{tw.prelim} · M{tw.midterm} · F{tw.finals}
                            </span>
                          </>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger fw-semibold d-flex align-items-center gap-1 px-2 py-1">
                            <AlertTriangle size={13} /> Missing Grading
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="subject-actions justify-content-end">
                        <button
                          type="button"
                          className={`subject-action-btn ${!isConfigured ? "text-danger border-danger" : "subject-edit-btn"}`}
                          title="Configure Grading System"
                          onClick={() => onOpenGradingSystem?.(subject)}
                        >
                          <Scale size={18} />
                        </button>
                        <button
                          type="button"
                          className="subject-action-btn subject-edit-btn"
                          title="Edit subject"
                          onClick={() => onEdit?.(subject)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="subject-action-btn subject-delete-btn"
                          title="Delete subject"
                          onClick={() => onDelete?.(subject)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="subjects-mobile-list">
        {subjects.map((subject) => {
          const key = subject._id || subject.id;
          const gs = subject.gradingSystem;
          const isConfigured = Boolean(gs && gs.termWeights);
          const subType = gs?.subjectType || "Laboratory";
          const tw = gs?.termWeights || { prelim: 30, midterm: 30, finals: 40 };

          return (
            <div className={`subject-mobile-card ${!isConfigured ? "border border-danger-subtle" : ""}`} key={key}>
              <div className="subject-mobile-header">
                <div>
                  <div className="subject-mobile-code">{subject.code}</div>
                  <div className="subject-mobile-name">{subject.name}</div>
                </div>
                <span className="subject-program-badge">{subject.program}</span>
              </div>
              <div className="subject-mobile-details">
                <div>
                  <span className="subject-mobile-label">Units</span>
                  <span className="subject-mobile-value">{subject.units}</span>
                </div>
                <div>
                  <span className="subject-mobile-label">Year / Semester</span>
                  <span className="subject-mobile-value">
                    {subject.year} · {subject.semester}
                  </span>
                </div>
                <div>
                  <span className="subject-mobile-label">Faculty</span>
                  <span className="subject-mobile-value">
                    {subject.faculty || "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="subject-mobile-label">Grading System</span>
                  <span
                    className={`subject-mobile-value fw-semibold ${!isConfigured ? "text-danger" : "text-primary"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => onOpenGradingSystem?.(subject)}
                  >
                    {isConfigured ? `${subType} (P${tw.prelim}·M${tw.midterm}·F${tw.finals})` : "⚠️ Not Configured (Click to set)"}
                  </span>
                </div>
              </div>
              <div className="subject-mobile-actions d-flex gap-2">
                <button
                  type="button"
                  className={`subject-mobile-edit flex-fill justify-content-center ${!isConfigured ? "text-danger border-danger" : ""}`}
                  onClick={() => onOpenGradingSystem?.(subject)}
                >
                  <Scale size={16} /> Grading
                </button>
                <button
                  type="button"
                  className="subject-mobile-edit flex-fill justify-content-center"
                  onClick={() => onEdit?.(subject)}
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="subject-mobile-delete flex-fill justify-content-center"
                  onClick={() => onDelete?.(subject)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}