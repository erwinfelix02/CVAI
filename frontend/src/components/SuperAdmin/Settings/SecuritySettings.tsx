import { Save, TriangleAlert, X, Pencil, Ban, AlertTriangle } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import AuthAlert from "../../Authentication/AuthAlert";

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  requireEmailVerification: boolean;
};

type SecuritySettingsProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

/* ================= CLEAN TOKEN GETTER ================= */
function getToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
  if (token && token !== "null" && token !== "undefined") return token;

  const authRaw = localStorage.getItem("auth") || localStorage.getItem("user");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      return parsed?.token || parsed?.accessToken || parsed?.data?.token || null;
    } catch {
      return null;
    }
  }
  return null;
}

/* ================= COMPONENT ================= */
export default function SecuritySettings({ onDirtyChange }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showAlert, setShowAlert] = useState(false);

  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);

  const [originalSettings, setOriginalSettings] = useState<SecuritySettingsDTO | null>(null);

  const show = (msg: string, type: "success" | "error") => {
    setShowAlert(false);

    setTimeout(() => {
      setAlertMessage(msg);
      setAlertType(type);
      setShowAlert(true);
    }, 50);

    setTimeout(() => setShowAlert(false), 3000);
  };

  // Check if form values differ from initial settings
  const isUnchanged = useMemo(() => {
    if (!originalSettings) return true;
    return (
      requireEmailVerification === originalSettings.requireEmailVerification &&
      sessionTimeoutMinutes === originalSettings.sessionTimeoutMinutes &&
      maxLoginAttempts === originalSettings.maxLoginAttempts
    );
  }, [
    requireEmailVerification,
    sessionTimeoutMinutes,
    maxLoginAttempts,
    originalSettings,
  ]);

  // Notify parent component (SettingsPage) when unsaved changes exist
  useEffect(() => {
    onDirtyChange?.(isEditing && !isUnchanged);
  }, [isEditing, isUnchanged, onDirtyChange]);

  /* ================= LOAD SETTINGS ================= */
  const loadSettings = useCallback(async () => {
    setError(null);
    setLoading(true);

    const token = getToken();
    if (!token) {
      setError("No session token found. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/security-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load security settings (${res.status})`);
      }

      const s: SecuritySettingsDTO = await res.json();

      const loadedSettings = {
        requireEmailVerification: !!s.requireEmailVerification,
        sessionTimeoutMinutes: Number(s.sessionTimeoutMinutes ?? 30),
        maxLoginAttempts: Number(s.maxLoginAttempts ?? 5),
      };

      setRequireEmailVerification(loadedSettings.requireEmailVerification);
      setSessionTimeoutMinutes(loadedSettings.sessionTimeoutMinutes);
      setMaxLoginAttempts(loadedSettings.maxLoginAttempts);
      setOriginalSettings(loadedSettings);
    } catch (e) {
      console.error(e);
      setError("Failed to load security settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Keyboard Escape listener for open modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        if (confirmSaveOpen) setConfirmSaveOpen(false);
        if (confirmDiscardOpen) setConfirmDiscardOpen(false);
      }
    };

    if (confirmSaveOpen || confirmDiscardOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [confirmSaveOpen, confirmDiscardOpen, saving]);

  /* ================= SAVE SETTINGS ================= */
  const save = async () => {
    setSaving(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError("No session token found. Please sign in again.");
      setSaving(false);
      setConfirmSaveOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/security-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requireEmailVerification,
          sessionTimeoutMinutes,
          maxLoginAttempts,
        }),
      });

      if (res.status === 401) {
        setError("Session expired. Please sign in again.");
        setConfirmSaveOpen(false);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to save security settings (${res.status})`);
      }

      const updatedSettings = {
        requireEmailVerification,
        sessionTimeoutMinutes,
        maxLoginAttempts,
      };

      setOriginalSettings(updatedSettings);
      setConfirmSaveOpen(false);
      setIsEditing(false);
      show("Security settings saved!", "success");
    } catch (e) {
      console.error(e);
      setError("Failed to save security settings.");
      show("Failed to save security settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAskSave = () => {
    if (isUnchanged) {
      show("No changes made to save.", "error");
      return;
    }
    setConfirmSaveOpen(true);
  };

  const handleCloseConfirm = () => {
    if (saving) return;
    setConfirmSaveOpen(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (saving) return;

    if (!isUnchanged) {
      setConfirmDiscardOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmDiscardChanges = () => {
    if (originalSettings) {
      setRequireEmailVerification(originalSettings.requireEmailVerification);
      setSessionTimeoutMinutes(originalSettings.sessionTimeoutMinutes);
      setMaxLoginAttempts(originalSettings.maxLoginAttempts);
    }
    setIsEditing(false);
    setConfirmDiscardOpen(false);
  };

  /* ================= RENDER ================= */
  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={showAlert}
        loading={saving}
      />

      <div className="card superadmin-settings-card shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-1">Security Settings</h3>
          <p className="text-muted mb-4">
            Configure security and authentication settings
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <>
              <div className="superadmin-settings-row mb-3">
                <div className="min-w-0">
                  <div className="fw-semibold">Require Email Verification</div>
                  <div className="text-muted">
                    Users must verify their email before accessing the platform
                  </div>
                </div>

                <div className="superadmin-switch-wrap">
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input superadmin-switch"
                      type="checkbox"
                      checked={requireEmailVerification}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setRequireEmailVerification(e.target.checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Session Timeout (minutes)</label>
                  <input
                    className="form-control"
                    type="number"
                    min={1}
                    max={1440}
                    value={sessionTimeoutMinutes}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setSessionTimeoutMinutes(Number(e.target.value))
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Max Login Attempts</label>
                  <input
                    className="form-control"
                    type="number"
                    min={1}
                    max={20}
                    value={maxLoginAttempts}
                    disabled={!isEditing}
                    onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4 d-flex flex-wrap gap-2">
                {!isEditing ? (
                  <button
                    className="btn btn-primary superadmin-settings-savebtn"
                    onClick={handleEdit}
                  >
                    <Pencil size={18} className="me-2" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary superadmin-settings-savebtn"
                      onClick={handleAskSave}
                      disabled={saving || isUnchanged}
                    >
                      <Save size={18} className="me-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      className="btn btn-light border"
                      onClick={handleCancelClick}
                      disabled={saving}
                    >
                      <Ban size={18} className="me-2" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SAVE CONFIRMATION MODAL */}
      {confirmSaveOpen && (
        <div
          className="superadmin-settings-confirm-backdrop"
          onClick={handleCloseConfirm}
        >
          <div
            className="superadmin-settings-confirm-modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="superadmin-settings-confirm-close"
              onClick={handleCloseConfirm}
              disabled={saving}
            >
              <X size={18} />
            </button>

            <div className="superadmin-settings-confirm-icon">
              <TriangleAlert size={22} />
            </div>

            <h5 className="fw-bold mb-2 text-center">Confirm Save</h5>

            <p className="text-muted text-center mb-0">
              Are you sure you want to save the changes to security settings?
            </p>

            <div className="superadmin-settings-confirm-actions mt-3">
              <button
                type="button"
                className="btn btn-light border"
                onClick={handleCloseConfirm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={save}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD / EXIT CONFIRMATION MODAL */}
      {confirmDiscardOpen && (
        <div
          className="superadmin-settings-confirm-backdrop"
          onClick={() => !saving && setConfirmDiscardOpen(false)}
        >
          <div
            className="superadmin-settings-confirm-modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="superadmin-settings-confirm-close"
              onClick={() => setConfirmDiscardOpen(false)}
              disabled={saving}
            >
              <X size={18} />
            </button>

            <div className="superadmin-settings-confirm-icon bg-warning-subtle text-warning">
              <AlertTriangle size={22} />
            </div>

            <h5 className="fw-bold mb-2 text-center">Discard changes?</h5>

            <p className="text-muted text-center mb-0">
              You have unsaved edits in security settings. Canceling now will discard your changes.
            </p>

            <div className="superadmin-settings-confirm-actions mt-3">
              <button
                type="button"
                className="btn btn-light border"
                onClick={() => setConfirmDiscardOpen(false)}
                disabled={saving}
              >
                Keep Editing
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDiscardChanges}
                disabled={saving}
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}