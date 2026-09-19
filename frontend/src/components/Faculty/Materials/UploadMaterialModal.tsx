import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  ChevronDown,
  FileText,
  Video,
  FileCode,
  HelpCircle,
  Loader2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { MaterialItem, MaterialType } from "./types";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: string[];
  materialToEdit?: MaterialItem | null;
  onUploadSuccess: (newMaterial: MaterialItem) => void;
  onEditSuccess: (updatedMaterial: MaterialItem) => void;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  courses: fallbackCourses,
  materialToEdit,
  onUploadSuccess,
  onEditSuccess,
}: UploadMaterialModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Course List State
  const [facultyCourses, setFacultyCourses] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // UI Confirmation Overlay States
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(materialToEdit);

  /* =========================================================
     FETCH ASSIGNED SCHEDULE COURSES FOR SIGNED-IN FACULTY
     ========================================================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchFacultySchedules = async () => {
      setIsLoadingCourses(true);
      try {
        const userJson = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const user = userJson ? JSON.parse(userJson) : null;

        const facultyName =
          user?.name ||
          (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.lastName
            ? `Prof. ${user.lastName}`
            : "");

        const params = new URLSearchParams();
        if (facultyName) params.append("faculty", facultyName);
        if (user?.department) params.append("department", user.department);

        const res = await fetch(`/api/schedules?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const schedules = await res.json();
          const uniqueCourses: string[] = Array.from(
            new Set(
              schedules
                .map((s: any) => s.code || s.title)
                .filter((code: any) => Boolean(code))
            )
          );
          setFacultyCourses(uniqueCourses);
        } else {
          setFacultyCourses([]);
        }
      } catch (err) {
        console.error("Failed to fetch faculty courses:", err);
        setFacultyCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchFacultySchedules();
  }, [isOpen]);

  const availableCourses = useMemo(() => {
    if (facultyCourses.length > 0) {
      return facultyCourses;
    }
    return fallbackCourses.filter((c) => c !== "All Courses");
  }, [facultyCourses, fallbackCourses]);

  const handleResetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setCourse("");
    setMaterialType(null);
    setDescription("");
    setErrorMessage(null);
  };

  const handleResetAndClose = () => {
    handleResetForm();
    setIsSubmitting(false);
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (materialToEdit) {
        setTitle(materialToEdit.title || "");
        setCourse(materialToEdit.course || "");
        setMaterialType(materialToEdit.type || "pdf");
        setDescription(materialToEdit.description || "");
        setSelectedFile(null);
      } else {
        handleResetForm();
      }
      setShowExitConfirm(false);
      setShowSubmitConfirm(false);
    }
  }, [isOpen, materialToEdit]);

  const isDirty = useMemo(() => {
    if (selectedFile !== null) return true;

    if (materialToEdit) {
      return (
        title !== (materialToEdit.title || "") ||
        course !== (materialToEdit.course || "") ||
        description !== (materialToEdit.description || "")
      );
    }

    return (
      title.trim() !== "" ||
      course.trim() !== "" ||
      description.trim() !== ""
    );
  }, [selectedFile, title, course, description, materialToEdit]);

  const handleAttemptClose = () => {
    if (isSubmitting) return;

    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      handleResetAndClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  if (!isOpen) return null;

  const detectFileType = (file: File): MaterialType => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.type.toLowerCase();

    if (
      mimeType.startsWith("video/") ||
      ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v"].includes(extension)
    ) {
      return "video";
    }

    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType.includes("text") ||
      [
        "doc",
        "docx",
        "txt",
        "rtf",
        "odt",
        "ppt",
        "pptx",
        "xls",
        "xlsx",
        "csv",
        "zip",
      ].includes(extension)
    ) {
      return "doc";
    }

    return "pdf";
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const detectedType = detectFileType(file);
    setMaterialType(detectedType);

    if (!title) {
      const fileNameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(fileNameWithoutExt);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEditMode && !selectedFile) {
      setErrorMessage("Please select or drop a file to upload.");
      return;
    }
    if (!title || !course) {
      setErrorMessage("Material Title and Course are required.");
      return;
    }

    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);

    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("title", title);
      formData.append("course", course);
      formData.append("type", materialType || "pdf");
      formData.append("description", description);
      formData.append("facultyId", user?.id || user?._id || "");
      formData.append("uploadedBy", user?.name || "Faculty Member");
      formData.append("department", user?.department || "General");

      const url = isEditMode
        ? `/api/materials/${materialToEdit?.id}`
        : "/api/materials";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || `Failed to ${isEditMode ? "update" : "upload"} material.`
        );
      }

      if (isEditMode) {
        onEditSuccess(data.material);
      } else {
        onUploadSuccess(data.material);
      }

      handleResetAndClose();
    } catch (err: any) {
      console.error("Submit Error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileIcon = () => {
    if (!materialType) {
      return <HelpCircle size={18} className="text-muted flex-shrink-0" />;
    }

    switch (materialType) {
      case "video":
        return <Video size={18} className="text-purple-600 flex-shrink-0" />;
      case "doc":
        return <FileCode size={18} className="text-success flex-shrink-0" />;
      case "pdf":
      default:
        return <FileText size={18} className="text-danger flex-shrink-0" />;
    }
  };

  const getFormatLabel = () => {
    if (!materialType) return "Auto-detects on file upload";

    switch (materialType) {
      case "video":
        return "Video Recording";
      case "doc":
        return "Document / File";
      case "pdf":
      default:
        return "Document (PDF)";
    }
  };

  return (
    <>
      {/* MAIN UPLOAD MATERIAL MODAL CONTAINER */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 9999,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
        }}
        onClick={handleAttemptClose}
      >
        <div
          className="modal-dialog modal-dialog-scrollable my-2 my-sm-auto mx-auto px-2"
          style={{
            maxWidth: "600px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            minHeight: "calc(100% - 1rem)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white w-100 d-flex flex-column"
            style={{ maxHeight: "calc(100vh - 1.5rem)" }}
          >
            {/* Header */}
            <div className="modal-header border-bottom-0 pb-2 pt-3 pt-sm-4 px-3 px-sm-4 align-items-center justify-content-between flex-shrink-0">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary flex-shrink-0"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#E0F2FE",
                  }}
                >
                  {isEditMode ? <Edit2 size={20} /> : <Upload size={20} />}
                </div>
                <h5 className="modal-title fw-bold text-dark m-0 fs-6 fs-sm-5">
                  {isEditMode ? "Edit Course Material" : "Upload Course Material"}
                </h5>
              </div>

              <button
                type="button"
                className="btn-close shadow-none"
                aria-label="Close"
                disabled={isSubmitting}
                onClick={handleAttemptClose}
              />
            </div>

            {/* Scrollable Form Body Container */}
            <form
              onSubmit={handleFormSubmit}
              className="d-flex flex-column flex-grow-1 overflow-hidden m-0"
            >
              <div className="modal-body p-3 p-sm-4 overflow-y-auto">
                {errorMessage && (
                  <div
                    className="alert alert-danger py-2 px-3 mb-3 small rounded-3"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  className="upload-drop-zone p-3 border-2 border-dashed rounded-3 text-center mb-3 cursor-pointer transition-all"
                  style={{
                    borderColor: "#CBD5E1",
                    backgroundColor: "#F8FAFC",
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isSubmitting) fileInputRef.current?.click();
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    disabled={isSubmitting}
                    onChange={handleFileChange}
                  />
                  <div
                    className="mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center bg-white border text-primary"
                    style={{ width: "44px", height: "44px" }}
                  >
                    <Upload size={20} />
                  </div>

                  {selectedFile ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      {renderFileIcon()}
                      <div className="text-start minw-0">
                        <h6 className="fw-semibold text-dark mb-0 small text-truncate">
                          {selectedFile.name}
                        </h6>
                        <span className="text-muted small fs-7">
                          {formatFileSize(selectedFile.size)} &bull; Detected as{" "}
                          <strong className="text-capitalize">
                            {getFormatLabel()}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ) : isEditMode && materialToEdit ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      {renderFileIcon()}
                      <div className="text-start minw-0">
                        <h6 className="fw-semibold text-dark mb-0 small text-truncate">
                          {materialToEdit.title}
                        </h6>
                        <span className="text-muted small fs-7">
                          {materialToEdit.sizeLabel} &bull; Currently Attached
                        </span>
                        <div className="text-muted small fs-7 mt-0.5">
                          (Click or drag here if you wish to replace this file)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h6 className="fw-semibold text-dark mb-1 small">
                        Drop your file here, or click to browse
                      </h6>
                      <p className="text-muted small mb-0 fs-7">
                        Supports PDF, Word, PowerPoint, Videos, Images, and Code
                      </p>
                    </div>
                  )}
                </div>

                {/* Material Title */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small mb-1">
                    Material Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3 border shadow-none small py-1.5 px-3"
                    style={{ borderColor: "#E2E8F0" }}
                    placeholder="e.g., Week 1 - Introduction to Programming"
                    value={title}
                    disabled={isSubmitting}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Course & Type Dropdown Grid */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">
                      Course <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <select
                        className="form-select rounded-3 border shadow-none small py-1.5 px-3"
                        style={{ borderColor: "#E2E8F0" }}
                        value={course}
                        disabled={isSubmitting || isLoadingCourses}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          {isLoadingCourses
                            ? "Loading assigned courses..."
                            : availableCourses.length === 0
                            ? "No assigned courses found"
                            : "Select assigned course"}
                        </option>
                        {availableCourses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="position-absolute text-muted end-0 top-50 translate-middle-y me-3 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">
                      Detected Material Type
                    </label>
                    <div
                      className="form-control rounded-3 border bg-light d-flex align-items-center gap-2 small py-1.5 px-3 text-muted"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      {renderFileIcon()}
                      <span
                        className={`fw-medium text-truncate ${
                          materialType ? "text-dark" : "text-muted"
                        }`}
                      >
                        {getFormatLabel()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-1">
                  <label className="form-label fw-medium text-dark small mb-1">
                    Description
                  </label>
                  <textarea
                    className="form-control rounded-3 border shadow-none small p-2"
                    style={{ borderColor: "#E2E8F0" }}
                    rows={3}
                    placeholder="Brief description of this material..."
                    value={description}
                    disabled={isSubmitting}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Fixed Bottom Modal Actions */}
              <div className="modal-footer border-top-0 px-3 px-sm-4 py-2.5 bg-white flex-shrink-0 d-flex justify-content-end align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-3 px-3 py-1.5 border text-dark fw-medium small"
                  style={{ borderColor: "#E2E8F0" }}
                  disabled={isSubmitting}
                  onClick={handleAttemptClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary rounded-3 px-3.5 py-1.5 fw-medium d-inline-flex align-items-center gap-2 shadow-sm small"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={16}
                        className="spinner-border spinner-border-sm"
                      />
                      {isEditMode ? "Saving..." : "Uploading..."}
                    </>
                  ) : isEditMode ? (
                    <>
                      <Edit2 size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Material
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Overlay */}
      {showExitConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 text-warning bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "52px", height: "52px" }}
              >
                <AlertTriangle size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Unsaved Changes</h5>
              <p className="text-secondary small mb-4">
                You have unsaved changes. Are you sure you want to exit without
                saving?
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light border flex-fill py-2 px-3 rounded-3 fw-medium text-dark small"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-fill py-2 px-3 rounded-3 fw-medium small"
                  onClick={handleResetAndClose}
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Confirmation Overlay */}
      {showSubmitConfirm && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered px-3"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 text-center p-4 bg-white">
              <div
                className="mx-auto mb-3 text-primary bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "52px", height: "52px" }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {isEditMode ? "Save Changes?" : "Upload Material?"}
              </h5>
              <p className="text-secondary small mb-4">
                {isEditMode
                  ? "Are you sure you want to update this material's details?"
                  : "Are you sure you want to publish this new material?"}
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light border flex-fill py-2 px-3 rounded-3 text-dark fw-medium small"
                  onClick={() => setShowSubmitConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-fill py-2 px-3 rounded-3 fw-medium shadow-sm small"
                  onClick={handleConfirmSubmit}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}