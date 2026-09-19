import { useMemo, useState, useEffect } from "react";
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
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  studentId: string;
  program: string;
  yearLevel: string;
  section: string;
  enrolled: string;
  status: string;
};

const initialProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  avatarUrl: "",
  studentId: "",
  program: "",
  yearLevel: "",
  section: "",
  enrolled: "",
  status: "Active",
};

// Helper to convert numeric year to text format
function formatYearLevel(year: string | number | undefined): string {
  if (!year) return "1st Year";
  if (typeof year === "string" && year.includes("Year")) return year;
  const num = Number(year);
  if (isNaN(num)) return String(year);
  if (num === 1) return "1st Year";
  if (num === 2) return "2nd Year";
  if (num === 3) return "3rd Year";
  if (num >= 4) return `${num}th Year`;
  return `${num} Year`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch signed-in student data from both /api/users/me and /api/students
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userEmail = parsedUser?.email || localStorage.getItem("userEmail");
        const userId = parsedUser?.id || parsedUser?._id || localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch user account info
        let meUrl = "http://localhost:5000/api/users/me";
        if (userId) meUrl += `?id=${encodeURIComponent(userId)}`;
        else if (userEmail) meUrl += `?email=${encodeURIComponent(userEmail)}`;

        const userRes = await fetch(meUrl, { headers });
        const userData = userRes.ok ? await userRes.json() : {};

        // Fetch student record info using ID or Email
        const studentQueryId = userData.idNumber || userId || userEmail;
        let studentData: any = null;

        if (studentQueryId) {
          try {
            const studentRes = await fetch(
              `http://localhost:5000/api/students/${encodeURIComponent(studentQueryId)}`,
              { headers }
            );
            if (studentRes.ok) {
              studentData = await studentRes.json();
            }
          } catch (e) {
            console.warn("Could not fetch extended student record", e);
          }
        }

        // Merge User Account + Student Record details
        const loadedProfile: Profile = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          middleName: userData.middleName || "",
          email: userData.email || studentData?.email || "",
          phone: userData.phone || studentData?.phone || "",
          address: studentData?.address || userData.address || "N/A",
          avatarUrl: userData.avatarUrl || "",
          studentId: userData.idNumber || studentData?.id || studentData?.studentIdNumber || "—",
          program: studentData?.course || studentData?.program || userData.department || "BS Computer Science",
          yearLevel: formatYearLevel(studentData?.yearLevel || studentData?.year || userData.yearLevel || userData.year),
          section: studentData?.section || userData.section || "—",
          enrolled: (studentData?.enrolledDate || userData.createdAt)
            ? new Date(studentData?.enrolledDate || userData.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "August 2022",
          status: (studentData?.status || userData.status || "active").toLowerCase() === "active" ? "Active" : "Regular",
        };

        setProfile(loadedProfile);
        setDraft(loadedProfile);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  const tags = useMemo(
    () => [profile.yearLevel, profile.section, profile.status].filter(Boolean),
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

  async function saveEdit() {
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = parsedUser?.email || localStorage.getItem("userEmail") || profile.email;
      const studentId = profile.studentId;

      const token = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Update user account details (phone, address, avatarUrl)
      const userReq = fetch("http://localhost:5000/api/users/me/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          email: userEmail,
          phone: draft.phone,
          address: draft.address,
          avatarUrl: draft.avatarUrl,
        }),
      });

      // Update student record details if studentId exists
      const studentReq = studentId && studentId !== "—"
        ? fetch(`http://localhost:5000/api/students/${encodeURIComponent(studentId)}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
              phone: draft.phone,
              address: draft.address,
            }),
          })
        : Promise.resolve(null);

      const [userRes] = await Promise.all([userReq, studentReq]);

      if (userRes.ok) {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: draft.avatarUrl,
          phone: draft.phone,
          address: draft.address,
        }));
        setIsEditing(false);
      } else {
        const errData = await userRes.json();
        alert(errData.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Error saving profile changes.");
    }
  }

  if (loading) {
    return (
      <div className="student-profile-page p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${
    profile.middleName ? profile.middleName + " " : ""
  }${profile.lastName}`.trim();

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

        {/* Hero */}
        <ProfileHero
          fullName={fullName}
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
          {/* Personal Info */}
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

          {/* Academic Info */}
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
              ]}
            />
          </div>

          {/* Change Password Card */}
          <div className="col-12">
            <ChangePasswordCard
              onSubmit={(payload) => {
                console.log("change password payload:", payload);
                alert("Password update requested.");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}