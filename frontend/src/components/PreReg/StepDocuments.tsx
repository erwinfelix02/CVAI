import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import type { DocumentsState } from "../../pages/PreReg/StudentPreRegistrationPage";
import DocumentUploadRow from "./DocumentUploadRow";

type Errors = Partial<Record<keyof DocumentsState, string>>;
type Touched = Partial<Record<keyof DocumentsState, boolean>>;

export default function StepDocuments({
  value,
  onChange,
  submitted,
  errors: externalErrors,
}: {
  value: DocumentsState;
  onChange: (v: DocumentsState) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const [localErrors, setLocalErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const validateAll = (v: DocumentsState) => {
    const next: Errors = {};
    if (!v.birthCert) next.birthCert = "This document is required.";
    if (!v.form137) next.form137 = "This document is required.";
    if (!v.goodMoral) next.goodMoral = "This document is required.";
    if (!v.idPhoto) next.idPhoto = "This document is required.";
    setLocalErrors(next);
    return next;
  };

  useEffect(() => {
    if (submitted) validateAll(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const markTouched = (k: keyof DocumentsState) =>
    setTouched((prev) => ({ ...prev, [k]: true }));

  const set = (k: keyof DocumentsState, f: File | null) => {
    const nextValue = { ...value, [k]: f };
    onChange(nextValue);

    // validate while fixing (same behavior as other steps)
    if (submitted || touched[k]) validateAll(nextValue);
  };

  // ✅ IMPORTANT: only show errors when submitted or touched
  const showError = (k: keyof DocumentsState) => submitted || touched[k];

  const getError = (k: keyof DocumentsState) => {
    if (!showError(k)) return "";
    return localErrors[k] || externalErrors[k] || "";
  };

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon" aria-hidden="true">
            <Upload size={18} />
          </span>
          <h4 className="fw-bold mb-0">Required Documents</h4>
        </div>
        <span className="chip chip-muted">PDF files only</span>
      </div>

      <p className="text-muted mb-4">
        Upload the following documents in <strong>PDF format only</strong>.
      </p>

      <div className="d-flex flex-column gap-3">
        <DocumentUploadRow
          title="Birth Certificate"
          file={value.birthCert}
          accept="application/pdf"
          onChange={(f) => set("birthCert", f)}
          onTouched={() => markTouched("birthCert")}
          error={getError("birthCert")}
        />

        <DocumentUploadRow
          title="Form 137 / Transcript of Records"
          file={value.form137}
          accept="application/pdf"
          onChange={(f) => set("form137", f)}
          onTouched={() => markTouched("form137")}
          error={getError("form137")}
        />

        <DocumentUploadRow
          title="Good Moral Certificate"
          file={value.goodMoral}
          accept="application/pdf"
          onChange={(f) => set("goodMoral", f)}
          onTouched={() => markTouched("goodMoral")}
          error={getError("goodMoral")}
        />

        <DocumentUploadRow
          title="2x2 ID Photo"
          file={value.idPhoto}
          accept="application/pdf"
          onChange={(f) => set("idPhoto", f)}
          onTouched={() => markTouched("idPhoto")}
          error={getError("idPhoto")}
        />
      </div>
    </div>
  );
}
