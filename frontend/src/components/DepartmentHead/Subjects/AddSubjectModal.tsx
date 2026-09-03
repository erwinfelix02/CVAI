// ✅ src/components/DepartmentHead/Subjects/AddSubjectModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, AlertCircle } from "lucide-react";
import type { SubjectRow } from "./SubjectTable";

export interface NewSubjectFormData {
  code: string;
  name: string;
  units: number;
  program: string;
  year: string;
  semester: string;
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

  // Centered confirmation overlays
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  // Filter active programs for selection
  const activePrograms = useMemo(() => {
    return programs.filter(
      (prog) => prog.status && prog.status.toLowerCase() === "active"
    );
  }, [programs]);

  // Synchronize initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialValues: NewSubjectFormData = initialData
        ? {
            code: initialData.code || "",
            name: initialData.name || "",
            units: initialData.units || 3,
            program: initialData.program || "",
            year: initialData.year || "",
            semester: initialData.semester || "1st Sem",
          }
        : DEFAULT_FORM_DATA;

      setFormData(initialValues);
      setInitialSnapshot(initialValues);
      setConfirmExitOpen(false);
      setConfirmSaveOpen(false);
    }
  }, [initialData, isOpen]);

  // Compute dirty status by checking if current form data differs from the initial snapshot
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

  /* =========================================================
     EXIT GUARD HANDLER
     ========================================================= */
  const handleSafeClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "program") {
        const course = programs.find((p) => p.code === value);
        const limit = course ? course.yearLevels : 4;

        const currentYearNum = parseInt(prev.year, 10);
        const isYearExceeded = !isNaN(currentYearNum) && currentYearNum > limit;

        return {
          ...prev,
          program: value,
          year: isYearExceeded ? "" : prev.year,
        };
      }

      return {
        ...prev,
        [name]: name === "units" ? Number(value) || 0 : value,
      };
    });
  };

  /* =========================================================
     SAVE GUARD HANDLERS
     ========================================================= */
  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.program || !formData.year) {
      alert("Please fill in all required fields.");
      return;
    }
    setConfirmSaveOpen(true);
  };

  const handleExecuteSave = () => {
    setConfirmSaveOpen(false);
    onSubmit(formData);
  };

  return createPortal(
    <>
      {/* MAIN ADD/EDIT MODAL */}
      <div className="add-subject-modal-backdrop" onClick={handleSafeClose}>
        <div
          className="add-subject-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="add-subject-modal-header">
            <h2 className="add-subject-modal-title">
              {isEditing ? "Edit Subject" : "Add Subject"}
            </h2>
            <button
              type="button"
              className="add-subject-modal-close"
              onClick={handleSafeClose}
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmitAttempt}>
            <div className="add-subject-modal-body">
              {/* Row 1: Code & Units */}
              <div className="add-subject-row">
                <div className="add-subject-field flex-3">
                  <label htmlFor="code">Subject Code</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. CSPC 210"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="add-subject-field flex-2">
                  <label htmlFor="units">Units</label>
                  <input
                    type="number"
                    id="units"
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Subject Name */}
              <div className="add-subject-field">
                <label htmlFor="name">Subject Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Operating Systems"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Program & Year Level */}
              <div className="add-subject-row">
                <div className="add-subject-field flex-1">
                  <label htmlFor="program">Program</label>
                  <div className="select-input-wrapper">
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                      disabled={isLoadingPrograms || isSubmitting}
                    >
                      <option value="" disabled>
                        {isLoadingPrograms
                          ? "Loading programs..."
                          : "Select program"}
                      </option>
                      {activePrograms.map((prog) => (
                        <option key={prog._id} value={prog.code}>
                          {prog.code} - {prog.name} ({prog.yearLevels} Yrs)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-arrow" size={18} />
                  </div>
                </div>

                <div className="add-subject-field flex-1">
                  <label htmlFor="year">Year Level</label>
                  <div className="select-input-wrapper">
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      disabled={!formData.program || isSubmitting}
                    >
                      <option value="" disabled>
                        {formData.program ? "Select year" : "Select program first"}
                      </option>
                      {yearLevelOptions.map((yearOpt) => (
                        <option key={yearOpt} value={yearOpt}>
                          {yearOpt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-arrow" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="add-subject-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleSafeClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
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

      {/* CENTERED CONFIRMATION OVERLAY FOR EXITING WITH UNSAVED CHANGES */}
      {confirmExitOpen && (
        <div className="subject-centered-confirm-overlay">
          <div className="subject-centered-confirm-box">
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

      {/* CENTERED CONFIRMATION OVERLAY FOR SAVING CHANGES */}
      {confirmSaveOpen && (
        <div className="subject-centered-confirm-overlay">
          <div className="subject-centered-confirm-box">
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