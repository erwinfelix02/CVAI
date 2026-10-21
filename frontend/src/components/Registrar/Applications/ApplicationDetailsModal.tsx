// src/components/Registrar/Applications/ApplicationDetailsModal.tsx

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

import { API_BASE_URL } from "../../../config";
import "../../../styles/application-modal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  application: any | null;
  onStatusUpdated: (
    registrationId: string,
    newStatus: "Approved" | "Returned",
  ) => void;
  showAlert: (message: string, type: "success" | "error") => void;
};

type TabType = "personal" | "academic" | "documents";
type ConfirmType = "Approved" | "Returned" | null;

const PREDEFINED_RETURN_REASONS = [
  "Incomplete or unreadable documents uploaded. Please re-upload clear copies.",
  "Incorrect personal or academic details provided. Please review and update.",
  "Missing required document attachments (e.g., Birth Certificate, Good Moral).",
  "Other / Custom resubmission note",
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

  const [selectedReasonOption, setSelectedReasonOption] = useState<string>("");
  const [customReturnReason, setCustomReturnReason] = useState<string>("");
  const [returnError, setReturnError] = useState<string | null>(null);

  const [visitedTabs, setVisitedTabs] = useState<Record<TabType, boolean>>({
    personal: true,
    academic: false,
    documents: false,
  });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [scrolledTabs, setScrolledTabs] = useState<Record<TabType, boolean>>({
    personal: false,
    academic: false,
    documents: false,
  });

  const [viewedDocFiles, setViewedDocFiles] = useState<Set<string>>(new Set());

  const documentList = useMemo(() => {
    if (!application?.documents) return [];
    const docs = application.documents;
    return [
      { label: "Birth Certificate", file: docs.birthCert, optional: false },
      { label: "Good Moral Certificate", file: docs.goodMoral, optional: true },
      { label: "2x2 ID Photo", file: docs.idPhoto, optional: false },
    ];
  }, [application]);

  const uploadedFilesToView = useMemo(() => {
    return documentList
      .filter((doc) => doc.file)
      .map((doc) => doc.file as string);
  }, [documentList]);

  useEffect(() => {
    if (open) {
      setActiveTab("personal");
      setVisitedTabs({ personal: true, academic: false, documents: false });
      setScrolledTabs({ personal: false, academic: false, documents: false });
      setViewedDocFiles(new Set());
      setSelectedReasonOption("");
      setCustomReturnReason("");
      setReturnError(null);
    }
  }, [open, application?.registrationId]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  const handleScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    if (isAtBottom) {
      setScrolledTabs((prev) => ({ ...prev, [activeTab]: true }));
    }
  };

  useEffect(() => {
    if (!bodyRef.current) return;
    const { scrollHeight, clientHeight } = bodyRef.current;
    if (scrollHeight <= clientHeight) {
      setScrolledTabs((prev) => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, open]);

  const handleOpenDocument = (filePath: string) => {
    setPreviewFile(filePath);
    setViewedDocFiles((prev) => {
      const next = new Set(prev);
      next.add(filePath);
      return next;
    });
  };

  if (!open || !application) return null;

  const { personal, academic, status } = application;
  const isApproved = status === "Approved";

  const allDocumentsViewed =
    isApproved ||
    uploadedFilesToView.every((filePath) => viewedDocFiles.has(filePath));

  const allTabsViewed =
    isApproved ||
    (visitedTabs.personal &&
      visitedTabs.academic &&
      visitedTabs.documents &&
      scrolledTabs.personal &&
      scrolledTabs.academic &&
      scrolledTabs.documents &&
      allDocumentsViewed);

  const formattedBirthDate = personal?.birthDate
    ? new Date(personal.birthDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const updateStatus = async () => {
    if (!confirmAction || loading) return;

    let finalReturnReason = "";
    if (confirmAction === "Returned") {
      if (!selectedReasonOption) {
        setReturnError("Please select a reason for returning the application.");
        return;
      }
      if (
        selectedReasonOption === "Other / Custom resubmission note" &&
        !customReturnReason.trim()
      ) {
        setReturnError("Please provide a custom explanation for the student.");
        return;
      }

      finalReturnReason =
        selectedReasonOption === "Other / Custom resubmission note"
          ? customReturnReason.trim()
          : selectedReasonOption;
    }

    try {
      setLoading(true);
      setReturnError(null);

      const res = await fetch(
        `${API_BASE_URL}/preregistrations/${application.registrationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: confirmAction,
            ...(confirmAction === "Returned" && {
              returnReason: finalReturnReason,
            }),
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update application status`);
      }

      onStatusUpdated(String(application.registrationId), confirmAction);

      showAlert(
        confirmAction === "Approved"
          ? "Application approved successfully."
          : "Application returned to student for revision.",
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

  const serverRoot = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;

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

          <div className="tab-container">
            <button
              className={`${activeTab === "personal" ? "active" : ""} ${
                isApproved || (visitedTabs.personal && scrolledTabs.personal)
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("personal")}
            >
              Personal
              {(isApproved ||
                (visitedTabs.personal && scrolledTabs.personal)) && (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              )}
            </button>

            <button
              className={`${activeTab === "academic" ? "active" : ""} ${
                isApproved || (visitedTabs.academic && scrolledTabs.academic)
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("academic")}
            >
              Academic
              {(isApproved ||
                (visitedTabs.academic && scrolledTabs.academic)) && (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              )}
            </button>

            <button
              className={`${activeTab === "documents" ? "active" : ""} ${
                isApproved ||
                (visitedTabs.documents &&
                  scrolledTabs.documents &&
                  allDocumentsViewed)
                  ? "tab-viewed"
                  : ""
              }`}
              onClick={() => handleTabChange("documents")}
            >
              Documents
              {isApproved ||
              (visitedTabs.documents &&
                scrolledTabs.documents &&
                allDocumentsViewed) ? (
                <CheckCircle size={12} className="tab-check-icon ms-1" />
              ) : (
                !isApproved &&
                uploadedFilesToView.length > 0 && (
                  <span className="badge bg-secondary ms-1 style-doc-count">
                    {viewedDocFiles.size}/{uploadedFilesToView.length}
                  </span>
                )
              )}
            </button>
          </div>

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
                  const isViewed =
                    isApproved ||
                    (doc.file ? viewedDocFiles.has(doc.file) : false);

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

                {!isApproved && (
                  <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                    * All uploaded documents must be clicked and viewed before
                    unlocking approval or resubmission options.
                  </div>
                )}
              </div>
            )}
          </div>

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
                    className="btn btn-outline-warning text-dark fw-semibold"
                    onClick={() => setConfirmAction("Returned")}
                    disabled={loading}
                  >
                    Return for Resubmission
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
                src={`${serverRoot}${previewFile}`}
                width="100%"
                height="600px"
                title="PDF Preview"
              />
            ) : (
              <img
                src={`${serverRoot}${previewFile}`}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "600px",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            )}
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="app-modal-backdrop"
          onClick={() => {
            if (!loading) {
              setConfirmAction(null);
              setReturnError(null);
            }
          }}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h4 className="confirm-modal-title d-flex align-items-center gap-2">
                {confirmAction === "Returned" && (
                  <RotateCcw className="text-warning" size={20} />
                )}
                {confirmAction === "Approved"
                  ? "Approve Application?"
                  : "Return for Resubmission"}
              </h4>

              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() => {
                  if (!loading) {
                    setConfirmAction(null);
                    setReturnError(null);
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
                    Specify what the student needs to revise or resubmit for{" "}
                    <strong>
                      {personal.firstName} {personal.lastName}
                    </strong>
                    . They will receive this feedback to update their
                    registration.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Select Resubmission Feedback{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedReasonOption}
                      onChange={(e) => {
                        setSelectedReasonOption(e.target.value);
                        setReturnError(null);
                      }}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        -- Select feedback / reason --
                      </option>
                      {PREDEFINED_RETURN_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedReasonOption === "Other / Custom resubmission note" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">
                        Detailed Instructions{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={3}
                        placeholder="Provide specific notes on what needs to be fixed..."
                        value={customReturnReason}
                        onChange={(e) => {
                          setCustomReturnReason(e.target.value);
                          setReturnError(null);
                        }}
                        disabled={loading}
                      />
                    </div>
                  )}

                  {returnError && (
                    <div className="alert alert-danger py-2 px-3 small mb-0">
                      {returnError}
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
                    setReturnError(null);
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
                    : "btn btn-warning btn-sm text-dark fw-semibold"
                }
                onClick={updateStatus}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : confirmAction === "Approved"
                    ? "Confirm Approval"
                    : "Confirm Return for Resubmission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
