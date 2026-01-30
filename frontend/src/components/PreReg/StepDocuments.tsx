import { Upload } from "lucide-react";
import type { DocumentsState } from "../../pages/PreReg/StudentPreRegistrationPage";
import DocumentUploadRow from "./DocumentUploadRow";

type Errors = Partial<Record<keyof DocumentsState, string>>;

export default function StepDocuments({
  value,
  onChange,
  submitted,
  errors,
}: {
  value: DocumentsState;
  onChange: (v: DocumentsState) => void;
  submitted: boolean;
  errors: Errors;
}) {
  const set = (k: keyof DocumentsState, f: File | null) =>
    onChange({ ...value, [k]: f });

  const getError = (k: keyof DocumentsState) =>
    submitted ? errors[k] : undefined;

  return (
    <div className="prereg-step">
      <div className="prereg-step-header">
        <div className="d-flex align-items-center gap-2">
          <span className="prereg-step-header-icon" aria-hidden="true">
            <Upload size={18} />
          </span>
          <h4 className="fw-bold mb-0">Required Documents</h4>
        </div>

        {/* 🔥 updated text */}
        <span className="chip chip-muted">PDF files only</span>
      </div>

      <p className="text-muted mb-4">
        Upload the following documents in <strong>PDF format only</strong>.
        Physical copies may be submitted to the Registrar&apos;s Office if
        preferred.
      </p>

      <div className="d-flex flex-column gap-3">
        <DocumentUploadRow
          title="Birth Certificate"
          file={value.birthCert}
          accept="application/pdf"          // ✅ PDF only
          onChange={(f) => set("birthCert", f)}
          error={getError("birthCert")}
        />

        <DocumentUploadRow
          title="Form 137 / Transcript of Records"
          file={value.form137}
          accept="application/pdf"          // ✅ PDF only
          onChange={(f) => set("form137", f)}
          error={getError("form137")}
        />

        <DocumentUploadRow
          title="Good Moral Certificate"
          file={value.goodMoral}
          accept="application/pdf"          // ✅ PDF only
          onChange={(f) => set("goodMoral", f)}
          error={getError("goodMoral")}
        />

        <DocumentUploadRow
          title="2x2 ID Photo"
          file={value.idPhoto}
          accept="application/pdf"          // ✅ PDF only
          onChange={(f) => set("idPhoto", f)}
          error={getError("idPhoto")}
        />
      </div>
    </div>
  );
}
