import { useRef } from "react";
import { UploadCloud, Trash2, FileText } from "lucide-react";

export default function DocumentUploadRow({
  title,
  file,
  accept = "image/*,application/pdf",
  onChange,
  error,
}: {
  title: string;
  file?: File | null;
  accept?: string;
  onChange: (f: File | null) => void;
  error?: string; // ✅ new
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={`prereg-doc-row ${error ? "is-invalid-row" : ""}`}>
      <div className="prereg-doc-left">
        <div className="prereg-doc-title">
          <FileText size={18} className="prereg-doc-ico" />
          {title}
        </div>

        <div className="prereg-doc-sub">
          {file ? `Selected: ${file.name}` : "No file selected"}
        </div>

        {/* ✅ error message (keeps alignment) */}
        <div className="invalid-feedback d-block mt-1">
          {error ? error : "\u00A0"}
        </div>
      </div>

      <div className="prereg-doc-actions">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="d-none"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          className="btn prereg-upload-btn"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={18} />
          {file ? "Replace" : "Upload"}
        </button>

        {file && (
          <button
            type="button"
            className="btn prereg-remove-btn"
            onClick={() => onChange(null)}
          >
            <Trash2 size={18} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
