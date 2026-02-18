import { useState } from "react";
import { X, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import "../../../styles/application-modal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  application: any | null;
};

type TabType = "personal" | "academic" | "documents";

export default function ApplicationDetailsModal({
  open,
  onClose,
  application,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  if (!open || !application) return null;

  const { personal, academic, documents, status } = application;
  const updateStatus = async (newStatus: "Approved" | "Rejected") => {
    try {
      await fetch(
        `http://localhost:5000/api/preregistrations/${application.registrationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      window.location.reload(); // simple for now
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
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

        {/* TAB CONTAINER */}
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

        {/* BODY */}
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
                <div className="info-value">{personal.birthDate}</div>
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
              {/* Birth Certificate */}
              <div
                className={`doc-card ${documents.birthCert ? "clickable" : ""}`}
                onClick={() => {
                  if (documents.birthCert) {
                    setPreviewFile(documents.birthCert);
                  }
                }}
              >
                <div className="doc-left">
                  <span className="doc-icon">📄</span>
                  <span>Birth Certificate</span>
                </div>

                <span
                  className={`doc-status ${
                    documents.birthCert ? "uploaded" : "missing"
                  }`}
                >
                  {documents.birthCert ? "Uploaded" : "Missing"}
                </span>
              </div>

              {/* Form 137 */}
              <div
                className={`doc-card ${documents.form137 ? "clickable" : ""}`}
                onClick={() => {
                  if (documents.form137) {
                    setPreviewFile(documents.form137);
                  }
                }}
              >
                <div className="doc-left">
                  <span className="doc-icon">📄</span>
                  <span>Form 137</span>
                </div>

                <span
                  className={`doc-status ${
                    documents.form137 ? "uploaded" : "missing"
                  }`}
                >
                  {documents.form137 ? "Uploaded" : "Missing"}
                </span>
              </div>

              {/* Good Moral */}
              <div
                className={`doc-card ${documents.goodMoral ? "clickable" : ""}`}
                onClick={() => {
                  if (documents.goodMoral) {
                    setPreviewFile(documents.goodMoral);
                  }
                }}
              >
                <div className="doc-left">
                  <span className="doc-icon">📄</span>
                  <span>Good Moral Certificate</span>
                </div>

                <span
                  className={`doc-status ${
                    documents.goodMoral ? "uploaded" : "missing"
                  }`}
                >
                  {documents.goodMoral ? "Uploaded" : "Missing"}
                </span>
              </div>

              {/* ID Photo */}
              <div
                className={`doc-card ${documents.idPhoto ? "clickable" : ""}`}
                onClick={() => {
                  if (documents.idPhoto) {
                    setPreviewFile(documents.idPhoto);
                  }
                }}
              >
                <div className="doc-left">
                  <span className="doc-icon">📄</span>
                  <span>2x2 ID Photo</span>
                </div>

                <span
                  className={`doc-status ${
                    documents.idPhoto ? "uploaded" : "missing"
                  }`}
                >
                  {documents.idPhoto ? "Uploaded" : "Missing"}
                </span>
              </div>
            </div>
          )}
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
        {/* FOOTER */}
        {status !== "Approved" && (
          <div className="app-modal-footer">
            <button
              className="btn btn-outline-danger"
              onClick={() => updateStatus("Rejected")}
            >
              Reject
            </button>

            <button
              className="btn btn-primary"
              onClick={() => updateStatus("Approved")}
            >
              Approve Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
