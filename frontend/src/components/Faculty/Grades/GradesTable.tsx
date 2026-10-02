// ✅ src/components/Faculty/Grades/GradesTable.tsx

import { useState } from "react";
import { Pencil, AlertTriangle, Lock } from "lucide-react";
import type { GradeRow, GradingSystemData, TermGradeData } from "./types";

type Props = {
  title: string;
  rows: GradeRow[];
  activeTerm: "prelim" | "midterm" | "finals";
  setActiveTerm: (term: "prelim" | "midterm" | "finals") => void;
  gradingSystem: GradingSystemData;
  onChangeScore: (id: string, key: "quizzes" | "activities" | "examination", v: string) => void;
  onOpenEditModal?: (student: GradeRow) => void;
};

function ScoreInput({
  value,
  isLocked,
}: {
  value: number | "";
  isLocked: boolean;
}) {
  return (
    <div style={{ position: "relative", cursor: "default" }}>
      <div className="input-group" style={{ pointerEvents: "none" }}>
        {isLocked && (
          <span className="input-group-text bg-light text-muted border-end-0">
            <Lock size={14} className="text-secondary" />
          </span>
        )}
        <input
          className={`form-control grade-pill-input text-center ${isLocked ? "bg-light text-muted opacity-75 ps-1" : "bg-white text-dark"}`}
          value={value}
          disabled={true}
          readOnly={true}
          inputMode="numeric"
          placeholder="—"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

// Type-safe helper to check if all term components are fully filled and graded
const isTermComplete = (termData?: TermGradeData) => {
  if (!termData) return false;
  
  const q = termData.quizzes;
  const a = termData.activities;
  const e = termData.examination;
  const g = termData.grade;

  const hasQuizzes = q !== undefined && q !== null && String(q).trim() !== "";
  const hasActivities = a !== undefined && a !== null && String(a).trim() !== "";
  const hasExam = e !== undefined && e !== null && String(e).trim() !== "";
  const hasValidGrade = g !== undefined && g !== null && g !== "—";

  return Boolean(hasQuizzes && hasActivities && hasExam && hasValidGrade);
};

export default function GradesTable({
  title,
  rows,
  activeTerm,
  setActiveTerm,
  gradingSystem,
  onOpenEditModal,
}: Props) {
  const [warningModalMessage, setWarningModalMessage] = useState<string | null>(null);
  const currentWeights = gradingSystem.components[activeTerm] || { quizzes: 20, activities: 50, examination: 30 };

  const handleLockedAttempt = (termName: string) => {
    const prevTerm = termName === "midterm" ? "Prelim" : "Midterm";
    setWarningModalMessage(
      `Cannot input ${termName.toUpperCase()} grades yet. All components (Quizzes, Activities, and Examination) for ${prevTerm} must be completely filled and graded first.`
    );
  };

  return (
    <div>
      {/* Warning Modal */}
      {warningModalMessage && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2 text-warning">
                  <AlertTriangle size={26} />
                  <h5 className="modal-title fw-bold text-dark mb-0">Grading Restriction</h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={() => setWarningModalMessage(null)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-0 fs-6">{warningModalMessage}</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-primary px-4 rounded-pill w-100 py-2 fw-semibold" 
                  onClick={() => setWarningModalMessage(null)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Grading System Component Breakdown Cards */}
      <div className="card shadow-sm mb-4 border-0 bg-white p-3">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0">Grading System Component Breakdown ({activeTerm.toUpperCase()})</h6>
            <span className="badge bg-light text-primary border border-primary-subtle px-2 py-1">
              {gradingSystem.subjectType}
            </span>
          </div>
          <span className="text-muted small">Click tabs below or switch terms to adjust</span>
        </div>

        <div className="row g-3">
          {(["prelim", "midterm", "finals"] as const).map((term) => {
            const isActive = activeTerm === term;
            const termWeight = gradingSystem.termWeights[term];
            const comp = gradingSystem.components[term];

            return (
              <div className="col-12 col-md-4" key={term}>
                <div
                  className={`p-3 border rounded-3 transition-all ${
                    isActive
                      ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm ring-2 ring-primary"
                      : "bg-light-subtle text-muted"
                  }`}
                  style={{ cursor: "pointer", borderWidth: isActive ? "2px" : "1px" }}
                  onClick={() => setActiveTerm(term)}
                >
                  <div className="d-flex justify-content-between fw-bold small mb-1">
                    <span className={isActive ? "text-primary text-uppercase fw-bold" : "text-dark text-capitalize"}>
                      {term} {isActive && "✓"}
                    </span>
                    <span>{termWeight}%</span>
                  </div>
                  <div style={{ fontSize: "0.8rem" }} className={isActive ? "text-dark fw-medium" : "text-muted"}>
                    Quizzes {comp.quizzes}% · Activities {comp.activities}% · Examination {comp.examination}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card shadow-sm faculty-grades-table">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h5 className="fw-bold mb-0">{title}</h5>

            {/* Term Switcher Buttons */}
            <div className="btn-group" role="group">
              {(["prelim", "midterm", "finals"] as const).map((term) => (
                <button
                  key={term}
                  type="button"
                  className={`btn btn-sm text-capitalize ${activeTerm === term ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setActiveTerm(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="table-responsive grade-table-wrap"
            style={{ maxHeight: "600px", overflowY: "auto", position: "relative" }}
          >
            <table className="table align-middle mb-0 grade-table">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr className="text-muted">
                  <th style={{ minWidth: 220, backgroundColor: "#f8f9fa" }}>Student</th>
                  <th style={{ backgroundColor: "#f8f9fa" }}>Quizzes ({currentWeights.quizzes}%)</th>
                  <th style={{ backgroundColor: "#f8f9fa" }}>Activities ({currentWeights.activities}%)</th>
                  <th style={{ backgroundColor: "#f8f9fa" }}>Examination ({currentWeights.examination}%)</th>
                  <th style={{ minWidth: 120, backgroundColor: "#f8f9fa" }} className="text-center">
                    {activeTerm.charAt(0).toUpperCase() + activeTerm.slice(1)} Grade
                  </th>
                  <th style={{ minWidth: 120, backgroundColor: "#f8f9fa" }} className="text-center">Final Grade</th>
                  <th style={{ minWidth: 110, backgroundColor: "#f8f9fa" }}>Status</th>
                  <th style={{ width: 72, backgroundColor: "#f8f9fa" }} className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => {
                  const termData = r[activeTerm] || {};
                  const hasGrade = termData.grade !== undefined && termData.grade !== "—" && typeof termData.grade === "number";

                  // Strict Term Completion Check for Locking
                  let isLocked = false;
                  if (activeTerm === "midterm") {
                    if (!isTermComplete(r.prelim)) {
                      isLocked = true;
                    }
                  } else if (activeTerm === "finals") {
                    if (!isTermComplete(r.midterm)) {
                      isLocked = true;
                    }
                  }

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="fw-semibold">{r.name}</div>
                        <div className="text-muted small">{r.studentNo}</div>
                      </td>

                      <td>
                        <ScoreInput
                          value={termData.quizzes ?? ""}
                          isLocked={isLocked}
                        />
                      </td>

                      <td>
                        <ScoreInput
                          value={termData.activities ?? ""}
                          isLocked={isLocked}
                        />
                      </td>

                      <td>
                        <ScoreInput
                          value={termData.examination ?? ""}
                          isLocked={isLocked}
                        />
                      </td>

                      <td className="text-center fw-bold text-primary">
                        {termData.grade ?? "—"}
                      </td>

                      <td className="text-center fw-semibold text-muted">
                        {r.finalGrade ?? "—"}
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill grade-status ${
                            hasGrade ? "complete" : "pending"
                          }`}
                        >
                          {hasGrade ? "graded" : "pending"}
                        </span>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          disabled={isLocked}
                          className={`btn btn-link p-0 grade-edit ${isLocked ? "text-secondary opacity-50" : ""}`}
                          style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                          title={isLocked ? "Locked: Complete all components of the previous term first" : "Edit student grade"}
                          onClick={(e) => {
                            if (isLocked) {
                              e.preventDefault();
                              handleLockedAttempt(activeTerm);
                              return;
                            }
                            if (onOpenEditModal) onOpenEditModal(r);
                          }}
                        >
                          {isLocked ? <Lock size={16} /> : <Pencil size={18} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No students found for this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
