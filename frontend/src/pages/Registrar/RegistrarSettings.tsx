// src/pages/Registrar/RegistrarSettings.tsx

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/registrar-settings.css";

import SettingsSectionCard from "../../components/Registrar/settings/SettingsSectionCard";
import SelectField from "../../components/Registrar/settings/fields/SelectField";
import NumberField from "../../components/Registrar/settings/fields/NumberField";
import SwitchField from "../../components/Registrar/settings/fields/SwitchField";
import ChangePasswordCard from "../../components/Registrar/settings/ChangePasswordCard";
import AuthAlert from "../../components/Authentication/AuthAlert";
import { getRegistrarByRole } from "../../api/userService";
import { API_BASE_URL } from "../../config";
import {
  Calendar,
  RefreshCw,
  Settings,
  TriangleAlert,
  AlertTriangle,
  X,
} from "lucide-react";

type FormState = {
  academicYear: string;
  semester: string;
  enrollmentOpen: boolean;
  maxStudentsPerSection: number;
  processingDays: number;
  autoApproveSimpleDocs: boolean;
};

type RegistrarAccount = {
  _id?: string;
  email?: string;
  user?: string;
  role?: string;
};

// Dynamically construct endpoints using config API_BASE_URL
const cleanBase = API_BASE_URL.replace(/\/+$/, "");
const API_URL = `${cleanBase}/registrar/settings`;

const DEFAULT_FORM: FormState = {
  academicYear: "2023-2024",
  semester: "2nd Semester",
  enrollmentOpen: true,
  maxStudentsPerSection: 45,
  processingDays: 5,
  autoApproveSimpleDocs: false,
};

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

const getAuthHeaders = (includeContentType = false): HeadersInit => {
  const token = localStorage.getItem("sessionToken");

  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function RegistrarSettings() {
  const yearOptions = useMemo(
    () => [
      { label: "2023-2024", value: "2023-2024" },
      { label: "2024-2025", value: "2024-2025" },
      { label: "2025-2026", value: "2025-2026" },
    ],
    [],
  );

  const semesterOptions = useMemo(
    () => [
      { label: "1st Semester", value: "1st Semester" },
      { label: "2nd Semester", value: "2nd Semester" },
      { label: "Summer", value: "Summer" },
    ],
    [],
  );

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<FormState>(DEFAULT_FORM);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Confirmation states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [registrarAccount, setRegistrarAccount] =
    useState<RegistrarAccount | null>(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const showAlert = (message: string, type: "success" | "error") => {
    setAnimateAlert(false);
    setTimeout(() => {
      setAlertMessage(message);
      setAlertType(type);
      setAnimateAlert(true);
    }, 50);
  };

  useEffect(() => {
    if (!animateAlert) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [animateAlert]);

  // Check if form or passwords were changed
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(form) !== JSON.stringify(savedForm) ||
      currentPassword !== "" ||
      newPassword !== "" ||
      confirmPassword !== ""
    );
  }, [form, savedForm, currentPassword, newPassword, confirmPassword]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (!isEditing) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChangeField = (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    value: string
  ) => {
    if (field === "currentPassword") setCurrentPassword(value);
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
  };

  useEffect(() => {
    let alive = true;

    async function loadSettings() {
      setLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load settings");
        }

        const loaded: FormState = {
          academicYear: data?.academicYear ?? DEFAULT_FORM.academicYear,
          semester: data?.semester ?? DEFAULT_FORM.semester,
          enrollmentOpen: !!data?.enrollmentOpen,
          maxStudentsPerSection: Number(
            data?.maxStudentsPerSection ?? DEFAULT_FORM.maxStudentsPerSection,
          ),
          processingDays: Number(
            data?.processingDays ?? DEFAULT_FORM.processingDays,
          ),
          autoApproveSimpleDocs: !!data?.autoApproveSimpleDocs,
        };

        if (alive) {
          setForm(loaded);
          setSavedForm(loaded);
        }
      } catch (err) {
        console.error(err);

        if (alive) {
          setForm(DEFAULT_FORM);
          setSavedForm(DEFAULT_FORM);
        }

        showAlert("Server error loading settings", "error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadRegistrarAccount() {
      try {
        const data = await getRegistrarByRole();

        if (alive) {
          setRegistrarAccount(data || null);
        }
      } catch (err: any) {
        console.error("Failed to fetch registrar account:", err?.message || err);

        if (alive) {
          setRegistrarAccount(null);
        }
      }
    }

    loadRegistrarAccount();

    return () => {
      alive = false;
    };
  }, []);

  // Keyboard navigation & body overflow scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || saving) return;

      if (exitConfirmOpen) {
        setExitConfirmOpen(false);
        return;
      }

      if (confirmOpen) {
        setConfirmOpen(false);
        return;
      }

      if (isEditing) {
        handleAttemptCancel();
      }
    };

    if (confirmOpen || exitConfirmOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [confirmOpen, exitConfirmOpen, isEditing, isDirty, saving]);

  const onSave = async () => {
    setSaving(true);

    try {
      const updatedBy = registrarAccount?.user || registrarAccount?.email || "";

      // 1. Save general settings
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          ...form,
          updatedBy,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save settings");
      }

      // 2. If new password fields are utilized, invoke backend password change API
      if (newPassword || currentPassword) {
        const userEmail = registrarAccount?.email || "";
        const userId = registrarAccount?._id || "";

        const passRes = await fetch(`${cleanBase}/users/me/password`, {
          method: "PATCH",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            email: userEmail,
            id: userId,
            currentPassword,
            newPassword,
          }),
        });

        const passData = await passRes.json().catch(() => null);
        if (!passRes.ok) {
          throw new Error(passData?.message || "Failed to update password");
        }
      }

      const updated: FormState = {
        academicYear: data?.academicYear ?? form.academicYear,
        semester: data?.semester ?? form.semester,
        enrollmentOpen: !!data?.enrollmentOpen,
        maxStudentsPerSection: Number(
          data?.maxStudentsPerSection ?? form.maxStudentsPerSection,
        ),
        processingDays: Number(data?.processingDays ?? form.processingDays),
        autoApproveSimpleDocs: !!data?.autoApproveSimpleDocs,
      };

      setForm(updated);
      setSavedForm(updated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
      setConfirmOpen(false);

      showAlert("Settings & Password updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || "Server error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAttemptCancel = () => {
    if (saving) return;

    if (isDirty) {
      setExitConfirmOpen(true);
    } else {
      resetFormStates();
    }
  };

  const resetFormStates = () => {
    setForm(savedForm);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setExitConfirmOpen(false);
    setConfirmOpen(false);
    setIsEditing(false);
  };

  const handleAskSave = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Validate password fields if any are filled out
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        showAlert("Please enter your current password.", "error");
        return;
      }
      if (!newPassword) {
        showAlert("Please enter a new password.", "error");
        return;
      }
      if (newPassword.length < 8) {
        showAlert("New password must be at least 8 characters long.", "error");
        return;
      }
      
      const hasUppercase = /[A-Z]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/`~;']/.test(newPassword);

      if (!hasUppercase || !hasSpecialChar) {
        showAlert("New password must include at least one capital letter and one special character.", "error");
        return;
      }

      if (newPassword === currentPassword) {
        showAlert("New password cannot be the same as your current password.", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        showAlert("New passwords do not match.", "error");
        return;
      }
    }

    setConfirmOpen(true);
  };

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={saving}
      />

      <div className="registrar-settings-page">
        <div className="d-flex align-items-start gap-3 mb-3 mb-md-4">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#ffffff",
              border: "1px solid #e9ecef",
              flexShrink: 0,
            }}
          >
            <Settings size={20} />
          </div>

          <div>
            <h2 className="fw-bold mb-1">Registrar Settings</h2>
            <p className="text-muted mb-0">
              Configure enrollment term and account preferences
            </p>
          </div>
        </div>

        {loading && <div className="alert alert-info">Loading settings...</div>}

        <div>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<Calendar size={20} />}
                title="Academic Period"
                subtitle="Set the current academic term"
              >
                <SelectField
                  id="academicYear"
                  label="Academic Year"
                  value={form.academicYear}
                  onChange={(v) => update("academicYear", v)}
                  options={yearOptions}
                  disabled={!isEditing || saving}
                />

                <SelectField
                  id="semester"
                  label="Semester"
                  value={form.semester}
                  onChange={(v) => update("semester", v)}
                  options={semesterOptions}
                  disabled={!isEditing || saving}
                />
              </SettingsSectionCard>
            </div>

            <div className="col-12 col-lg-6">
              <SettingsSectionCard
                icon={<RefreshCw size={20} />}
                title="Enrollment Settings"
                subtitle="Manage enrollment configurations"
              >
                <SwitchField
                  id="enrollmentOpen"
                  label="Enrollment Period Open"
                  description="Allow new student enrollments"
                  checked={form.enrollmentOpen}
                  onChange={(v) => update("enrollmentOpen", v)}
                  disabled={!isEditing || saving}
                />

                <div className="rs-divider" />

                <NumberField
                  id="maxStudentsPerSection"
                  label="Max Students per Section"
                  value={form.maxStudentsPerSection}
                  min={1}
                  onChange={(v) => update("maxStudentsPerSection", v)}
                  disabled={!isEditing || saving}
                />
              </SettingsSectionCard>
            </div>

            {/* Change Password Card replaces Document Processing */}
            <div className="col-12">
              <ChangePasswordCard
                isEditing={isEditing}
                saving={saving}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onPasswordChange={handlePasswordChangeField}
              />
            </div>
          </div>
        </div>

        <div className="rs-savebar mt-4">
          <div className="py-3 d-flex justify-content-end gap-2">
            {isEditing && (
              <button
                className="btn btn-outline-secondary btn-lg"
                onClick={handleAttemptCancel}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>
            )}

            <button
              className="btn btn-lg px-4 rs-save-btn"
              onClick={handleAskSave}
              type="button"
              disabled={saving}
            >
              {!isEditing ? "Edit" : saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM SAVE MODAL */}
      {confirmOpen &&
        createPortal(
          <div
            className="registrar-settings-confirm-backdrop"
            style={{ ...backdropBlurStyle, zIndex: 2000 }}
            onClick={() => !saving && setConfirmOpen(false)}
          >
            <div
              className="registrar-settings-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="registrar-settings-confirm-close"
                onClick={() => setConfirmOpen(false)}
                type="button"
                disabled={saving}
              >
                <X size={18} />
              </button>

              <div className="registrar-settings-confirm-icon">
                <TriangleAlert size={22} />
              </div>

              <h5 className="fw-bold text-center mb-1">Confirm Save</h5>

              <p className="text-muted text-center mb-0">
                Are you sure you want to save the settings changes?
              </p>

              <div className="registrar-settings-confirm-actions">
                <button
                  className="btn btn-light border"
                  onClick={() => setConfirmOpen(false)}
                  type="button"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={onSave}
                  type="button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* DISCARD / EXIT CONFIRMATION MODAL */}
      {exitConfirmOpen &&
        createPortal(
          <div
            className="registrar-settings-confirm-backdrop"
            style={{ ...backdropBlurStyle, zIndex: 2010 }}
            onClick={() => !saving && setExitConfirmOpen(false)}
          >
            <div
              className="registrar-settings-confirm-modal"
              style={{ maxWidth: "420px", width: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-danger" />
                <h5 className="fw-bold mb-0 text-dark">Discard Changes?</h5>
              </div>

              <p className="text-muted mb-4 small">
                You have unsaved changes in settings. Exiting will revert your changes back to the saved state.
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setExitConfirmOpen(false)}
                  disabled={saving}
                >
                  Keep Editing
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={resetFormStates}
                  disabled={saving}
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}