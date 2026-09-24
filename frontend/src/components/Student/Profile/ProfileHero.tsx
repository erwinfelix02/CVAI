// ✅ src/components/Student/Profile/ProfileHero.tsx

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, AlertTriangle } from "lucide-react";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function ProfileHero({
  fullName,
  subtitle,
  tags,
  editable = false,
  avatarUrl,
  onChangeAvatar,
  onRemoveAvatar,
}: {
  fullName: string;
  subtitle: string;
  tags: string[];
  editable?: boolean;
  avatarUrl?: string;
  onChangeAvatar?: (file: File, previewUrl: string) => void;
  onRemoveAvatar?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  function pickFile() {
    fileRef.current?.click();
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      onChangeAvatar?.(file, previewUrl);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  const resolvedAvatarUrl = avatarUrl
    ? avatarUrl.startsWith("data:") || avatarUrl.startsWith("blob:") || avatarUrl.startsWith("http")
      ? avatarUrl
      : `http://localhost:5000${avatarUrl}`
    : "";

  const hasAvatar = Boolean(resolvedAvatarUrl);

  return (
    <>
      <div className="card shadow-sm border-1 profile-hero">
        <div className="profile-hero__banner" />

        <div className="card-body profile-hero__body">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3 gap-md-4">
            {/* Avatar Container */}
            <div className="profile-hero__avatar profile-hero__avatar--img position-relative">
              {hasAvatar ? (
                <img
                  src={resolvedAvatarUrl}
                  alt="Profile Avatar"
                  className="profile-hero__avatar-img"
                />
              ) : (
                <span>{initials(fullName)}</span>
              )}

              {editable && (
                <>
                  {/* 🟢 Clean Button Group Container neatly nested inside the bottom-right corner */}
                  <div 
                    className="position-absolute d-flex align-items-center gap-1 shadow-sm rounded-pill bg-white p-1 border"
                    style={{ bottom: "4px", right: "4px", zIndex: 3 }}
                  >
                    {/* Upload Camera Button */}
                    <button
                      type="button"
                      className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-dark border-0"
                      onClick={pickFile}
                      disabled={isUploading}
                      title="Upload New Profile Picture"
                      style={{ width: "32px", height: "32px" }}
                    >
                      {isUploading ? (
                        <Loader2 size={15} className="spinner-border spinner-border-sm" />
                      ) : (
                        <Camera size={15} />
                      )}
                    </button>

                    {/* Remove Trash Button (Only shown if avatar exists) */}
                    {hasAvatar && onRemoveAvatar && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-danger border-0"
                        onClick={() => setConfirmRemoveOpen(true)}
                        title="Remove Profile Picture"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="d-none"
                    onChange={onPick}
                  />
                </>
              )}
            </div>

            {/* Text Details */}
            <div className="text-center text-md-start flex-grow-1">
              <h3 className="fw-bold mb-1">{fullName}</h3>
              <p className="text-muted mb-2">{subtitle}</p>

              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                {tags.map((t) => (
                  <span key={t} className="badge rounded-pill text-bg-light border">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="d-none d-lg-block" style={{ width: 12 }} />
          </div>
        </div>
      </div>

      {/* REMOVE AVATAR CONFIRMATION MODAL */}
      {confirmRemoveOpen && (
        <div
          className="modal-backdrop fade show"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        >
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "transparent" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmRemoveOpen(false);
            }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
              <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center bg-white">
                
                {/* Warning Icon Box */}
                <div 
                  className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: "64px", height: "64px", backgroundColor: "#fdf8e2" }}
                >
                  <AlertTriangle size={30} style={{ color: "#f59e0b" }} />
                </div>

                {/* Title */}
                <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.25rem" }}>
                  Remove Profile Picture?
                </h4>

                {/* Message */}
                <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.5" }}>
                  Are you sure you want to remove your profile picture? This will reset it to your initials.
                </p>

                {/* Action Buttons */}
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary py-2 px-3 rounded-3 fw-medium flex-grow-1 shadow-none"
                    onClick={() => setConfirmRemoveOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn py-2 px-3 rounded-3 fw-medium flex-grow-1 text-white shadow-none"
                    style={{ backgroundColor: "#dc2626", border: "none" }}
                    onClick={() => {
                      setConfirmRemoveOpen(false);
                      onRemoveAvatar?.();
                    }}
                  >
                    Yes, Remove
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}