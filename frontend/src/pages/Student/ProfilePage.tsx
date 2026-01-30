import { useMemo, useState } from "react";
import ProfileHero from "../../components/Student/Profile/ProfileHero";
import InfoCard from "../../components/Student/Profile/InfoCard";
import ChangePasswordCard from "../../components/Student/Profile/ChangePasswordCard";
import "../../styles/profile.css";

import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  IdCard,
  Calendar,
  Save,
  X,
  Pencil,
} from "lucide-react";

type Profile = {
  // ✅ still displayed (not editable)
  firstName: string;
  lastName: string;

  email: string;

  // ✅ editable
  phone: string;
  address: string;

  // ✅ new: editable profile pic
  avatarUrl?: string;

  // academic (view-only)
  studentId: string;
  program: string;
  yearLevel: string;
  section: string;
  enrolled: string;
  expectedGraduation: string;

  status: string;
};

const initialProfile: Profile = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan.delacruz@university.edu",
  phone: "+63 912 345 6789",
  address: "123 Campus Drive, Metro Manila",

  avatarUrl: "",

  studentId: "2024-00001",
  program: "Bachelor of Science in Computer Science",
  yearLevel: "3rd Year",
  section: "BSCS-3A",
  enrolled: "August 2022",
  expectedGraduation: "May 2026",

  status: "Regular",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const tags = useMemo(
    () => [profile.yearLevel, profile.section, profile.status],
    [profile.yearLevel, profile.section, profile.status]
  );

  function startEdit() {
    setDraft(profile);
    setIsEditing(true);
  }

  function cancelEdit() {
    setDraft(profile);
    setIsEditing(false);
  }

  function saveEdit() {
    // ✅ only save allowed fields: avatar + phone + address
    setProfile((prev) => ({
      ...prev,
      avatarUrl: draft.avatarUrl,
      phone: draft.phone,
      address: draft.address,
      // name/email/academic unchanged
    }));
    setIsEditing(false);
  }

  return (
    <div className="student-profile-page">
      <div className="student-profile-shell">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h2 className="fw-bold mb-1">My Profile</h2>
            <p className="text-muted mb-0">Manage your personal information</p>
          </div>

          {!isEditing ? (
            <button
              className="btn btn-primary d-inline-flex align-items-center gap-2 flex-shrink-0"
              onClick={startEdit}
              type="button"
            >
              <Pencil size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="d-flex gap-2 flex-shrink-0">
              <button
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                onClick={cancelEdit}
                type="button"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                className="btn btn-success d-inline-flex align-items-center gap-2"
                onClick={saveEdit}
                type="button"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          )}
        </div>

        {/* ✅ Hero (name NOT editable; avatar IS editable) */}
        <ProfileHero
          fullName={`${profile.firstName} ${profile.lastName}`}
          subtitle={profile.program}
          tags={tags}
          editable={isEditing}
          avatarUrl={isEditing ? draft.avatarUrl : profile.avatarUrl}
          onChangeAvatar={(dataUrl) =>
            setDraft((p) => ({ ...p, avatarUrl: dataUrl }))
          }
        />

        {/* Cards */}
        <div className="row g-3 g-md-4 mt-1">
          {/* Personal Info: only Phone + Address editable */}
          <div className="col-12 col-lg-6">
            <InfoCard
              title="Personal Information"
              icon={User}
              editable={isEditing}
              items={[
                {
                  label: "First Name",
                  value: profile.firstName,
                  readOnly: true,
                },
                {
                  label: "Last Name",
                  value: profile.lastName,
                  readOnly: true,
                },
                {
                  label: "Email",
                  value: profile.email,
                  icon: Mail,
                  readOnly: true,
                },
                {
                  label: "Phone",
                  value: isEditing ? draft.phone : profile.phone,
                  icon: Phone,
                  onChange: (v) => setDraft((p) => ({ ...p, phone: v })),
                },
                {
                  label: "Address",
                  value: isEditing ? draft.address : profile.address,
                  icon: MapPin,
                  onChange: (v) => setDraft((p) => ({ ...p, address: v })),
                  multiline: true,
                },
              ]}
            />
          </div>

          {/* Academic Info: always view-only */}
          <div className="col-12 col-lg-6">
            <InfoCard
              title="Academic Information"
              icon={GraduationCap}
              editable={false}
              items={[
                { label: "Student ID", value: profile.studentId, icon: IdCard, readOnly: true },
                { label: "Program", value: profile.program, readOnly: true },
                { label: "Year Level", value: profile.yearLevel, readOnly: true },
                { label: "Section", value: profile.section, readOnly: true },
                { label: "Enrolled", value: profile.enrolled, icon: Calendar, readOnly: true },
                { label: "Expected Graduation", value: profile.expectedGraduation, readOnly: true },
              ]}
            />
          </div>

          {/* Change Password Card */}
          <div className="col-12">
            <ChangePasswordCard
              onSubmit={(payload) => {
                console.log("change password payload:", payload);
                alert("Password updated (demo). Connect this to your backend.");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
