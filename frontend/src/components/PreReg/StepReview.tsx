import {
  BadgeCheck,
  BadgeX,
  Paperclip,
  User,
  Mail,
  Phone,
  Calendar,
  VenusAndMars,
  MapPin,
  GraduationCap,
  BookOpen,
  School,
  UserCheck,
  FileText,
  Check,
  X,
  Info,
} from "lucide-react";

import type {
  AcademicInfo,
  DocumentsState,
  PersonalInfo,
} from "../../pages/PreReg/StudentPreRegistrationPage";

import { useState, useEffect } from "react";

/* ========================= */
/* Document Chip */
/* ========================= */

function DocChip({
  label,
  ok,
  optional = false,
  onClick,
}: {
  label: string;
  ok: boolean;
  optional?: boolean;
  onClick?: () => void;
}) {
  const text = ok ? "Uploaded" : optional ? "Not uploaded" : "Missing";

  return (
    <button
      type="button"
      className={`chip ${
        ok
          ? "chip-success chip-clickable"
          : "chip-muted"
      }`}
      onClick={ok ? onClick : undefined}
      disabled={!ok}
    >
      {ok ? (
        <BadgeCheck size={15} />
      ) : (
        <BadgeX size={15} />
      )}

      <span>
        {label}: {text}
      </span>
    </button>
  );
}

/* ========================= */
/* Main Component */
/* ========================= */

export default function StepReview({
  personal,
  academic,
  docs,
  agreedToTerms,
  onTermsChange,
}: {
  personal: PersonalInfo;
  academic: AcademicInfo;
  docs: DocumentsState;

  /* Terms & Conditions state */
  agreedToTerms: boolean;
  onTermsChange: (agreed: boolean) => void;
}) {
  const fullName = `${personal.firstName} ${
    personal.middleName || ""
  } ${personal.lastName}`
    .replace(/\s+/g, " ")
    .trim();

  const formattedBirthDate = personal.birthDate
    ? new Date(personal.birthDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  /* ========================= */
  /* Document Preview */
  /* ========================= */

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* ========================= */
  /* Terms Modal */
  /* ========================= */

  const [showTermsModal, setShowTermsModal] = useState(false);

  /* ========================= */
  /* Create Preview URL */
  /* ========================= */

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [previewFile]);

  /* ========================= */
  /* Lock Body Scroll */
  /* ========================= */

  useEffect(() => {
    if (!previewFile && !showTermsModal) {
      document.body.style.overflow = "";
      return;
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewFile) {
          setPreviewFile(null);
        }

        if (showTermsModal) {
          setShowTermsModal(false);
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [previewFile, showTermsModal]);

  /* ========================= */
  /* Documents */
  /* ========================= */

  const docList = [
    {
      label: "Birth Certificate",
      file: docs.birthCert,
      optional: false,
    },
    {
      label: "Good Moral Certificate",
      file: docs.goodMoral,
      optional: true,
    },
    {
      label: "2x2 ID Photo",
      file: docs.idPhoto,
      optional: false,
    },
  ];

  /* ========================= */
  /* Open Terms */
  /* ========================= */

  function openTerms() {
    setShowTermsModal(true);
  }

  /* ========================= */
  /* Agree */
  /* ========================= */

  function handleAgree() {
    onTermsChange(true);
    setShowTermsModal(false);
  }

  /* ========================= */
  /* Disagree */
  /* ========================= */

  function handleDisagree() {
    onTermsChange(false);
    setShowTermsModal(false);
  }

  return (
    <div className="prereg-review">
      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Review Your Application
        </h2>

        <p className="text-muted mb-0">
          Please review all information before submitting your
          application.
        </p>
      </div>

      {/* ========================= */}
      {/* INFORMATION CARDS */}
      {/* ========================= */}

      <div className="row g-3">

        {/* ========================= */}
        {/* PERSONAL INFORMATION */}
        {/* ========================= */}

        <div className="col-12 col-lg-6">
          <div className="prereg-review-card h-100">
            <div className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <User size={16} />
              Personal Information
            </div>

            <div className="small prereg-review-list d-flex flex-column gap-2">

              <div className="d-flex align-items-start gap-2">
                <User size={14} className="mt-1 flex-shrink-0" />
                <span>{fullName}</span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <Mail size={14} className="mt-1 flex-shrink-0" />
                <span>{personal.email}</span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <Phone size={14} className="mt-1 flex-shrink-0" />
                <span>{personal.phone}</span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <Calendar size={14} className="mt-1 flex-shrink-0" />
                <span>{formattedBirthDate}</span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <VenusAndMars
                  size={14}
                  className="mt-1 flex-shrink-0"
                />
                <span>{personal.gender}</span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <MapPin
                  size={14}
                  className="mt-1 flex-shrink-0"
                />
                <span>{personal.address}</span>
              </div>

            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* ACADEMIC INFORMATION */}
        {/* ========================= */}

        <div className="col-12 col-lg-6">
          <div className="prereg-review-card h-100">

            <div className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <GraduationCap size={16} />
              Academic Information
            </div>

            <div className="small prereg-review-list d-flex flex-column gap-2">

              <div className="d-flex align-items-start gap-2">
                <UserCheck
                  size={14}
                  className="mt-1 flex-shrink-0"
                />

                <span>
                  <strong>Applicant Type:</strong>{" "}
                  {academic.applicantType}
                </span>
              </div>

              <div className="d-flex align-items-start gap-2">
                <BookOpen
                  size={14}
                  className="mt-1 flex-shrink-0"
                />

                <span>
                  <strong>Course:</strong>{" "}
                  {academic.course}
                </span>
              </div>

              {academic.applicantType === "Transferee" && (
                <div className="d-flex align-items-start gap-2">
                  <School
                    size={14}
                    className="mt-1 flex-shrink-0"
                  />

                  <span>
                    <strong>Previous School:</strong>{" "}
                    {academic.previousSchool}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* DOCUMENTS */}
        {/* ========================= */}

        <div className="col-12">
          <div className="prereg-review-card">

            <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
              <Paperclip size={16} />
              Documents
            </div>

            <div className="d-flex flex-wrap gap-2">

              {docList.map((d) => (
                <DocChip
                  key={d.label}
                  label={d.label}
                  ok={!!d.file}
                  optional={d.optional}
                  onClick={() =>
                    setPreviewFile(d.file ?? null)
                  }
                />
              ))}

            </div>

            <div className="small text-muted mt-3">
              Good Moral Certificate is optional and may be
              submitted later if not yet available.
            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* TERMS & CONDITIONS */}
        {/* ========================= */}

        <div className="col-12">
          <div
            className={`prereg-terms-card ${
              agreedToTerms
                ? "prereg-terms-agreed"
                : ""
            }`}
          >

            <div className="prereg-terms-check-row">

              {/* Custom Checkbox */}

              <button
                type="button"
                className={`prereg-terms-checkbox ${
                  agreedToTerms
                    ? "checked"
                    : ""
                }`}
                onClick={openTerms}
                aria-label={
                  agreedToTerms
                    ? "Terms and Conditions accepted"
                    : "Open Terms and Conditions"
                }
              >
                {agreedToTerms && (
                  <Check size={17} strokeWidth={3} />
                )}
              </button>

              {/* Terms Text */}
              <div className="prereg-terms-text">
                <div className="fw-semibold">
                  Terms and Conditions
                </div>

                <div className="small text-muted">
                  I've read, understood, and agree to the{" "}
                  <button
                    type="button"
                    className="prereg-terms-inline-link"
                    onClick={openTerms}
                  >
                    Terms and Conditions
                  </button>{" "}
                  of the application.
                </div>
              </div>

              {/* Status */}

              <div className="prereg-terms-status">

                {agreedToTerms ? (
                  <span className="terms-status-agreed">
                    <BadgeCheck size={16} />
                    Agreed
                  </span>
                ) : (
                  <span className="terms-status-required">
                    Required
                  </span>
                )}

              </div>

            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* CONFIRMATION */}
        {/* ========================= */}

        <div className="col-12">

          <div className="alert alert-secondary mb-0 d-flex align-items-start gap-2">

            <Info
              size={17}
              className="mt-1 flex-shrink-0"
            />

            <span>
              By submitting this application, you confirm
              that all information provided is accurate and
              complete.
            </span>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* DOCUMENT PREVIEW MODAL */}
      {/* ========================= */}

      {previewFile && previewUrl && (
        <div
          className="doc-preview-overlay"
          onClick={() => setPreviewFile(null)}
        >

          <div
            className="doc-preview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="doc-preview-close"
              onClick={() =>
                setPreviewFile(null)
              }
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            {previewFile.type ===
            "application/pdf" ? (
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="doc-preview-frame"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Document Preview"
                className="doc-preview-image"
              />
            )}

          </div>
        </div>
      )}

      {/* ========================= */}
      {/* TERMS & CONDITIONS MODAL */}
      {/* ========================= */}

      {showTermsModal && (
        <div
          className="prereg-terms-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowTermsModal(false);
            }
          }}
        >

          <div
            className="prereg-terms-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="prereg-terms-modal-header">

              <div className="d-flex align-items-center gap-2">
                <div className="prereg-terms-icon">
                  <FileText size={20} />
                </div>

                <div>
                  <h4
                    id="terms-title"
                    className="mb-0 fw-bold"
                  >
                    Terms and Conditions
                  </h4>

                  <small className="text-muted">
                    Student Pre-Registration
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="app-icon-btn app-icon-btn-sm"
                onClick={() =>
                  setShowTermsModal(false)
                }
                aria-label="Close"
                title="Close"
              >
                <X size={18} />
              </button>

            </div>

            {/* Modal Body */}

            <div className="prereg-terms-modal-body">

              <section>
                <h6 className="fw-bold">
                  1. Accuracy of Information
                </h6>

                <p>
                  I confirm that all information I provide
                  in this pre-registration application is
                  true, complete, and accurate to the best
                  of my knowledge.
                </p>
              </section>

              <section>
                <h6 className="fw-bold">
                  2. Document Submission
                </h6>

                <p>
                  I understand that the documents submitted
                  with this application must be authentic,
                  valid, and belong to me. The school may
                  request additional documents when
                  necessary.
                </p>
              </section>

              <section>
                <h6 className="fw-bold">
                  3. Verification
                </h6>

                <p>
                  I understand that my application and
                  submitted documents may be reviewed and
                  verified by authorized school personnel.
                </p>
              </section>

              <section>
                <h6 className="fw-bold">
                  4. Application Processing
                </h6>

                <p>
                  I understand that submitting this
                  application does not automatically guarantee
                  enrollment or admission. My application is
                  subject to review and approval.
                </p>
              </section>

              <section>
                <h6 className="fw-bold">
                  5. Privacy and Data Use
                </h6>

                <p>
                  I understand that the personal information
                  and documents I provide may be collected,
                  stored, and processed for legitimate
                  enrollment and academic administration
                  purposes in accordance with applicable
                  privacy policies and regulations.
                </p>
              </section>

              <section>
                <h6 className="fw-bold">
                  6. Responsibility
                </h6>

                <p className="mb-0">
                  I accept responsibility for the information
                  and documents submitted through this
                  application. Providing false or misleading
                  information may result in rejection or
                  cancellation of the application.
                </p>
              </section>

            </div>

            {/* Modal Footer */}

            <div className="prereg-terms-modal-footer">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleDisagree}
              >
                <X size={16} />
                Disagree
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAgree}
              >
                <Check size={16} />
                I Agree
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
