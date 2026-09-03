// src/pages/DepartmentHead/DepartmentHeadSettings.tsx

import { useEffect, useState } from "react";

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
     UI & EDITING STATES
     ========================================================= */

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

        setProfile({
          initials,
          fullName,
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          role: user.role || "",
        });

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
     EDIT & CANCEL HANDLERS
     ========================================================= */

  const handleEdit = () => {
    setOriginalProfile(profile);
    setOriginalMaxUnits(maxUnits);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setMaxUnits(originalMaxUnits);
    setIsEditing(false);
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
        {saving && (
          <div className="settings-loading-overlay">
            <div className="settings-loading-modal">
              <div
                className="spinner-border text-primary mb-3"
                style={{
                  width: "3.25rem",
                  height: "3.25rem",
                  borderWidth: "0.28em",
                }}
                role="status"
              >
                <span className="visually-hidden">Saving changes...</span>
              </div>

              <h6 className="fw-bold text-dark mb-1">Updating Settings</h6>
              <span className="text-muted small">Please wait a moment...</span>
            </div>
          </div>
        )}

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

        <div className="settings-actions gap-2">
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
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn settings-save-btn"
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}