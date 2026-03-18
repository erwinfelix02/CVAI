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
          : optional
            ? "chip-muted"
            : "chip-muted"
      }`}
      onClick={ok ? onClick : undefined}
      disabled={!ok}
    >
      {ok ? <BadgeCheck size={16} /> : <BadgeX size={16} />}
      {label}: {text}
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
}: {
  personal: PersonalInfo;
  academic: AcademicInfo;
  docs: DocumentsState;
}) {
  const fullName = `${personal.firstName} ${personal.middleName || ""} ${
    personal.lastName
  }`
    .replace(/\s+/g, " ")
    .trim();

  const formattedBirthDate = personal.birthDate
    ? new Date(personal.birthDate).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (!previewFile) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewFile(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [previewFile]);

  const docList = [
    { label: "Birth Certificate", file: docs.birthCert, optional: false },
    { label: "Good Moral Certificate", file: docs.goodMoral, optional: true },
    { label: "2x2 ID Photo", file: docs.idPhoto, optional: false },
  ];

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon">
            <Paperclip size={18} />
          </span>
          <h4 className="fw-bold mb-0">Review Your Application</h4>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <User size={16} />
              Personal Information
            </div>

            <div className="small prereg-review-list d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <User size={14} /> {fullName}
              </div>

              <div className="d-flex align-items-center gap-2">
                <Mail size={14} /> {personal.email}
              </div>

              <div className="d-flex align-items-center gap-2">
                <Phone size={14} /> {personal.phone}
              </div>

              <div className="d-flex align-items-center gap-2">
                <Calendar size={14} /> {formattedBirthDate}
              </div>

              <div className="d-flex align-items-center gap-2">
                <VenusAndMars size={14} /> {personal.gender}
              </div>

              <div className="d-flex align-items-center gap-2">
                <MapPin size={14} /> {personal.address}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <GraduationCap size={16} />
              Academic Information
            </div>

            <div className="small prereg-review-list d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <UserCheck size={14} />
                Applicant Type: {academic.applicantType}
              </div>

              <div className="d-flex align-items-center gap-2">
                <BookOpen size={14} />
                Course: {academic.course}
              </div>

              {academic.applicantType === "Transferee" && (
                <div className="d-flex align-items-center gap-2">
                  <School size={14} />
                  Previous School: {academic.previousSchool}
                </div>
              )}
            </div>
          </div>
        </div>

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
                  onClick={() => setPreviewFile(d.file ?? null)}
                />
              ))}
            </div>

            <div className="small text-muted mt-3">
              Good Moral Certificate is optional and may be submitted later if
              not yet available.
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="alert alert-secondary mb-0">
            By submitting this application, you confirm that all information
            provided is accurate and complete.
          </div>
        </div>
      </div>

      {previewFile && previewUrl && (
        <div
          className="doc-preview-overlay"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="doc-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="doc-preview-close"
              onClick={() => setPreviewFile(null)}
            >
              ✕
            </button>

            {previewFile.type === "application/pdf" ? (
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="doc-preview-frame"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="doc-preview-image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}