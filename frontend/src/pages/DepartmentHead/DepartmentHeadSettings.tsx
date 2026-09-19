// src/pages/DepartmentHead/DepartmentHeadSettings.tsx

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, TriangleAlert, X } from "lucide-react";

import ProfileCard from "../../components/DepartmentHead/Settings/ProfileCard";
import DepartmentPreferencesCard from "../../components/DepartmentHead/Settings/DepartmentPreferencesCard";
import AuthAlert from "../../components/Authentication/AuthAlert";

import "../../styles/department-headSettings.css";

type Profile = {
  initials: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
};

type UserData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  status: string;
  department: string;
  maxUnits?: string;
};

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function DepartmentHeadSettings() {
  /* =========================================================
     PROFILE & PREFERENCES STATE
     ========================================================= */

  const [profile, setProfile] = useState<Profile>({
    initials: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
  });

  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);

  const [maxUnits, setMaxUnits] = useState("21 units");
  const [originalMaxUnits, setOriginalMaxUnits] = useState("21 units");

  /* =========================================================
     UI, EDITING & CONFIRMATION STATES
     ========================================================= */

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  /* =========================================================
     ALERT STATES
     ========================================================= */

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [animateAlert, setAnimateAlert] = useState(false);

  const triggerAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAnimateAlert(true);
  };

  useEffect(() => {
    if (!alertMessage) return;
    const t = setTimeout(() => setAnimateAlert(false), 3000);
    return () => clearTimeout(t);
  }, [alertMessage]);

  /* =========================================================
     UNSAVED CHANGES DETECTOR
     ========================================================= */

  const isDirty = useMemo(() => {
    if (!originalProfile) return false;
    return (
      profile.phone !== originalProfile.phone || maxUnits !== originalMaxUnits
    );
  }, [profile.phone, maxUnits, originalProfile, originalMaxUnits]);

  /* =========================================================
     FETCH SIGNED-IN USER & PREFERENCES
     ========================================================= */

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);

        const userJson = localStorage.getItem("user");
        const currentUser = userJson ? JSON.parse(userJson) : null;
        const userEmail = currentUser?.email || "";

        const query = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";
        const response = await fetch(`http://localhost:5000/api/users/me${query}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile.");
        }

        const user: UserData = data;

        const fullName = [user.firstName, user.middleName, user.lastName]
          .filter(Boolean)
          .join(" ");

        const initials = fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((name) => name.charAt(0).toUpperCase())
          .join("");

        const loadedProfile: Profile = {
          initials,
          fullName,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          role: user.role || "",
        };

        setProfile(loadedProfile);

        if (user.maxUnits) {
          setMaxUnits(user.maxUnits);
          setOriginalMaxUnits(user.maxUnits);
        }
      } catch (err) {
        console.error("fetchMyProfile error:", err);

        triggerAlert(
          err instanceof Error ? err.message : "Failed to load profile.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  /* =========================================================
     KEYBOARD NAVIGATION & SCROLL LOCK
     ========================================================= */

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

  /* =========================================================
     EDIT & CANCEL HANDLERS
     ========================================================= */

  const handleEdit = () => {
    setOriginalProfile(profile);
    setOriginalMaxUnits(maxUnits);
    setIsEditing(true);
  };

  const handleAttemptCancel = () => {
    if (saving) return;

    if (isDirty) {
      setExitConfirmOpen(true);
    } else {
      if (originalProfile) setProfile(originalProfile);
      setMaxUnits(originalMaxUnits);
      setIsEditing(false);
    }
  };

  const handleConfirmExit = () => {
    if (originalProfile) setProfile(originalProfile);
    setMaxUnits(originalMaxUnits);
    setExitConfirmOpen(false);
    setConfirmOpen(false);
    setIsEditing(false);
  };

  const handleAskSave = () => {
    if (!isEditing) {
      handleEdit();
      return;
    }

    setConfirmOpen(true);
  };

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     SAVE PHONE & DEPARTMENT PREFERENCES
     ========================================================= */

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setAnimateAlert(false);

      const startTime = Date.now();

      // Send Phone + Preferences in parallel
      const [phoneRes, prefRes] = await Promise.all([
        fetch("http://localhost:5000/api/users/me/phone", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            phone: profile.phone,
          }),
        }),
        fetch("http://localhost:5000/api/users/me/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            maxUnits,
          }),
        }),
      ]);

      const phoneData = await phoneRes.json();
      const prefData = await prefRes.json();

      if (!phoneRes.ok) {
        throw new Error(phoneData.message || "Failed to save phone number.");
      }

      if (!prefRes.ok) {
        throw new Error(prefData.message || "Failed to save department preferences.");
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 800) {
        await new Promise((resolve) => setTimeout(resolve, 800 - elapsedTime));
      }

      const user: UserData = phoneData.user;

      const fullName = [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ");

      const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name.charAt(0).toUpperCase())
        .join("");

      setProfile({
        initials,
        fullName,
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        role: user.role || "",
      });

      setOriginalProfile(null);
      setOriginalMaxUnits(maxUnits);
      setIsEditing(false);
      setConfirmOpen(false);

      triggerAlert("Settings & Teaching Units updated successfully!", "success");
    } catch (err) {
      console.error("handleSaveChanges error:", err);

      triggerAlert(
        err instanceof Error ? err.message : "Failed to save changes.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 department-settings-page">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <span className="ms-3 text-muted">Loading your settings...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthAlert
        message={alertMessage}
        type={alertType}
        visible={animateAlert}
        loading={saving}
      />

      <div className="container-fluid py-3 py-md-4 department-settings-page position-relative">
        <div className="settings-page-header mb-4">
          <div>
            <h1 className="fw-bold mb-1">Settings</h1>

            <p className="text-muted mb-0">
              Manage your profile and department preferences
            </p>
          </div>
        </div>

        <div className="settings-content">
          <ProfileCard
            profile={profile}
            isEditing={isEditing}
            saving={saving}
            onChange={handleProfileChange}
          />

          <DepartmentPreferencesCard
            maxUnits={maxUnits}
            isEditing={isEditing}
            saving={saving}
            onMaxUnitsChange={setMaxUnits}
          />
        </div>

        <div className="settings-actions gap-2 mt-4">
          {!isEditing ? (
            <button
              type="button"
              className="btn settings-save-btn"
              onClick={handleEdit}
            >
              Edit Settings
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn settings-cancel-btn"
                onClick={handleAttemptCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn settings-save-btn"
                onClick={handleAskSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
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
                  onClick={handleSaveChanges}
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
                  onClick={handleConfirmExit}
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