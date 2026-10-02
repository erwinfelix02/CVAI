import { Save, TriangleAlert, X, Pencil, Ban, AlertTriangle, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import AuthAlert from "../../Authentication/AuthAlert";
import { API_BASE_URL } from "../../../config"; // 👈 Import config base URL

type SecuritySettingsDTO = {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  requireEmailVerification: boolean;
};

type SecuritySettingsProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

/* ================= CLEAN TOKEN GETTER & DECODER ================= */
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

function getAuthUserIdentifier(): { id?: string; email?: string } {
  const authRaw = localStorage.getItem("auth") || localStorage.getItem("user");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      const userObj = parsed?.user || parsed?.data?.user || parsed;
      if (userObj?._id || userObj?.id) return { id: userObj._id || userObj.id };
      if (userObj?.email) return { email: userObj.email };
    } catch {
      // fallback
    }
  }

  // Try parsing JWT payload if token exists
  const token = getToken();
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded?.id || decoded?._id) return { id: decoded.id || decoded._id };
      if (decoded?.email) return { email: decoded.email };
    } catch {
      // fallback
    }
  }

  return {};
}

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

  // General Security Fields
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [originalSettings, setOriginalSettings] = useState<SecuritySettingsDTO | null>(null);

  // Change Password Fields & State
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const show = (msg: string, type: "success" | "error") => {
    setShowAlert(false);
    setTimeout(() => {
      setAlertMessage(msg);
      setAlertType(type);
      setShowAlert(true);
    }, 50);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const isUnchanged = useMemo(() => {
    if (!originalSettings) return true;
    return (
      requireEmailVerification === originalSettings.requireEmailVerification &&
      sessionTimeoutMinutes === originalSettings.sessionTimeoutMinutes &&
      maxLoginAttempts === originalSettings.maxLoginAttempts
    );
  }, [requireEmailVerification, sessionTimeoutMinutes, maxLoginAttempts, originalSettings]);

  useEffect(() => {
    onDirtyChange?.(isEditing && !isUnchanged);
  }, [isEditing, isUnchanged, onDirtyChange]);

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
      const res = await fetch(`${API_BASE_URL}/security-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || !res.ok) {
        // Fallback default settings if unauthorized or error, hiding the error box
        const defaultSettings = { requireEmailVerification: true, sessionTimeoutMinutes: 30, maxLoginAttempts: 5 };
        setOriginalSettings(defaultSettings);
        setLoading(false);
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
      const res = await fetch(`${API_BASE_URL}/security-settings`, {
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

      if (!res.ok) throw new Error("Failed to save security settings");

      setOriginalSettings({ requireEmailVerification, sessionTimeoutMinutes, maxLoginAttempts });
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

  const handleUpdatePassword = async () => {
    if (!isPasswordUnlocked) {
      setIsPasswordUnlocked(true);
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      show("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword.length < 8) {
      show("New password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      show("New passwords do not match.", "error");
      return;
    }

    const token = getToken();
    if (!token) {
      show("No session token found.", "error");
      return;
    }

    const userInfo = getAuthUserIdentifier();

    setUpdatingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          ...userInfo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      show("Password successfully updated!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordUnlocked(false);
    } catch (e: any) {
      show(e.message || "Failed to update password.", "error");
    } finally {
      setUpdatingPassword(false);
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

  return (
    <>
      <AuthAlert message={alertMessage} type={alertType} visible={showAlert} loading={saving || updatingPassword} />

      <div className="card superadmin-settings-card shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <h3 className="fw-bold mb-1">Security Settings</h3>
          <p className="text-muted mb-4">Configure security and authentication settings</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <>
              <div className="superadmin-settings-row mb-3">
                <div className="min-w-0">
                  <div className="fw-semibold">Require Email Verification</div>
                  <div className="text-muted">Users must verify their email before accessing the platform</div>
                </div>
                <div className="superadmin-switch-wrap">
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input superadmin-switch"
                      type="checkbox"
                      checked={requireEmailVerification}
                      disabled={!isEditing}
                      onChange={(e) => setRequireEmailVerification(e.target.checked)}
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
                    onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
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
                  <button className="btn btn-primary superadmin-settings-savebtn" onClick={() => setIsEditing(true)}>
                    <Pencil size={18} className="me-2" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary superadmin-settings-savebtn"
                      onClick={() => setConfirmSaveOpen(true)}
                      disabled={saving || isUnchanged}
                    >
                      <Save size={18} className="me-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      className="btn btn-light border"
                      onClick={() => (!isUnchanged ? setConfirmDiscardOpen(true) : setIsEditing(false))}
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

      {/* CHANGE PASSWORD CARD */}
      <div className="card superadmin-settings-card shadow-sm border-0">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center mb-1">
            <div className="p-2 rounded bg-primary-subtle text-primary me-2">
              <KeyRound size={20} />
            </div>
            <h4 className="fw-bold mb-0">Change Password</h4>
          </div>
          <p className="text-muted mb-4">Use a strong password (min 8 characters).</p>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Current Password</label>
              <div className="input-group">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={currentPassword}
                  disabled={!isPasswordUnlocked}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={!isPasswordUnlocked}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="min 8 characters"
                  value={newPassword}
                  disabled={!isPasswordUnlocked}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={!isPasswordUnlocked}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="repeat new password"
                  value={confirmPassword}
                  disabled={!isPasswordUnlocked}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={!isPasswordUnlocked}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-muted small mb-3 d-flex align-items-center">
              <ShieldCheck size={16} className="me-1 text-secondary" />
              {!isPasswordUnlocked ? "Click Update Password to unlock the fields." : "Fields unlocked. Enter your new credentials."}
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary superadmin-settings-savebtn"
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
              >
                <KeyRound size={18} className="me-2" />
                {updatingPassword ? "Updating..." : isPasswordUnlocked ? "Save New Password" : "Update Password"}
              </button>

              {isPasswordUnlocked && (
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => {
                    setIsPasswordUnlocked(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={updatingPassword}
                >
                  <Ban size={18} className="me-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SAVE CONFIRMATION MODAL */}
      {confirmSaveOpen && (
        <div className="superadmin-settings-confirm-backdrop" onClick={() => !saving && setConfirmSaveOpen(false)}>
          <div className="superadmin-settings-confirm-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="superadmin-settings-confirm-close" onClick={() => setConfirmSaveOpen(false)} disabled={saving}>
              <X size={18} />
            </button>
            <div className="superadmin-settings-confirm-icon">
              <TriangleAlert size={22} />
            </div>
            <h5 className="fw-bold mb-2 text-center">Confirm Save</h5>
            <p className="text-muted text-center mb-0">Are you sure you want to save the changes to security settings?</p>
            <div className="superadmin-settings-confirm-actions mt-3">
              <button type="button" className="btn btn-light border" onClick={() => setConfirmSaveOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={save} disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD / EXIT CONFIRMATION MODAL */}
      {confirmDiscardOpen && (
        <div className="superadmin-settings-confirm-backdrop" onClick={() => !saving && setConfirmDiscardOpen(false)}>
          <div className="superadmin-settings-confirm-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="superadmin-settings-confirm-close" onClick={() => setConfirmDiscardOpen(false)} disabled={saving}>
              <X size={18} />
            </button>
            <div className="superadmin-settings-confirm-icon bg-warning-subtle text-warning">
              <AlertTriangle size={22} />
            </div>
            <h5 className="fw-bold mb-2 text-center">Discard changes?</h5>
            <p className="text-muted text-center mb-0">You have unsaved edits in security settings. Canceling now will discard your changes.</p>
            <div className="superadmin-settings-confirm-actions mt-3">
              <button type="button" className="btn btn-light border" onClick={() => setConfirmDiscardOpen(false)} disabled={saving}>
                Keep Editing
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDiscardChanges} disabled={saving}>
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}