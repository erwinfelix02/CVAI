// ✅ src/components/Faculty/Grades/InputGradeModal.tsx

import { useState, useEffect } from "react";
import { CheckCircle2, Save, BookOpen, AlertTriangle, Pencil } from "lucide-react";
import type { GradeRow, GradingSystemData, TermGradeData } from "./types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: GradeRow | null;
  activeTerm: "prelim" | "midterm" | "finals";
  selectedCourseLabel: string;
  gradingSystem: GradingSystemData;
  onSaveGrade: (studentId: string, gradeType: string, score: number | "") => void;
};

export default function InputGradeModal({
  isOpen,
  onClose,
  student,
  activeTerm,
  selectedCourseLabel,
  gradingSystem,
  onSaveGrade,
}: Props) {
  const [gradeType, setGradeType] = useState<string>("quizzes");
  const [score, setScore] = useState<number | "">("");
  const [initialScore, setInitialScore] = useState<number | "">("");
  const [maxScore, setMaxScore] = useState<number>(100);
  const [remarks, setRemarks] = useState<string>("");
  
  // Workflow states
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  const currentWeights = gradingSystem.components[activeTerm] || { quizzes: 20, activities: 50, examination: 30 };

  // Update component values when student, term, or gradeType changes
  useEffect(() => {
    if (student) {
      const termData = student[activeTerm] as TermGradeData | undefined;
      const currentVal = termData ? termData[gradeType as keyof TermGradeData] ?? "" : "";
      
      const parsedVal = currentVal === "—" ? "" : currentVal;
      setScore(parsedVal);
      setInitialScore(parsedVal);
      setMaxScore(100);
      setRemarks("");

      // If the selected component already has a score, lock it by default (requiring "Edit"). 
      // If it's empty, make it freely editable right away ("Save Grade").
      const hasExistingValue = parsedVal !== "" && parsedVal !== undefined;
      setIsEditable(!hasExistingValue);

      setShowConfirmModal(false);
      setShowExitConfirmModal(false);
    }
  }, [student, activeTerm, gradeType]);

  if (!isOpen || !student) return null;

  const termData = student[activeTerm] as TermGradeData | undefined;
  const currentVal = termData ? termData[gradeType as keyof TermGradeData] ?? "" : "";
  const hasExistingComponentScore = currentVal !== "" && currentVal !== undefined && currentVal !== "—";
  const isChanged = score !== initialScore;

  // 🔒 Strict score boundary handler: clamps input between 0 and maxScore
  const handleScoreChange = (val: string) => {
    if (val === "") {
      setScore("");
      return;
    }
    const num = Number(val);
    if (isNaN(num)) return;

    const clamped = Math.max(0, Math.min(maxScore, num));
    setScore(clamped);
  };

  const handleMaxScoreChange = (val: string) => {
    const num = Number(val);
    const newMax = isNaN(num) || num < 1 ? 1 : num;
    setMaxScore(newMax);

    if (score !== "" && score > newMax) {
      setScore(newMax);
    }
  };

  const handleAttemptClose = () => {
    if (isEditable && isChanged) {
      setShowExitConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleSaveClick = () => {
    if (hasExistingComponentScore && !isChanged) {
      onClose();
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const finalNumericScore = score === "" ? "" : Math.max(0, Math.min(maxScore, Number(score)));
    onSaveGrade(student.id, gradeType, finalNumericScore);
    setShowConfirmModal(false);
    setShowExitConfirmModal(false);
    onClose();
  };

  const calculatedPercentage = score !== "" ? Math.min(100, Math.max(0, (Number(score) / maxScore) * 100)).toFixed(1) : "0.0";
  const capitalizedTerm = activeTerm.charAt(0).toUpperCase() + activeTerm.slice(1);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
      onClick={handleAttemptClose}
    >
      <div
        className="modal-dialog modal-dialog-centered mx-3 mx-sm-auto my-3"
        style={{ maxWidth: "500px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content shadow-lg border-0 rounded-4 bg-white d-flex flex-column"
          style={{ maxHeight: "85vh", overflow: "hidden" }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between p-3 p-md-4 border-bottom flex-shrink-0 bg-white">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary-subtle text-primary p-2 rounded-3">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 fs-5">Grade Details</h5>
                <span className="text-muted small">{capitalizedTerm} Term</span>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={handleAttemptClose} aria-label="Close" />
          </div>

          {/* Modal Body */}
          <div
            className="p-3 p-md-4"
            style={{
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          >
            {/* Student Info Card */}
            <div className="bg-light p-3 rounded-3 mb-3 border">
              <div className="fw-bold text-dark">{student.name}</div>
              <div className="text-muted small">{student.studentNo}</div>
            </div>

            {/* Course Display */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted mb-1">
                Course / Subject
              </label>
              <div className="p-2 px-3 bg-light border rounded-3 d-flex align-items-center gap-2 text-dark fw-medium small">
                <BookOpen size={15} className="text-primary flex-shrink-0" />
                <span className="text-truncate">{selectedCourseLabel}</span>
              </div>
            </div>

            {/* Grade Type Selector */}
            <div className="mb-3">
              <label className="form-label fw-semibold small">
                Grade Component <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value)}
              >
                <option value="quizzes">Quizzes ({currentWeights.quizzes}%)</option>
                <option value="activities">Activities ({currentWeights.activities}%)</option>
                <option value="examination">Examination ({currentWeights.examination}%)</option>
              </select>
            </div>

            {/* Score & Max Score */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold small">
                  Score <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  value={score}
                  disabled={!isEditable}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  min={0}
                  max={maxScore}
                  placeholder="0"
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small">Max Score</label>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  value={maxScore}
                  disabled={!isEditable}
                  onChange={(e) => handleMaxScoreChange(e.target.value)}
                  min={1}
                />
              </div>
            </div>

            {/* Calculated Grade Display Box */}
            <div className="p-3 border rounded-3 bg-light-subtle mb-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Calculated Grade</div>
                <div className="fs-4 fw-bold text-primary">{calculatedPercentage}%</div>
              </div>
              <div className="text-end">
                <div className="text-muted small">Raw Score</div>
                <div className="fw-semibold text-secondary">
                  {score !== "" ? score : 0} / {maxScore}
                </div>
              </div>
            </div>

            {/* Remarks Optional */}
            <div className="mb-1">
              <label className="form-label fw-semibold small">Remarks (Optional)</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                value={remarks}
                disabled={!isEditable}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add notes or feedback..."
                style={{ resize: "none" }}
              />
            </div>
          </div>

          {/* Footer Dynamic Buttons */}
          <div className="modal-footer border-top p-3 p-md-4 d-flex gap-2 justify-content-end flex-shrink-0 bg-white">
            <button type="button" className="btn btn-light btn-sm px-3 fw-medium" onClick={handleAttemptClose}>
              Close
            </button>
            {hasExistingComponentScore && !isEditable ? (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium d-inline-flex align-items-center gap-1.5"
                onClick={() => setIsEditable(true)}
              >
                <Pencil size={15} /> Edit
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-sm px-3 fw-medium d-inline-flex align-items-center gap-1.5"
                disabled={hasExistingComponentScore && !isChanged}
                onClick={handleSaveClick}
              >
                <Save size={15} /> {hasExistingComponentScore ? "Save Changes" : "Save Grade"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Centered Save Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 p-3 bg-white">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2 text-primary">
                  <AlertTriangle size={24} className="text-warning" />
                  <h5 className="modal-title fw-bold text-dark mb-0">Confirm Grade Update</h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-1 fs-6">
                  Are you sure you want to save this score (<strong className="text-dark">{score !== "" ? score : 0} / {maxScore}</strong>) for <strong className="text-dark">{student.name}</strong> under <strong className="text-dark">{gradeType}</strong>?
                </p>
                <small className="text-muted">This will instantly commit the changes to the active academic year and semester database.</small>
              </div>
              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-light px-4 rounded-pill flex-grow-1 py-2 fw-semibold" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  Continue Editing
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary px-4 rounded-pill flex-grow-1 py-2 fw-semibold" 
                  onClick={handleConfirmSave}
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Centered Exit / Discard Changes Confirmation Modal */}
      {showExitConfirmModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 p-3 bg-white">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2 text-danger">
                  <AlertTriangle size={24} className="text-danger" />
                  <h5 className="modal-title fw-bold text-dark mb-0">Unsaved Changes</h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close shadow-none" 
                  onClick={() => setShowExitConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-1 fs-6">
                  You have modified the grade scores without saving. Are you sure you want to exit and discard your changes?
                </p>
                <small className="text-muted">Any unsaved adjustments will be lost.</small>
              </div>
              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-light px-4 rounded-pill flex-grow-1 py-2 fw-semibold" 
                  onClick={() => setShowExitConfirmModal(false)}
                >
                  Keep Editing
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 rounded-pill flex-grow-1 py-2 fw-semibold" 
                  onClick={onClose}
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}