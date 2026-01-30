import { useRef } from "react";
import { Camera } from "lucide-react";

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
}: {
  fullName: string;
  subtitle: string;
  tags: string[];

  editable?: boolean;
  avatarUrl?: string;
  onChangeAvatar?: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  function pickFile() {
    fileRef.current?.click();
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // optional: basic image type check
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      onChangeAvatar?.(dataUrl);
    };
    reader.readAsDataURL(file);

    // allow re-pick same file later
    e.target.value = "";
  }

  const hasAvatar = Boolean(avatarUrl);

  return (
    <div className="card shadow-sm border-1 profile-hero">
      <div className="profile-hero__banner" />

      <div className="card-body profile-hero__body">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3 gap-md-4">
          {/* Avatar */}
          <div className="profile-hero__avatar profile-hero__avatar--img">
            {hasAvatar ? (
              <img src={avatarUrl} alt="Profile" className="profile-hero__avatar-img" />
            ) : (
              <span>{initials(fullName)}</span>
            )}

            {editable && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-light border profile-hero__avatar-btn"
                  onClick={pickFile}
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={onPick}
                />
              </>
            )}
          </div>

          {/* Text (NOT editable) */}
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
  );
}
