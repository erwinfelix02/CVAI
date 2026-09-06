import { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  X,
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
      ["doc", "docx", "txt", "rtf", "odt", "ppt", "pptx", "xls", "xlsx", "csv", "zip"].includes(extension)
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

  const renderFileIcon = () => {
    if (!materialType) {
      return <HelpCircle size={20} className="text-muted" />;
    }

    switch (materialType) {
      case "video":
        return <Video size={20} className="text-purple-600" />;
      case "doc":
        return <FileCode size={20} className="text-success" />;
      case "pdf":
      default:
        return <FileText size={20} className="text-danger" />;
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
    <div
      className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 1050 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={handleAttemptClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Main Modal Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-square">
                {isEditMode ? <Edit2 size={22} /> : <Upload size={22} />}
              </div>
              <h5 className="modal-title fw-bold text-dark mb-0 fs-4">
                {isEditMode ? "Edit Course Material" : "Upload Course Material"}
              </h5>
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

          {/* Form */}
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body p-4">
              {errorMessage && (
                <div className="alert alert-danger py-2 mb-3 fs-6" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* Drop Zone */}
              <div
                className="upload-drop-zone"
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
                <div className="upload-icon-circle">
                  <Upload size={28} />
                </div>

                {selectedFile ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    {renderFileIcon()}
                    <div className="text-start">
                      <h6 className="fw-bold text-dark mb-0">{selectedFile.name}</h6>
                      <span className="text-muted small">
                        {formatFileSize(selectedFile.size)} &bull; Detected as{" "}
                        <strong className="text-capitalize">{getFormatLabel()}</strong>
                      </span>
                    </div>
                  </div>
                ) : isEditMode && materialToEdit ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    {renderFileIcon()}
                    <div className="text-start">
                      <h6 className="fw-bold text-dark mb-0">{materialToEdit.title}</h6>
                      <span className="text-muted small">
                        {materialToEdit.sizeLabel} &bull; Currently Attached
                      </span>
                      <p className="text-muted small mb-0 mt-1" style={{ fontSize: "0.8rem" }}>
                        (Click or drag here if you wish to replace this file)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h6 className="fw-semibold text-dark mb-1 fs-5">
                      Drop your file here, or click to browse
                    </h6>
                    <p className="text-muted small mb-0">
                      Supports PDF, Word, PowerPoint, Videos, Images, and Code files
                    </p>
                  </div>
                )}
              </div>

              {/* Material Title */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">
                  Material Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 border shadow-none fs-6"
                  placeholder="e.g., Week 1 - Introduction to Programming"
                  value={title}
                  disabled={isSubmitting}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Course Dropdown */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">
                    Course <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <select
                      className="form-select form-select-lg rounded-3 border shadow-none fs-6 custom-select-control"
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
                      size={18}
                      className="position-absolute text-muted end-0 top-50 translate-middle-y me-3 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">
                    Detected Material Type
                  </label>
                  <div className="form-control form-control-lg rounded-3 border bg-light d-flex align-items-center gap-2 fs-6 text-muted">
                    {renderFileIcon()}
                    <span className={`fw-medium ${materialType ? "text-dark" : "text-muted"}`}>
                      {getFormatLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="form-label fw-semibold text-dark small">
                  Description
                </label>
                <textarea
                  className="form-control rounded-3 border shadow-none fs-6"
                  rows={3}
                  placeholder="Brief description of this material..."
                  value={description}
                  disabled={isSubmitting}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Footer Buttons */}
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
                disabled={isSubmitting}
                className="btn btn-upload-submit rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner-border spinner-border-sm" />
                    {isEditMode ? "Saving..." : "Uploading..."}
                  </>
                ) : isEditMode ? (
                  <>
                    <Edit2 size={18} />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Material
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Overlay */}
      {showExitConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1070,
          }}
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
              You have unsaved changes. Are you sure you want to exit without saving?
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

      {/* Upload Confirmation Overlay */}
      {showSubmitConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 1070,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg text-center"
            style={{ maxWidth: 380, width: "100%" }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
              style={{ width: 56, height: 56 }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {isEditMode ? "Save Changes?" : "Upload Material?"}
            </h5>
            <p className="text-muted small mb-4">
              {isEditMode
                ? "Are you sure you want to update this material's details?"
                : "Are you sure you want to publish this new material?"}
            </p>
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
                className="btn btn-success w-50 py-2 rounded-3 fw-medium"
                onClick={handleConfirmSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}