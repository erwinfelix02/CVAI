// ✅ src/components/DepartmentHead/Subjects/AddSubjectModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, BookOpen } from "lucide-react";
import type { SubjectRow } from "./SubjectTable";

export interface NewSubjectFormData {
  code: string;
  name: string;
  units: number;
  program: string;
  year: string;
  semester: string;
  subjectType: string;
  description?: string;
}

export interface CourseItem {
  _id: string;
  code: string;
  name: string;
  department: string;
  yearLevels: number;
  status: string;
}

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSubjectFormData) => void;
  initialData?: SubjectRow | null;
  programs?: CourseItem[];
  isLoadingPrograms?: boolean;
  isSubmitting?: boolean;
}

const DEFAULT_FORM_DATA: NewSubjectFormData = {
  code: "",
  name: "",
  units: 3,
  program: "",
  year: "",
  semester: "1st Sem",
  subjectType: "Laboratory",
  description: "",
};

const getOrdinal = (n: number) => {
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  return ordinals[n - 1] || `${n}th`;
};

export default function AddSubjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  programs = [],
  isLoadingPrograms = false,
  isSubmitting = false,
}: AddSubjectModalProps) {
  const [formData, setFormData] = useState<NewSubjectFormData>(DEFAULT_FORM_DATA);
  const [initialSnapshot, setInitialSnapshot] = useState<NewSubjectFormData>(DEFAULT_FORM_DATA);
  const [validationError, setValidationError] = useState<string>("");

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialValues: NewSubjectFormData = initialData
        ? {
            code: initialData.code || "",
            name: initialData.name || "",
            units: initialData.units ? Math.min(Math.max(initialData.units, 1), 4) : 3,
            program: initialData.program || "",
            year: initialData.year || "",
            semester: initialData.semester || "1st Sem",
            subjectType: initialData.gradingSystem?.subjectType || "Laboratory",
            description: initialData.description || "",
          }
        : DEFAULT_FORM_DATA;

      setFormData(initialValues);
      setInitialSnapshot(initialValues);
      setValidationError("");
      setConfirmExitOpen(false);
      setConfirmSaveOpen(false);
    }
  }, [initialData, isOpen]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialSnapshot);
  }, [formData, initialSnapshot]);

  const maxYearLevels = useMemo(() => {
    if (!formData.program) return 4;
    const selectedCourse = programs.find((p) => p.code === formData.program);
    return selectedCourse ? selectedCourse.yearLevels : 4;
  }, [formData.program, programs]);

  const yearLevelOptions = useMemo(() => {
    return Array.from({ length: maxYearLevels }, (_, i) => `${getOrdinal(i + 1)} Year`);
  }, [maxYearLevels]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const handleSafeClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValidationError("");

    if (name === "code") {
      const formattedCode = value.toUpperCase();
      if (formattedCode !== "" && !/^[A-Z0-9\s-]*$/.test(formattedCode)) return;
      setFormData((prev) => ({ ...prev, code: formattedCode }));
      return;
    }

    if (name === "units") {
      let numVal = Number(value);
      if (numVal > 4) numVal = 4;
      if (numVal < 1 && value !== "") numVal = 1;
      setFormData((prev) => ({ ...prev, units: numVal }));
      return;
    }

    if (name === "program") {
      const course = programs.find((p) => p.code === value);
      const limit = course ? course.yearLevels : 4;

      setFormData((prev) => {
        const currentYearNum = parseInt(prev.year, 10);
        const isYearExceeded = !isNaN(currentYearNum) && currentYearNum > limit;

        return {
          ...prev,
          program: value,
          year: isYearExceeded ? "" : prev.year,
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      setValidationError("Subject code is required.");
      return;
    }
    if (!formData.name.trim()) {
      setValidationError("Subject name is required.");
      return;
    }
    if (formData.units < 1 || formData.units > 4) {
      setValidationError("Units must be between 1 and 4.");
      return;
    }
    if (!formData.program) {
      setValidationError("Please select a program.");
      return;
    }
    if (!formData.year) {
      setValidationError("Please select a year level.");
      return;
    }
    if (!formData.semester) {
      setValidationError("Please select a semester.");
      return;
    }

    setValidationError("");
    setConfirmSaveOpen(true);
  };

  const handleExecuteSave = () => {
    setConfirmSaveOpen(false);
    onSubmit(formData);
  };

  return createPortal(
    <>
      <div className="add-subject-modal-backdrop" onClick={handleSafeClose}>
        <div
          className="add-subject-modal-container shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="add-subject-modal-header border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary-subtle text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="add-subject-modal-title fs-5 fw-bold mb-1">
                  {isEditing ? "Edit Subject Offering" : "Add Subject Offering"}
                </h2>
                <p className="text-muted small mb-0">
                  Define the curriculum subject and details.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="add-subject-modal-close btn-close shadow-none"
              onClick={handleSafeClose}
              aria-label="Close"
              disabled={isSubmitting}
            />
          </div>

          <form onSubmit={handleSubmitAttempt}>
            <div className="add-subject-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {validationError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small rounded-3 border-0">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Row 1: Code & Units */}
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label htmlFor="code" className="form-label fw-semibold small">
                    Subject Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    className="form-control"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. CSPC 210"
                    maxLength={15}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="units" className="form-label fw-semibold small">
                    Units <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="units"
                    name="units"
                    className="form-control"
                    value={formData.units}
                    onChange={handleChange}
                    min={1}
                    max={4}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Subject Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold small">
                  Subject Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Operating Systems"
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Program, Year Level, Semester */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label htmlFor="program" className="form-label fw-semibold small">
                    Program <span className="text-danger">*</span>
                  </label>
                  <select
                    id="program"
                    name="program"
                    className="form-select"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    disabled={isLoadingPrograms || isSubmitting}
                  >
                    <option value="" disabled>
                      {isLoadingPrograms ? "Loading..." : "Program"}
                    </option>
                    {programs.map((prog) => (
                      <option key={prog._id} value={prog.code}>
                        {prog.code} ({prog.yearLevels} Yrs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="year" className="form-label fw-semibold small">
                    Year Level <span className="text-danger">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    className="form-select"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    disabled={!formData.program || isSubmitting}
                  >
                    <option value="" disabled>
                      {formData.program ? "Year" : "Select Program"}
                    </option>
                    {yearLevelOptions.map((yearOpt) => (
                      <option key={yearOpt} value={yearOpt}>
                        {yearOpt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="semester" className="form-label fw-semibold small">
                    Semester <span className="text-danger">*</span>
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className="form-select"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="1st Sem">1st Sem</option>
                    <option value="2nd Sem">2nd Sem</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Subject Type */}
              <div className="mb-3">
                <label htmlFor="subjectType" className="form-label fw-semibold small">
                  Subject Type <span className="text-danger">*</span>
                </label>
                <select
                  id="subjectType"
                  name="subjectType"
                  className="form-select"
                  value={formData.subjectType}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="Laboratory">Laboratory</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                  Determines default grading weights configuration upon creation.
                </small>
              </div>

              {/* Row 5: Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label fw-semibold small">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows={2}
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Short course description or prerequisites"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="add-subject-modal-footer border-top pt-3 mt-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium"
                onClick={handleSafeClose}
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
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Add Subject"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmExitOpen && (
        <div className="subject-centered-confirm-overlay">
          <div className="subject-centered-confirm-box shadow-sm p-4 bg-white rounded-3">
            <div className="d-flex align-items-center gap-2 mb-2 text-danger">
              <AlertCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">Unsaved Changes</h5>
            </div>
            <p className="text-muted small mb-4">
              You have unsaved changes. Are you sure you want to discard them and exit?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmExitOpen(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm px-3 fw-medium"
                onClick={() => {
                  setConfirmExitOpen(false);
                  onClose();
                }}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSaveOpen && (
        <div className="subject-centered-confirm-overlay">
          <div className="subject-centered-confirm-box shadow-sm p-4 bg-white rounded-3">
            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
              <AlertCircle size={22} />
              <h5 className="fw-bold mb-0 text-dark">
                {isEditing ? "Confirm Updates" : "Confirm New Subject"}
              </h5>
            </div>
            <p className="text-muted small mb-4">
              {isEditing
                ? `Are you sure you want to save changes to subject "${formData.code}"?`
                : `Are you sure you want to add "${formData.code} - ${formData.name}" to curriculum offerings?`}
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm px-3 fw-medium border"
                onClick={() => setConfirmSaveOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-medium"
                onClick={handleExecuteSave}
              >
                {isEditing ? "Save Changes" : "Add Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}