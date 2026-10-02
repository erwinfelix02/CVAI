import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import type { DocumentsState } from "../../pages/PreReg/StudentPreRegistrationPage";
import DocumentUploadRow from "./DocumentUploadRow";

type Errors = Partial<Record<keyof DocumentsState, string>>;
type Touched = Partial<Record<keyof DocumentsState, boolean>>;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
    if (!v.idPhoto) next.idPhoto = "This document is required.";

    setLocalErrors((prev) => ({
      ...prev,
      birthCert: next.birthCert || "",
      goodMoral: prev.goodMoral || "",
      idPhoto: next.idPhoto || "",
    }));

    return next;
  };

  useEffect(() => {
    if (submitted) validateAll(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const markTouched = (k: keyof DocumentsState) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
  };

  const setFile = (k: keyof DocumentsState, f: File | null) => {
    setTouched((prev) => ({ ...prev, [k]: true }));

    if (f) {
      if (f.type !== "application/pdf") {
        const nextValue = { ...value, [k]: null };
        onChange(nextValue);
        setLocalErrors((prev) => ({
          ...prev,
          [k]: "Only PDF files are allowed.",
        }));
        return;
      }

      if (f.size > MAX_FILE_SIZE) {
        const nextValue = { ...value, [k]: null };
        onChange(nextValue);
        setLocalErrors((prev) => ({
          ...prev,
          [k]: "File must not exceed 2MB.",
        }));
        return;
      }
    }

    const nextValue = { ...value, [k]: f };
    onChange(nextValue);

    setLocalErrors((prev) => ({
      ...prev,
      [k]: "",
    }));

    if (submitted || touched[k]) {
      validateAll(nextValue);
    }
  };

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
        <span className="chip chip-muted">PDF files only • Max 2MB each</span>
      </div>

      <p className="text-muted mb-4">
        Upload the following documents in <strong>PDF format only</strong>.
        Maximum of <strong> 2MB per file</strong>.
      </p>

      <div className="d-flex flex-column gap-3">
        <DocumentUploadRow
          title="Birth Certificate"
          file={value.birthCert}
          accept="application/pdf"
          onChange={(f) => setFile("birthCert", f)}
          onTouched={() => markTouched("birthCert")}
          error={getError("birthCert")}
          required
        />

        <DocumentUploadRow
          title="Good Moral Certificate"
          file={value.goodMoral}
          accept="application/pdf"
          onChange={(f) => setFile("goodMoral", f)}
          onTouched={() => markTouched("goodMoral")}
          error={getError("goodMoral")}
          required={false}
        />

        <DocumentUploadRow
          title="2x2 ID Photo"
          file={value.idPhoto}
          accept="application/pdf"
          onChange={(f) => setFile("idPhoto", f)}
          onTouched={() => markTouched("idPhoto")}
          error={getError("idPhoto")}
          required
        />
      </div>
    </div>
  );
}