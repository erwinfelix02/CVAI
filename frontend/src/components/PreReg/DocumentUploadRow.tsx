import { useRef, useState } from "react";
import { UploadCloud, Trash2, FileText } from "lucide-react";
import AuthAlert from "../Authentication/AuthAlert";

export default function DocumentUploadRow({
  title,
  file,
  accept = "application/pdf",
  onChange,
  error,
  onTouched, // ✅ NEW
}: {
  title: string;
  file?: File | null;
  accept?: string;
  onChange: (f: File | null) => void;
  error?: string;
  onTouched?: () => void; // ✅ NEW
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (msg: string, type: "error" | "success") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };

  const handleFileChange = (selectedFile: File | null) => {
    onTouched?.(); // ✅ mark touched on any attempt

    if (!selectedFile) {
      onChange(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      if (inputRef.current) inputRef.current.value = "";
      showAlert("Only PDF files are allowed.", "error");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      if (inputRef.current) inputRef.current.value = "";
      showAlert("File must be less than 5MB.", "error");
      return;
    }

    onChange(selectedFile);
    showAlert("PDF uploaded successfully.", "success");
  };

  return (
    <div className={`prereg-doc-row ${error ? "is-invalid" : ""}`}>
      <div className="prereg-doc-left">
        <div className={`prereg-doc-title ${error ? "text-danger fw-semibold" : ""}`}>
          <FileText size={18} className="prereg-doc-ico" />
          {title} <span className="text-danger">*</span>
        </div>

        <div className="prereg-doc-sub">
          {file ? `Selected: ${file.name}` : "No file selected (PDF only)"}
        </div>

        {error ? (
          <div className="text-danger" style={{ fontSize: 13, marginTop: 4 }}>
            {error}
          </div>
        ) : null}

        <AuthAlert message={alertMessage} type={alertType} visible={alertVisible} />
      </div>

      <div className="prereg-doc-actions">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="d-none"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          className="btn prereg-upload-btn"
          onClick={() => {
            onTouched?.(); // ✅ touched when clicking upload too
            inputRef.current?.click();
          }}
        >
          <UploadCloud size={18} />
          {file ? "Replace" : "Upload"}
        </button>

        {file && (
          <button
            type="button"
            className="btn prereg-remove-btn"
            onClick={() => {
              onTouched?.(); // ✅ touched on remove
              onChange(null);
            }}
          >
            <Trash2 size={18} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
