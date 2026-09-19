import { useState, useEffect, useRef, useMemo } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";
import { UserPlus, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";

export interface AssignedClass {
  id: string;
  code: string;
  title: string;
  section: string;
  label: string;
}

interface StudentSearchResult {
  idNumber?: string;
  studentIdNumber?: string;
  fullName?: string;
  name?: string;
  email?: string;
  department?: string;
  program?: string;
  course?: string;
  degree?: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedClasses?: AssignedClass[];
  isLoadingClasses?: boolean;
  onStudentAdded?: (newStudent: any) => void;
}

interface StudentFormData {
  fullName: string;
  studentId: string;
  classSection: string;
  program: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  assignedClasses = [],
  isLoadingClasses = false,
  onStudentAdded,
}: AddStudentModalProps): JSX.Element | null {
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: "",
    studentId: "",
    classSection: "",
    program: "",
  });

  const [suggestions, setSuggestions] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const query = (formData.fullName || "").trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async (): Promise<void> => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/users/search-students?q=${encodeURIComponent(query)}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowDropdown(data.length > 0);
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
        }
      } catch (err) {
        console.error("Error searching students:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.fullName, isOpen]);

  const isDirty = useMemo((): boolean => {
    return (
      formData.fullName.trim() !== "" ||
      formData.studentId.trim() !== "" ||
      formData.classSection.trim() !== "" ||
      formData.program.trim() !== ""
    );
  }, [formData]);

  const handleResetForm = (): void => {
    setFormData({ fullName: "", studentId: "", classSection: "", program: "" });
    setSuggestions([]);
    setShowDropdown(false);
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    setIsSubmitting(false);
    setErrorMessage(null);
  };

  const handleResetAndClose = (): void => {
    handleResetForm();
    onClose();
  };

  const handleAttemptClose = (): void => {
    if (isSubmitting) return;
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleResetAndClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleResetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        if (showExitConfirm || showSubmitConfirm) {
          setShowExitConfirm(false);
          setShowSubmitConfirm(false);
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isDirty, showExitConfirm, showSubmitConfirm]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fullName: value,
      studentId: value === "" ? "" : prev.studentId,
      program: value === "" ? "" : prev.program,
    }));
  };

  // Extract and auto-fill program/course from any matching property returned by API
  const handleSelectStudent = (student: StudentSearchResult): void => {
    const selectedName = student.fullName || student.name || "";
    const selectedId = student.idNumber || student.studentIdNumber || "";
    const selectedCourseProgram =
      student.program || student.course || student.degree || student.department || "";

    setFormData((prev) => ({
      ...prev,
      fullName: selectedName,
      studentId: selectedId,
      program: selectedCourseProgram,
    }));
    setShowDropdown(false);
  };

  const handleGenericChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedClassObj = Array.isArray(assignedClasses)
    ? assignedClasses.find((item) => item.section === formData.classSection)
    : undefined;

  const displaySectionLabel =
    selectedClassObj?.label || formData.classSection || "—";

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setErrorMessage(null);
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async (): Promise<void> => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = userJson ? JSON.parse(userJson) : null;

      const facultyName =
        user?.name ||
        (user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.email || "Faculty Member");

      const facultyId = user?.id || user?._id || "";

      const enrolledSubjectsList = selectedClassObj?.code
        ? [selectedClassObj.code]
        : [];

      const studentPayload = {
        fullName: formData.fullName.trim(),
        studentIdNumber: formData.studentId.trim(),
        section: formData.classSection,
        subjectCode: selectedClassObj?.code || "",
        enrolledSubjects: enrolledSubjectsList,
        program: formData.program.trim() || "BS Computer Science",
        course: formData.program.trim() || "BS Computer Science",
        department: user?.department || "College of Computer Studies",
        facultyId,
        facultyName,
        createdBy: facultyName,
      };

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(studentPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to save student to database."
        );
      }

      const savedStudent = responseData.student || responseData;

      if (onStudentAdded) {
        onStudentAdded(savedStudent);
      }

      handleResetAndClose();
    } catch (err: any) {
      console.error("Error saving student to database:", err);
      setErrorMessage(
        err.message || "Could not save student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100 modal-blur-backdrop-fixed"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={handleAttemptClose}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg px-2 px-sm-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden modal-blur-card">
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary p-2"
                  style={{ width: 44, height: 44 }}
                >
                  <UserPlus size={22} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0 fs-4">
                    Add Student to Class
                  </h5>
                  <p className="text-muted small mb-0">
                    Add an enrolled student to one of your assigned sections.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-light p-2 rounded-circle border-0 d-flex align-items-center justify-content-center text-secondary"
                aria-label="Close"
                disabled={isSubmitting}
                onClick={handleAttemptClose}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body p-3 p-md-4">
                {errorMessage && (
                  <div className="alert alert-danger py-2 mb-3 fs-6" role="alert">
                    {errorMessage}
                  </div>
                )}

                <div
                  className="p-3 rounded-3 mb-4 d-flex gap-2 align-items-start"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <Info size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span className="small text-secondary">
                    Official student records will be saved directly into the database along with target course section and subject enrollment.
                  </span>
                </div>

                <div className="row g-3">
                  <div
                    className="col-12 col-md-6 position-relative"
                    ref={dropdownRef}
                  >
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-lg fs-6 rounded-3 shadow-none border"
                        name="fullName"
                        placeholder="Search student name..."
                        value={formData.fullName}
                        disabled={isSubmitting}
                        onChange={handleNameChange}
                        onFocus={() =>
                          suggestions.length > 0 && setShowDropdown(true)
                        }
                        autoComplete="off"
                        required
                      />
                    </div>

                    {showDropdown && (
                      <ul
                        className="dropdown-menu show w-100 shadow-lg mt-1 overflow-auto rounded-3 p-0"
                        style={{ maxHeight: "200px", zIndex: 1050 }}
                      >
                        {isSearching ? (
                          <li className="dropdown-item text-muted small py-2 px-3">
                            Searching...
                          </li>
                        ) : (
                          suggestions.map((student, index) => {
                            const name = student.fullName || student.name || "";
                            const idNum = student.idNumber || student.studentIdNumber || "";
                            const courseDisplay =
                              student.program || student.course || student.department || "—";

                            return (
                              <li key={idNum || index}>
                                <button
                                  type="button"
                                  className="dropdown-item d-flex justify-content-between align-items-center py-2 px-3"
                                  onClick={() => handleSelectStudent(student)}
                                >
                                  <div>
                                    <div className="fw-semibold text-dark">{name}</div>
                                    <div className="text-muted extra-small">
                                      {courseDisplay}
                                    </div>
                                  </div>
                                  <span className="badge bg-light text-dark border ms-2">
                                    {idNum}
                                  </span>
                                </button>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Student ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg fs-6 rounded-3 bg-light shadow-none border"
                      name="studentId"
                      placeholder="Auto-filled upon selecting student"
                      value={formData.studentId}
                      readOnly
                      disabled
                      style={{ cursor: "not-allowed" }}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Program / Course <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg fs-6 rounded-3 shadow-none border ${
                        formData.studentId ? "bg-light" : ""
                      }`}
                      name="program"
                      placeholder="Auto-filled from student record"
                      value={formData.program}
                      onChange={handleGenericChange}
                      readOnly={Boolean(formData.studentId)}
                      disabled={isSubmitting}
                      style={{ cursor: formData.studentId ? "not-allowed" : "text" }}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Class / Section <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg fs-6 rounded-3 shadow-none border"
                      name="classSection"
                      value={formData.classSection}
                      onChange={handleGenericChange}
                      disabled={isSubmitting || isLoadingClasses}
                      required
                    >
                      <option value="" disabled>
                        {isLoadingClasses
                          ? "Loading assigned classes..."
                          : "Select class"}
                      </option>
                      {Array.isArray(assignedClasses) &&
                        assignedClasses.map((item) => (
                          <option key={item.id} value={item.section}>
                            {item.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-3 px-4 py-2 border text-muted fw-medium"
                  disabled={isSubmitting}
                  onClick={handleAttemptClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingClasses}
                  className="btn btn-primary rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                >
                  <UserPlus size={18} />
                  {isSubmitting ? "Saving..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1060 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 380, width: "100%" }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning mb-3"
              style={{ width: 56, height: 56 }}
            >
              <AlertTriangle size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">Unsaved Changes</h5>
            <p className="text-muted small mb-4">
              You have typed student information. Are you sure you want to discard it?
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger w-50 py-2 rounded-3 fw-medium"
                onClick={handleResetAndClose}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 1060 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 400, width: "100%" }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
              style={{ width: 56, height: 56 }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">Confirm Add Student</h5>
            <p className="text-muted small mb-3">
              Are you sure you want to save this student to the database?
            </p>

            <div className="bg-light p-3 rounded-3 text-start small mb-4 border">
              <div className="mb-1">
                <span className="text-muted">Student Name: </span>
                <strong className="text-dark">{formData.fullName || "—"}</strong>
              </div>
              <div className="mb-1">
                <span className="text-muted">Student ID: </span>
                <strong className="text-dark">{formData.studentId || "—"}</strong>
              </div>
              <div className="mb-1">
                <span className="text-muted">Program / Course: </span>
                <strong className="text-dark">{formData.program || "—"}</strong>
              </div>
              <div className="mb-1">
                <span className="text-muted">Target Section: </span>
                <strong className="text-dark">{displaySectionLabel}</strong>
              </div>
              {selectedClassObj?.code && (
                <div>
                  <span className="text-muted">Enrolling Subject: </span>
                  <strong className="text-dark">{selectedClassObj.code}</strong>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light border w-50 py-2 rounded-3 fw-medium"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary w-50 py-2 rounded-3 fw-medium"
                onClick={handleConfirmSubmit}
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}