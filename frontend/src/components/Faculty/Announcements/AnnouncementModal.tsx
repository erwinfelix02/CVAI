import { useState, useEffect, useMemo, useCallback } from "react";
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

interface ScheduleOption {
  id: string;
  code: string;
  title: string;
  section: string;
  displayLabel: string;
}

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
  announcementToEdit,
  onSaveSuccess,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [selectedScheduleKey, setSelectedScheduleKey] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [isCalculatingRecipients, setIsCalculatingRecipients] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const isEditMode = Boolean(announcementToEdit);

  /* =========================================================
     FETCH FACULTY SCHEDULES TO DYNAMICALLY POPULATE COURSES & SECTIONS
     ========================================================= */
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok && isMounted) {
          const schedules = await res.json();

          const mappedOptions: ScheduleOption[] = schedules
            .filter((s: any) => Boolean(s.code || s.title))
            .map((s: any) => ({
              id: String(s._id || s.id),
              code: s.code || "",
              title: s.title || "",
              section: s.section || "",
              displayLabel: `${s.code || "Subject"} - ${s.title || "Untitled"}${
                s.section ? ` (${s.section})` : ""
              }`,
            }));

          setScheduleOptions(mappedOptions);
        } else if (isMounted) {
          setScheduleOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch faculty course schedules:", err);
        if (isMounted) setScheduleOptions([]);
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };

    fetchFacultySchedules();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const activeSchedule = useMemo(() => {
    return scheduleOptions.find((opt) => opt.id === selectedScheduleKey);
  }, [scheduleOptions, selectedScheduleKey]);

  /* =========================================================
     FETCH RECIPIENT COUNT LIVE FROM BACKEND
     ========================================================= */
  const fetchRecipientCount = useCallback(async (targetCode: string, section: string) => {
    if (!targetCode) {
      setRecipientCount(0);
      return;
    }

    setIsCalculatingRecipients(true);
    try {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = userJson ? JSON.parse(userJson) : null;

      const params = new URLSearchParams({
        courseCode: targetCode,
        section: section || "",
        department: user?.department || "General",
      });

      const res = await fetch(`/api/announcements/recipients/count?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRecipientCount(data.count ?? 0);
      } else {
        setRecipientCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch recipient count:", err);
      setRecipientCount(0);
    } finally {
      setIsCalculatingRecipients(false);
    }
  }, []);

  /* =========================================================
     SYNC FORM STATE IN EDIT MODE / SCHEDULE LOAD
     ========================================================= */
  useEffect(() => {
    if (!isOpen) return;

    if (announcementToEdit) {
      setTitle(announcementToEdit.title || "");
      setPriority(announcementToEdit.priority || "");
      setMessage(announcementToEdit.message || "");
      setScheduledDate(announcementToEdit.scheduledDate || "");

      const matched = scheduleOptions.find(
        (opt) =>
          (announcementToEdit.subjectCode &&
            opt.code.toLowerCase() === announcementToEdit.subjectCode.toLowerCase() &&
            opt.section.toLowerCase() === (announcementToEdit.section || "").toLowerCase()) ||
          opt.displayLabel === announcementToEdit.course
      );

      if (matched) {
        setSelectedScheduleKey(matched.id);
      } else if (
        announcementToEdit.course === "All Courses" ||
        announcementToEdit.subjectCode === "All Courses"
      ) {
        setSelectedScheduleKey("ALL");
      } else if (scheduleOptions.length > 0) {
        setSelectedScheduleKey(announcementToEdit.course || "");
      }
    } else {
      handleResetForm();
    }

    setShowExitConfirm(false);
    setShowSubmitConfirm(false);
  }, [isOpen, announcementToEdit, scheduleOptions]);

  /* =========================================================
     TRIGGER RECIPIENT RE-CALCULATION WHEN TARGET SELECTION CHANGES
     ========================================================= */
  useEffect(() => {
    if (!isOpen) return;

    if (selectedScheduleKey === "ALL") {
      fetchRecipientCount("All Courses", "");
    } else if (activeSchedule) {
      fetchRecipientCount(activeSchedule.code, activeSchedule.section);
    } else if (announcementToEdit && selectedScheduleKey) {
      fetchRecipientCount(
        announcementToEdit.subjectCode || announcementToEdit.course,
        announcementToEdit.section || ""
      );
    } else {
      setRecipientCount(0);
    }
  }, [selectedScheduleKey, activeSchedule, isOpen, announcementToEdit, fetchRecipientCount]);

  const isDirty = useMemo(() => {
    if (announcementToEdit) {
      return (
        title !== (announcementToEdit.title || "") ||
        selectedScheduleKey !== (announcementToEdit.course || "") ||
        priority !== (announcementToEdit.priority || "") ||
        message !== (announcementToEdit.message || "") ||
        scheduledDate !== ""
      );
    }
    return (
      title.trim() !== "" ||
      selectedScheduleKey !== "" ||
      priority !== "" ||
      message.trim() !== "" ||
      scheduledDate !== ""
    );
  }, [title, selectedScheduleKey, priority, message, scheduledDate, announcementToEdit]);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !selectedScheduleKey || !priority || !message.trim()) {
      setErrorMessage(
        "Please fill in all required fields including Target Schedule and Priority Level."
      );
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

      const courseLabel = activeSchedule
        ? activeSchedule.displayLabel
        : selectedScheduleKey === "ALL"
        ? "All Courses"
        : selectedScheduleKey;

      const subjectCode = activeSchedule
        ? activeSchedule.code
        : selectedScheduleKey === "ALL"
        ? "All Courses"
        : announcementToEdit?.subjectCode || selectedScheduleKey;

      const section = activeSchedule
        ? activeSchedule.section
        : announcementToEdit?.section || "";

      const payload = {
        title: title.trim(),
        course: courseLabel,
        subjectCode,
        section,
        priority,
        message: message.trim(),
        scheduledDate,
        sendPush,
        sendEmail,
        recipients: recipientCount,
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
          data.message || `Failed to ${isEditMode ? "update" : "create"} announcement.`
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
    setSelectedScheduleKey("");
    setPriority("");
    setMessage("");
    setScheduledDate("");
    setSendPush(true);
    setSendEmail(false);
    setErrorMessage(null);
    setRecipientCount(0);
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
                  <Bell size={22} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0 fs-4">
                    {isEditMode ? "Edit Announcement" : "New Announcement"}
                  </h5>
                  <p className="text-muted small mb-0">
                    Post updates targeting specific subjects, sections, or classes
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

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark small">
                      Target Course / Class Section <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg rounded-3 border fs-6 shadow-none"
                      value={selectedScheduleKey}
                      disabled={isSubmitting || isLoadingCourses}
                      onChange={(e) => setSelectedScheduleKey(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        {isLoadingCourses
                          ? "Loading assigned schedule..."
                          : scheduleOptions.length === 0
                          ? "No active schedule entries found"
                          : "Select assigned course / section"}
                      </option>
                      <option value="ALL">All Enrolled Department Students</option>
                      {scheduleOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.displayLabel}
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

                <div className="p-3 bg-light rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-medium">Priority:</span>
                    <span
                      className={`badge rounded-pill px-3 py-1 text-capitalize fw-semibold ${priorityBadgeColor()}`}
                    >
                      {priority || "Not Selected"}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
                    {selectedScheduleKey ? (
                      <>
                        <Users size={16} className="text-primary" />
                        <span className="text-dark">
                          Targeting{" "}
                          <strong>
                            {activeSchedule
                              ? activeSchedule.displayLabel
                              : selectedScheduleKey === "ALL"
                              ? "All Enrolled Students"
                              : selectedScheduleKey}
                          </strong>
                        </span>
                        <span className="badge bg-primary bg-opacity-10 text-primary ms-1 px-2 py-1">
                          {isCalculatingRecipients ? (
                            <Loader2 size={12} className="spinner-border spinner-border-sm" />
                          ) : (
                            `${recipientCount} Student${recipientCount === 1 ? "" : "s"}`
                          )}
                        </span>
                      </>
                    ) : (
                      "Select a course or class section"
                    )}
                  </div>
                </div>

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
                  <div className="text-end text-muted small mt-1" style={{ fontSize: "0.8rem" }}>
                    {message.length} / 1000 characters
                  </div>
                </div>

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
                        Send push notification to students ({recipientCount} enrolled)
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
                  className="btn btn-primary rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner-border spinner-border-sm" />
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

      {showExitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-4 p-4 shadow-lg text-center" style={{ maxWidth: 380, width: "100%" }}>
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

      {showSubmitConfirm && (
        <div
          className="modal-blur-backdrop-fixed d-flex align-items-center justify-content-center p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-4 p-4 shadow-lg text-center" style={{ maxWidth: 380, width: "100%" }}>
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
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
                : `Ready to notify ${recipientCount} student${recipientCount === 1 ? "" : "s"} in ${
                    activeSchedule ? activeSchedule.displayLabel : selectedScheduleKey
                  }?`}
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
                className="btn btn-primary w-50 py-2 rounded-3 fw-medium"
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