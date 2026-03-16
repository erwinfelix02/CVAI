import { useState } from "react";
import { X, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
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

  if (!open || !application) return null;

  const { personal, academic, documents, status } = application;

  const formattedBirthDate = personal.birthDate
    ? new Date(personal.birthDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const updateStatus = async () => {
    if (!confirmAction) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/preregistrations/${application.registrationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: confirmAction }),
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
      <div className="app-modal-backdrop" onClick={onClose}>
        <div className="app-modal" onClick={(e) => e.stopPropagation()}>
          <div className="app-modal-header">
            <h4>Application Details</h4>

            <div className="header-right">
              <span className={`status-badge ${status.toLowerCase()}`}>
                {status}
              </span>

              <button className="close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="tab-container">
            <button
              className={activeTab === "personal" ? "active" : ""}
              onClick={() => setActiveTab("personal")}
            >
              Personal
            </button>

            <button
              className={activeTab === "academic" ? "active" : ""}
              onClick={() => setActiveTab("academic")}
            >
              Academic
            </button>

            <button
              className={activeTab === "documents" ? "active" : ""}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
          </div>

          <div className="app-modal-body">
            {activeTab === "personal" && (
              <div className="info-grid">
                <div>
                  <div className="info-label">
                    <User size={16} /> Full Name
                  </div>
                  <div className="info-value">
                    {personal.firstName} {personal.middleName} {personal.lastName}
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
                {[
                  { label: "Birth Certificate", file: documents.birthCert },
                  { label: "Form 137", file: documents.form137 },
                  { label: "Good Moral Certificate", file: documents.goodMoral },
                  { label: "2x2 ID Photo", file: documents.idPhoto },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className={`doc-card ${doc.file ? "clickable" : ""}`}
                    onClick={() => doc.file && setPreviewFile(doc.file)}
                  >
                    <div className="doc-left">
                      <span className="doc-icon">📄</span>
                      <span>{doc.label}</span>
                    </div>

                    <span
                      className={`doc-status ${
                        doc.file ? "uploaded" : "missing"
                      }`}
                    >
                      {doc.file ? "Uploaded" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {status === "Pending" && (
            <div className="app-modal-footer">
              <button
                className="btn btn-outline-danger"
                onClick={() => setConfirmAction("Rejected")}
              >
                Reject
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setConfirmAction("Approved")}
              >
                Approve Registration
              </button>
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <div className="preview-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h5>Document Preview</h5>
              <button onClick={() => setPreviewFile(null)}>
                <X size={18} />
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

      {confirmAction && (
        <div
          className="app-modal-backdrop"
          onClick={() => setConfirmAction(null)}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>
              {confirmAction === "Approved"
                ? "Approve Application?"
                : "Reject Application?"}
            </h4>

            <p>
              Are you sure you want to{" "}
              {confirmAction === "Approved" ? "approve" : "reject"} this
              registration?
            </p>

            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                className={
                  confirmAction === "Approved"
                    ? "btn btn-primary"
                    : "btn btn-danger"
                }
                onClick={updateStatus}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}