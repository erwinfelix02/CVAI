// ✅ src/pages/DepartmentHead/DepartmentHeadSettings.tsx

import { useState } from "react";

import ProfileCard from "../../components/DepartmentHead/Settings/ProfileCard";
import DepartmentPreferencesCard from "../../components/DepartmentHead/Settings/DepartmentPreferencesCard";

import "../../styles/department-headSettings.css";

export default function DepartmentHeadSettings() {
  /* =========================================================
     PROFILE DATA
     ========================================================= */

  const [profile, setProfile] = useState({
    initials: "AR",
    fullName: "Dr. Angela Reyes",
    email: "a.reyes@campus.edu",
    phone: "+63 917 555 0142",
    department: "Computer Studies",
    role: "Department Head",
  });

  /* =========================================================
     DEPARTMENT PREFERENCES
     ========================================================= */

  const [maxUnits, setMaxUnits] = useState("21 units");
  const [semester, setSemester] = useState("1st Semester");

  /* =========================================================
     EDIT MODE
     ========================================================= */

  const [isEditing, setIsEditing] = useState(false);

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    const settings = {
      profile,
      maxUnits,
      semester,
    };

    console.log("Saving department settings:", settings);

    // TODO:
    // Add your API request here.

    // Return to read-only mode after saving.
    setIsEditing(false);
  };

  /* =========================================================
     PROFILE HANDLERS
     ========================================================= */

  const handleProfileChange = (
    field: keyof typeof profile,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="container-fluid py-3 py-md-4 department-settings-page">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="settings-page-header mb-4">
        <div>
          <h1 className="fw-bold mb-1">
            Settings
          </h1>

          <p className="text-muted mb-0">
            Manage your profile and department preferences
          </p>
        </div>
      </div>

      {/* =====================================================
          SETTINGS CONTENT
          ===================================================== */}

      <div className="settings-content">
        {/* ===================================================
            PROFILE
            =================================================== */}

        <ProfileCard
          profile={profile}
          isEditing={isEditing}
          onChange={handleProfileChange}
        />

        {/* ===================================================
            DEPARTMENT PREFERENCES
            =================================================== */}

        <DepartmentPreferencesCard
          maxUnits={maxUnits}
          semester={semester}
          isEditing={isEditing}
          onMaxUnitsChange={setMaxUnits}
          onSemesterChange={setSemester}
        />
      </div>

      {/* =====================================================
          ACTION BUTTON
          ===================================================== */}

      <div className="settings-actions">
        {!isEditing ? (
          <button
            type="button"
            className="btn settings-save-btn"
            onClick={handleEdit}
          >
            Edit Settings
          </button>
        ) : (
          <button
            type="button"
            className="btn settings-save-btn"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}