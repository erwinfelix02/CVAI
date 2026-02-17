import { useRef, useState } from "react";
import { UploadCloud, Trash2, FileText } from "lucide-react";
import AuthAlert from "../Authentication/AuthAlert"; // adjust path if needed

export default function DocumentUploadRow({
  title,
  file,
  accept = "application/pdf",
  onChange,
}: {
  title: string;
  file?: File | null;
  accept?: string;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (msg: string, type: "error" | "success") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);

    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      onChange(null);
      return;
    }

    // ✅ Strict PDF validation
    if (selectedFile.type !== "application/pdf") {
      inputRef.current!.value = "";
      showAlert("Only PDF files are allowed.", "error");
      return;
    }

    // Optional: size validation (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      inputRef.current!.value = "";
      showAlert("File must be less than 5MB.", "error");
      return;
    }

    onChange(selectedFile);
    showAlert("PDF uploaded successfully.", "success");
  };

  return (
    <div className="prereg-doc-row">
      <div className="prereg-doc-left">
        <div className="prereg-doc-title">
          <FileText size={18} className="prereg-doc-ico" />
          {title}
        </div>

        <div className="prereg-doc-sub">
          {file ? `Selected: ${file.name}` : "No file selected (PDF only)"}
        </div>

        {/* ✅ Styled Alert */}
        <AuthAlert
          message={alertMessage}
          type={alertType}
          visible={alertVisible}
        />
      </div>

      <div className="prereg-doc-actions">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="d-none"
          onChange={(e) =>
            handleFileChange(e.target.files?.[0] ?? null)
          }
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
