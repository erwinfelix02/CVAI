import {
  BadgeCheck,
  BadgeX,
  User,
  GraduationCap,
  Paperclip,
  Mail,
  Phone,
  Calendar,
  MapPin,
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
  onClick,
}: {
  label: string;
  ok: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`chip ${ok ? "chip-success chip-clickable" : "chip-muted"}`}
      onClick={ok ? onClick : undefined}
      disabled={!ok}
    >
      {ok ? <BadgeCheck size={16} /> : <BadgeX size={16} />}
      {label}: {ok ? "Uploaded" : "Missing"}
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

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* ========================= */
  /* Safe Object URL Handling */
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
  /* ESC + Scroll Lock */
  /* ========================= */

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
    { label: "Birth Certificate", file: docs.birthCert },
    { label: "Form 137 / Transcript of Records", file: docs.form137 },
    { label: "Good Moral Certificate", file: docs.goodMoral },
    { label: "2x2 ID Photo", file: docs.idPhoto },
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
        {/* PERSONAL */}
        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2">Personal Information</div>
            <div className="small prereg-review-list">
              <div>{fullName}</div>
              <div>{personal.email}</div>
              <div>{personal.phone}</div>
              <div>{personal.birthDate}</div>
              <div>{personal.gender}</div>
              <div>{personal.address}</div>
            </div>
          </div>
        </div>

        {/* ACADEMIC */}
        <div className="col-12 col-lg-6">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2">Academic Information</div>
            <div className="small prereg-review-list">
              <div>Course: {academic.course}</div>
              <div>Year Level: {academic.yearLevel}</div>
              <div>Transferee: {academic.transferee}</div>
            </div>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="col-12">
          <div className="prereg-review-card">
            <div className="fw-semibold mb-2">Documents</div>
            <div className="d-flex flex-wrap gap-2">
              {docList.map((d) => (
                <DocChip
                  key={d.label}
                  label={d.label}
                  ok={!!d.file}
                  onClick={() => setPreviewFile(d.file ?? null)}
                />
              ))}
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

      {/* ================= PDF / IMAGE PREVIEW ================= */}
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
