import { useState, useEffect, useMemo } from "react";
import {
  X,
  Bell,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";
import type { Announcement } from "./types";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses?: string[];
  announcementToEdit?: Announcement | null;
  onSaveSuccess: (announcement: Announcement) => void;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  courses: fallbackCourses = [],
  announcementToEdit,
  onSaveSuccess,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  // Dynamic Course List fetched from Schedule
  const [facultyCourses, setFacultyCourses] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom UI Overlay States
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const isEditMode = Boolean(announcementToEdit);

  /* =========================================================
     FETCH FACULTY SCHEDULES TO DYNAMICALLY POPULATE COURSES
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
        console.error("Failed to fetch faculty course schedules:", err);
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
      if (announcementToEdit) {
        setTitle(announcementToEdit.title || "");
        setCourse(announcementToEdit.course || "");
        setPriority(announcementToEdit.priority || "");
        setMessage(announcementToEdit.message || "");
        setScheduledDate("");
      } else {
        handleResetForm();
      }
      setShowExitConfirm(false);
      setShowSubmitConfirm(false);
    }
  }, [isOpen, announcementToEdit]);

  const isDirty = useMemo(() => {
    if (announcementToEdit) {
      return (
        title !== (announcementToEdit.title || "") ||
        course !== (announcementToEdit.course || "") ||
        priority !== (announcementToEdit.priority || "") ||
        message !== (announcementToEdit.message || "") ||
        scheduledDate !== ""
      );
    }
    return (
      title.trim() !== "" ||
      course.trim() !== "" ||
      priority !== "" ||
      message.trim() !== "" ||
      scheduledDate !== ""
    );
  }, [title, course, priority, message, scheduledDate, announcementToEdit]);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !course || !priority || !message.trim()) {
      setErrorMessage("Please fill in all required fields including Priority Level.");
      return;
    }

    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);

    try {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = userJson ? JSON.parse(userJson) : null;

      const payload = {
        title: title.trim(),
        course,
        priority,
        message: message.trim(),
        scheduledDate,
        sendPush,
        sendEmail,
        facultyId: user?.id || user?._id || "",
        author:
          user?.name ||
          (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Faculty Member"),
        department: user?.department || "General",
      };

      const url = isEditMode
        ? `/api/announcements/${announcementToEdit?.id}`
        : "/api/announcements";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditMode ? "update" : "create"} announcement.`
        );
      }

      onSaveSuccess(data.announcement || data);
      handleResetAndClose();
    } catch (err: any) {
      console.error("Submit Announcement Error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle("");
    setCourse("");
    setPriority("");
    setMessage("");
    setScheduledDate("");
    setSendPush(true);
    setSendEmail(false);
    setErrorMessage(null);
  };

  const handleResetAndClose = () => {
    handleResetForm();
    setIsSubmitting(false);
    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
    onClose();
  };

  const priorityBadgeColor = () => {
    switch (priority) {
      case "high":
        return "bg-danger text-white";
      case "medium":
        return "bg-warning text-dark";
      case "low":
        return "bg-info text-dark";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <>
      {/* Main Modal Wrapper */}
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
            {/* Header */}
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10 text-success p-2"
                  style={{ width: 44, height: 44 }}
                >
                  <Bell size={22} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0 fs-4">
                    {isEditMode ? "Edit Announcement" : "New Announcement"}
                  </h5>
                  <p className="text-muted small mb-0">
                    {isEditMode
                      ? "Update class announcement details"
                      : "Post an update or notification to your course students"}
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

            {/* Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body p-3 p-md-4">
                {errorMessage && (
                  <div className="alert alert-danger py-2 mb-3 fs-6" role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* Announcement Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    Announcement Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3 border fs-6 shadow-none"
                    placeholder="e.g., Midterm Exam Schedule Update"
                    value={title}
                    disabled={isSubmitting}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Target Course & Priority Level */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark small">
                      Target Course <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg rounded-3 border fs-6 shadow-none"
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
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark small">
                      Priority Level <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <select
                        className="form-select form-select-lg rounded-3 border fs-6 shadow-none"
                        value={priority}
                        disabled={isSubmitting}
                        onChange={(e) => setPriority(e.target.value as any)}
                        required
                      >
                        <option value="" disabled>
                          Select priority level
                        </option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dynamic Summary Bar */}
                <div className="p-3 bg-light rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-medium">Priority:</span>
                    <span
                      className={`badge rounded-pill px-3 py-1 text-capitalize fw-semibold ${priorityBadgeColor()}`}
                    >
                      {priority || "Not Selected"}
                    </span>
                  </div>
                  <div className="text-muted small fw-medium">
                    {course ? (
                      <span className="text-dark">
                        Targeting <strong>{course}</strong>
                      </span>
                    ) : (
                      "Select a course"
                    )}
                  </div>
                </div>

                {/* Announcement Content */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    Announcement Content <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control rounded-3 border fs-6 shadow-none p-3"
                    rows={4}
                    maxLength={1000}
                    placeholder="Write your announcement message here..."
                    value={message}
                    disabled={isSubmitting}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <div
                    className="text-end text-muted small mt-1"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {message.length} / 1000 characters
                  </div>
                </div>

                {/* Schedule for Later */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small d-flex align-items-center gap-1">
                    <Calendar size={16} className="text-muted" />
                    Schedule for Later (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-lg rounded-3 border fs-6 shadow-none"
                    value={scheduledDate}
                    disabled={isSubmitting}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                  <div className="form-text text-muted small">
                    Leave empty to send immediately
                  </div>
                </div>

                {/* Notification Options Box */}
                <div className="p-3 bg-light bg-opacity-75 rounded-3 border mb-2">
                  <div className="fw-semibold text-dark mb-3 d-flex align-items-center gap-2 small">
                    <Users size={18} className="text-primary" />
                    Notification Options
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <div
                      className="form-check d-flex align-items-center gap-2 pointer"
                      onClick={() => !isSubmitting && setSendPush(!sendPush)}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input mt-0 pointer"
                        checked={sendPush}
                        onChange={() => {}}
                        readOnly
                      />
                      <label className="form-check-label text-dark small pointer mb-0">
                        Send push notification to students
                      </label>
                    </div>

                    <div
                      className="form-check d-flex align-items-center gap-2 pointer"
                      onClick={() => !isSubmitting && setSendEmail(!sendEmail)}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input mt-0 pointer"
                        checked={sendEmail}
                        onChange={() => {}}
                        readOnly
                      />
                      <label className="form-check-label text-dark small pointer mb-0">
                        Also send via email
                      </label>
                    </div>
                  </div>
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
                  className="btn btn-success rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="spinner-border spinner-border-sm"
                      />
                      {isEditMode ? "Saving..." : "Publishing..."}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {isEditMode ? "Save Changes" : "Post Announcement"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* UNSAVED EXIT CONFIRMATION OVERLAY */}
      {showExitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
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
              You have drafted an announcement. Are you sure you want to discard it?
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

      {/* SUBMIT CONFIRMATION OVERLAY */}
      {showSubmitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
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
              {isEditMode ? "Save Changes?" : "Post Announcement?"}
            </h5>
            <p className="text-muted small mb-4">
              {isEditMode
                ? "Are you sure you want to update this announcement?"
                : `Ready to notify students in ${course}?`}
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
    </>
  );
}