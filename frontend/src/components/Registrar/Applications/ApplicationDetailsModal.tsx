// ✅ src/components/Registrar/Applications/ApplicationDetailsModal.tsx

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import "../../../styles/application-modal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  application: any | null;
  onStatusUpdated: (
    registrationId: string,
    newStatus: "Approved" | "Rejected",
  ) => void;
  showAlert: (message: string, type: "success" | "error") => void;
};

type TabType = "personal" | "academic" | "documents";
type ConfirmType = "Approved" | "Rejected" | null;

const PREDEFINED_REJECTION_REASONS = [
  "Incomplete or unreadable documents uploaded",
  "Incorrect personal or academic details provided",
  "Failed to meet admission requirement criteria",
  "Duplicate registration entry",
  "Other / Custom reason",
];

export default function ApplicationDetailsModal({
  open,
  onClose,
  application,
  onStatusUpdated,
  showAlert,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmType>(null);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     REJECTION REASON STATE
     ========================================================= */
  const [selectedReasonOption, setSelectedReasonOption] = useState<string>("");
  const [customRejectionReason, setCustomRejectionReason] =
    useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  /* =========================================================
     VIEW TRACKING STATE (Tabs + Document Previews)
     ========================================================= */
  const [visitedTabs, setVisitedTabs] = useState<Record<TabType, boolean>>({
    personal: true, // Personal is open by default
    academic: false,
    documents: false,
  });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [scrolledTabs, setScrolledTabs] = useState<Record<TabType, boolean>>({
    personal: false,
    academic: false,
    documents: false,
  });

  // Track which specific document files have been previewed by the user
  const [viewedDocFiles, setViewedDocFiles] = useState<Set<string>>(new Set());

  // Derive document list from application state
  const documentList = useMemo(() => {
    if (!application?.documents) return [];
    const docs = application.documents;
    return [
      { label: "Birth Certificate", file: docs.birthCert, optional: false },
      { label: "Good Moral Certificate", file: docs.goodMoral, optional: true },
      { label: "2x2 ID Photo", file: docs.idPhoto, optional: false },
    ];
  }, [application]);

  // List of uploaded file paths that MUST be previewed
  const uploadedFilesToView = useMemo(() => {
    return documentList
      .filter((doc) => doc.file)
      .map((doc) => doc.file as string);
  }, [documentList]);

  // Reset tab and document review tracking when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("personal");
      setVisitedTabs({ personal: true, academic: false, documents: false });
      setScrolledTabs({ personal: false, academic: false, documents: false });
      setViewedDocFiles(new Set());
      setSelectedReasonOption("");
      setCustomRejectionReason("");
      setRejectionError(null);
    }
  }, [open, application?.registrationId]);

  // Handle Tab Switch
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  // Check scroll position of current tab body
  const handleScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;

    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    if (isAtBottom) {
      setScrolledTabs((prev) => ({ ...prev, [activeTab]: true }));
    }
  };

  // Auto-detect if content doesn't require scrolling
  useEffect(() => {
    if (!bodyRef.current) return;
    const { scrollHeight, clientHeight } = bodyRef.current;
    if (scrollHeight <= clientHeight) {
      setScrolledTabs((prev) => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, open]);

  // Handle document preview click & mark as viewed
  const handleOpenDocument = (filePath: string) => {
    setPreviewFile(filePath);
    setViewedDocFiles((prev) => {
      const next = new Set(prev);
      next.add(filePath);
      return next;
    });
  };

  // Check if ALL uploaded documents have been previewed
  const allDocumentsViewed = uploadedFilesToView.every((filePath) =>
    viewedDocFiles.has(filePath),
  );

  // Check if ALL criteria (Tabs visited + Scrolled + Documents Previewed) are met
  const allTabsViewed =
    visitedTabs.personal &&
    visitedTabs.academic &&
    visitedTabs.documents &&
    scrolledTabs.personal &&
    scrolledTabs.academic &&
    scrolledTabs.documents &&
    allDocumentsViewed;

  if (!open || !application) return null;

  const { personal, academic, status } = application;

  const formattedBirthDate = personal?.birthDate
    ? new Date(personal.birthDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const updateStatus = async () => {
    if (!confirmAction || loading) return;

    // Validate rejection reason if rejecting
    let finalRejectionReason = "";
    if (confirmAction === "Rejected") {
      if (!selectedReasonOption) {
        setRejectionError("Please select a reason for rejection.");
        return;
      }
      if (
        selectedReasonOption === "Other / Custom reason" &&
        !customRejectionReason.trim()
      ) {
        setRejectionError("Please provide a custom rejection reason.");
        return;
      }

      finalRejectionReason =
        selectedReasonOption === "Other / Custom reason"
          ? customRejectionReason.trim()
          : selectedReasonOption;
    }

    try {
      setLoading(true);
      setRejectionError(null);

      const res = await fetch(
        `http://localhost:5000/api/preregistrations/${application.registrationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: confirmAction,
            ...(confirmAction === "Rejected" && {
              rejectionReason: finalRejectionReason,
            }),
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message || `Failed to ${confirmAction.toLowerCase()} application`,
        );
      }

      onStatusUpdated(String(application.registrationId), confirmAction);

      showAlert(
        confirmAction === "Approved"
          ? "Application approved successfully."
          : "Application rejected successfully.",
        "success",
      );

      setConfirmAction(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || "Failed to update application status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="app-modal-backdrop"
        onClick={() => {
          if (!loading) onClose();
        }}
      >
        <div className="app-modal" onClick={(e) => e.stopPropagation()}>
          <div className="app-modal-header">
            <h4>Application Details</h4>

            <div className="header-right">
              <span className={`status-badge ${status.toLowerCase()}`}>
                {status}
              </span>

              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => {
                  if (!loading) onClose();
                }}
                disabled={loading}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION WITH REVIEW INDICATORS */}
          <div className="tab-container">
            <button
              className={`${activeTab === "personal" ? "active" : ""} ${
                visitedTabs.personal && scrolledTabs.personal
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("personal")}
            >
              Personal
              {visitedTabs.personal && scrolledTabs.personal && (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              )}
            </button>

            <button
              className={`${activeTab === "academic" ? "active" : ""} ${
                visitedTabs.academic && scrolledTabs.academic
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("academic")}
            >
              Academic
              {visitedTabs.academic && scrolledTabs.academic && (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              )}
            </button>

            <button
              className={`${activeTab === "documents" ? "active" : ""} ${
                visitedTabs.documents &&
                scrolledTabs.documents &&
                allDocumentsViewed
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("documents")}
            >
              Documents
              {visitedTabs.documents &&
              scrolledTabs.documents &&
              allDocumentsViewed ? (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              ) : (
                uploadedFilesToView.length > 0 && (
                  <span className="badge bg-secondary ms-1 style-doc-count">
                    {viewedDocFiles.size}/{uploadedFilesToView.length}
                  </span>
                )
              )}
            </button>
          </div>

          {/* SCROLLABLE MODAL BODY */}
          <div className="app-modal-body" ref={bodyRef} onScroll={handleScroll}>
            {activeTab === "personal" && (
              <div className="info-grid">
                <div>
                  <div className="info-label">
                    <User size={16} /> Full Name
                  </div>
                  <div className="info-value">
                    {personal.firstName} {personal.middleName}{" "}
                    {personal.lastName}
                  </div>
                </div>

                <div>
                  <div className="info-label">
                    <Mail size={16} /> Email
                  </div>
                  <div className="info-value">{personal.email}</div>
                </div>

                <div>
                  <div className="info-label">
                    <Phone size={16} /> Phone
                  </div>
                  <div className="info-value">{personal.phone}</div>
                </div>

                <div>
                  <div className="info-label">
                    <Calendar size={16} /> Birth Date
                  </div>
                  <div className="info-value">{formattedBirthDate}</div>
                </div>

                <div className="full-width">
                  <div className="info-label">
                    <MapPin size={16} /> Address
                  </div>
                  <div className="info-value">{personal.address}</div>
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="info-grid">
                <div>
                  <div className="info-label">Course</div>
                  <div className="info-value">{academic.course}</div>
                </div>

                <div>
                  <div className="info-label">Applicant Type</div>
                  <div className="info-value">{academic.applicantType}</div>
                </div>

                {academic.previousSchool && (
                  <div className="full-width">
                    <div className="info-label">Previous School</div>
                    <div className="info-value">{academic.previousSchool}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="doc-card-list">
                {documentList.map((doc) => {
                  const isViewed = doc.file
                    ? viewedDocFiles.has(doc.file)
                    : false;

                  return (
                    <div
                      key={doc.label}
                      className={`doc-card ${doc.file ? "clickable" : ""}`}
                      onClick={() => doc.file && handleOpenDocument(doc.file)}
                    >
                      <div className="doc-left">
                        <span className="doc-icon">📄</span>
                        <span className="d-flex align-items-center gap-1">
                          {doc.label}
                          {doc.optional && (
                            <span
                              style={{
                                marginLeft: 4,
                                fontSize: 12,
                                opacity: 0.7,
                              }}
                            >
                              (Optional)
                            </span>
                          )}
                          {isViewed && (
                            <span className="badge bg-success-subtle text-success ms-2 small d-inline-flex align-items-center gap-1">
                              <Eye size={12} /> Viewed
                            </span>
                          )}
                        </span>
                      </div>

                      <span
                        className={`doc-status ${
                          doc.file
                            ? isViewed
                              ? "uploaded"
                              : "uploaded-unviewed"
                            : doc.optional
                              ? "optional"
                              : "missing"
                        }`}
                      >
                        {doc.file
                          ? isViewed
                            ? "Uploaded (Viewed)"
                            : "Click to View Document"
                          : doc.optional
                            ? "Not uploaded"
                            : "Missing"}
                      </span>
                    </div>
                  );
                })}

                <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                  * All uploaded documents must be clicked and viewed before
                  unlocking approval or rejection actions.
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {status === "Pending" && (
            <div className="app-modal-footer d-flex align-items-center justify-content-between">
              {!allTabsViewed ? (
                <div className="text-muted small italic">
                  {!allDocumentsViewed
                    ? "* Preview all uploaded documents and review all tabs to enable action options."
                    : "* View and scroll through all tabs to enable action options."}
                </div>
              ) : (
                <div className="d-flex gap-2 ms-auto">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setConfirmAction("Rejected")}
                    disabled={loading}
                  >
                    Reject
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => setConfirmAction("Approved")}
                    disabled={loading}
                  >
                    Approve Registration
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewFile && (
        <div className="preview-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h5>Document Preview</h5>
              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => setPreviewFile(null)}
                aria-label="Close preview"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {previewFile.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`http://localhost:5000${previewFile}`}
                width="100%"
                height="600px"
                title="PDF Preview"
              />
            ) : (
              <img
                src={`http://localhost:5000${previewFile}`}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "600px" }}
              />
            )}
          </div>
        </div>
      )}

      {/* ACTION MODAL (APPROVE OR REJECT WITH REASON FORM) */}
      {confirmAction && (
        <div
          className="app-modal-backdrop"
          onClick={() => {
            if (!loading) {
              setConfirmAction(null);
              setRejectionError(null);
            }
          }}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h4 className="confirm-modal-title d-flex align-items-center gap-2">
                {confirmAction === "Rejected" && (
                  <AlertTriangle className="text-danger" size={20} />
                )}
                {confirmAction === "Approved"
                  ? "Approve Application?"
                  : "Reject Application"}
              </h4>

              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => {
                  if (!loading) {
                    setConfirmAction(null);
                    setRejectionError(null);
                  }
                }}
                disabled={loading}
                aria-label="Close confirmation"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="confirm-modal-body">
              {confirmAction === "Approved" ? (
                <p className="mb-0">
                  Are you sure you want to <strong>approve</strong> this
                  registration? The applicant will be notified to proceed with
                  enrollment.
                </p>
              ) : (
                <div className="rejection-form-wrapper">
                  <p className="text-muted small mb-3">
                    Please specify a reason for rejecting the registration for{" "}
                    <strong>
                      {personal.firstName} {personal.lastName}
                    </strong>
                    . This will help inform the student regarding their status.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Select Rejection Reason{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedReasonOption}
                      onChange={(e) => {
                        setSelectedReasonOption(e.target.value);
                        setRejectionError(null);
                      }}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        -- Select a reason --
                      </option>
                      {PREDEFINED_REJECTION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedReasonOption === "Other / Custom reason" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">
                        Detailed Explanation{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="Provide specific reason for rejection..."
                        value={customRejectionReason}
                        onChange={(e) => {
                          setCustomRejectionReason(e.target.value);
                          setRejectionError(null);
                        }}
                        disabled={loading}
                      />
                    </div>
                  )}

                  {rejectionError && (
                    <div className="alert alert-danger py-2 px-3 small mb-0">
                      {rejectionError}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="confirm-actions mt-3">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (!loading) {
                    setConfirmAction(null);
                    setRejectionError(null);
                  }
                }}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmAction === "Approved"
                    ? "btn btn-primary btn-sm"
                    : "btn btn-danger btn-sm"
                }
                onClick={updateStatus}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : confirmAction === "Approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}