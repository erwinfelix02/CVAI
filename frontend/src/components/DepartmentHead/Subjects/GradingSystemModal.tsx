// ✅ src/components/DepartmentHead/Subjects/GradingSystemModal.tsx

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Scale, AlertCircle } from "lucide-react";
import type { SubjectRow, GradingSystemData } from "./SubjectTable";

interface GradingSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectRow | null;
  onSave: (data: GradingSystemData) => void;
  isSubmitting?: boolean;
}

const DEFAULT_GRADING: GradingSystemData = {
  subjectType: "Laboratory",
  termWeights: { prelim: 30, midterm: 30, finals: 40 },
  components: {
    prelim: { quizzes: 20, activities: 50, examination: 30 },
    midterm: { quizzes: 20, activities: 50, examination: 30 },
    finals: { quizzes: 20, activities: 50, examination: 30 },
  },
};

export default function GradingSystemModal({
  isOpen,
  onClose,
  subject,
  onSave,
  isSubmitting = false,
}: GradingSystemModalProps) {
  const [gradingData, setGradingData] = useState<GradingSystemData>(DEFAULT_GRADING);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && subject) {
      if (subject.gradingSystem) {
        setGradingData(JSON.parse(JSON.stringify(subject.gradingSystem)));
      } else {
        setGradingData(DEFAULT_GRADING);
      }
      setErrorMsg("");
    }
  }, [isOpen, subject]);

  if (!isOpen || !subject) return null;

  const handleSubjectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const termWeights = val === "Lecture" ? { prelim: 33, midterm: 33, finals: 34 } : { prelim: 30, midterm: 30, finals: 40 };
    setGradingData((prev) => ({
      ...prev,
      subjectType: val,
      termWeights,
    }));
  };

  const handleTermWeightChange = (term: "prelim" | "midterm" | "finals", val: number) => {
    setGradingData((prev) => ({
      ...prev,
      termWeights: {
        ...prev.termWeights,
        [term]: isNaN(val) ? 0 : val,
      },
    }));
  };

  const handleComponentChange = (
    term: "prelim" | "midterm" | "finals",
    comp: "quizzes" | "activities" | "examination",
    val: number
  ) => {
    setGradingData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [term]: {
          ...prev.components[term],
          [comp]: isNaN(val) ? 0 : val,
        },
      },
    }));
  };

  const totalTermWeights =
    gradingData.termWeights.prelim +
    gradingData.termWeights.midterm +
    gradingData.termWeights.finals;

  const prelimComponentTotal =
    gradingData.components.prelim.quizzes +
    gradingData.components.prelim.activities +
    gradingData.components.prelim.examination;

  const midtermComponentTotal =
    gradingData.components.midterm.quizzes +
    gradingData.components.midterm.activities +
    gradingData.components.midterm.examination;

  const finalsComponentTotal =
    gradingData.components.finals.quizzes +
    gradingData.components.finals.activities +
    gradingData.components.finals.examination;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTermWeights !== 100) {
      setErrorMsg("Term Weights must total exactly 100%.");
      return;
    }
    if (prelimComponentTotal !== 100 || midtermComponentTotal !== 100 || finalsComponentTotal !== 100) {
      setErrorMsg("Each term's components (Quizzes, Activities, Examination) must total 100%.");
      return;
    }

    setErrorMsg("");
    onSave(gradingData);
  };

  return createPortal(
    <div className="add-subject-modal-backdrop" onClick={onClose}>
      <div
        className="add-subject-modal-container shadow-lg"
        style={{ maxWidth: "700px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-subject-modal-header border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-subtle text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="add-subject-modal-title fs-5 fw-bold mb-1">
                Grading System — {subject.code}
              </h2>
              <p className="text-muted small mb-0">
                {subject.name}. Faculty handling this subject will grade using these weights.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close shadow-none"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-subject-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small rounded-3 border-0">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="row g-3 p-3 bg-light rounded-3 mb-4 align-items-center">
              <div className="col-md-5">
                <label className="form-label fw-semibold small">Subject Type</label>
                <select
                  className="form-select"
                  value={gradingData.subjectType}
                  onChange={handleSubjectTypeChange}
                  disabled={isSubmitting}
                >
                  <option value="Laboratory">Laboratory</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                  Changing type applies its default split.
                </small>
              </div>

              <div className="col-md-7">
                <label className="form-label fw-semibold small d-flex justify-content-between">
                  <span>Term Weights (must total 100%)</span>
                  <span className={`badge ${totalTermWeights === 100 ? "bg-primary-subtle text-primary" : "bg-danger-subtle text-danger"}`}>
                    Total: {totalTermWeights}%
                  </span>
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={gradingData.termWeights.prelim}
                      onChange={(e) => handleTermWeightChange("prelim", parseInt(e.target.value))}
                      placeholder="Prelim"
                      disabled={isSubmitting}
                    />
                    <small className="text-muted text-center d-block mt-1" style={{ fontSize: "0.7rem" }}>Prelim</small>
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={gradingData.termWeights.midterm}
                      onChange={(e) => handleTermWeightChange("midterm", parseInt(e.target.value))}
                      placeholder="Midterm"
                      disabled={isSubmitting}
                    />
                    <small className="text-muted text-center d-block mt-1" style={{ fontSize: "0.7rem" }}>Midterm</small>
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={gradingData.termWeights.finals}
                      onChange={(e) => handleTermWeightChange("finals", parseInt(e.target.value))}
                      placeholder="Finals"
                      disabled={isSubmitting}
                    />
                    <small className="text-muted text-center d-block mt-1" style={{ fontSize: "0.7rem" }}>Finals</small>
                  </div>
                </div>
              </div>
            </div>

            <h6 className="fw-bold mb-3 small text-uppercase tracking-wide text-muted">
              Per-Term Components (each term must total 100%)
            </h6>

            {/* Prelim */}
            <div className="card border mb-3 p-3 shadow-none">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold small">Prelim</span>
                <span className={`badge ${prelimComponentTotal === 100 ? "bg-primary-subtle text-primary" : "bg-danger-subtle text-danger"}`}>
                  {prelimComponentTotal}%
                </span>
              </div>
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Quizzes</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.prelim.quizzes}
                    onChange={(e) => handleComponentChange("prelim", "quizzes", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Activities</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.prelim.activities}
                    onChange={(e) => handleComponentChange("prelim", "activities", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Examination</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.prelim.examination}
                    onChange={(e) => handleComponentChange("prelim", "examination", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Midterm */}
            <div className="card border mb-3 p-3 shadow-none">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold small">Midterm</span>
                <span className={`badge ${midtermComponentTotal === 100 ? "bg-primary-subtle text-primary" : "bg-danger-subtle text-danger"}`}>
                  {midtermComponentTotal}%
                </span>
              </div>
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Quizzes</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.midterm.quizzes}
                    onChange={(e) => handleComponentChange("midterm", "quizzes", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Activities</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.midterm.activities}
                    onChange={(e) => handleComponentChange("midterm", "activities", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Examination</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.midterm.examination}
                    onChange={(e) => handleComponentChange("midterm", "examination", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Finals */}
            <div className="card border mb-2 p-3 shadow-none">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold small">Finals</span>
                <span className={`badge ${finalsComponentTotal === 100 ? "bg-primary-subtle text-primary" : "bg-danger-subtle text-danger"}`}>
                  {finalsComponentTotal}%
                </span>
              </div>
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Quizzes</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.finals.quizzes}
                    onChange={(e) => handleComponentChange("finals", "quizzes", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Activities</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.finals.activities}
                    onChange={(e) => handleComponentChange("finals", "activities", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-muted" style={{ fontSize: "0.75rem" }}>Examination</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={gradingData.components.finals.examination}
                    onChange={(e) => handleComponentChange("finals", "examination", parseInt(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="add-subject-modal-footer border-top pt-3 mt-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light px-4 fw-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4 fw-medium" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save Grading System"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}