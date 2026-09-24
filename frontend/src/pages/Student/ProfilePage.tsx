// ✅ src/components/Student/Profile/ProfilePage.tsx

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
  AlertTriangle,
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

function validValue(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (v && v.trim() !== "" && v.trim().toUpperCase() !== "N/A") {
      return v.trim();
    }
  }
  return "N/A";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false); // 🟢 Track if profile picture was cleared/removed
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discardOpen, setDiscardOpen] = useState(false);

  // 1. Fetch student data & retrieve persisted avatar
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userEmail =
          parsedUser?.email || localStorage.getItem("userEmail");
        const userId =
          parsedUser?.id || parsedUser?._id || localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        let meUrl = "http://localhost:5000/api/users/me";
        if (userId) meUrl += `?id=${encodeURIComponent(userId)}`;
        else if (userEmail) meUrl += `?email=${encodeURIComponent(userEmail)}`;

        const userRes = await fetch(meUrl, { headers });
        const userData = userRes.ok ? await userRes.json() : {};

        const studentQueryId =
          userData.idNumber ||
          parsedUser?.studentIdNumber ||
          userId ||
          userEmail;
        let studentData: any = null;

        if (studentQueryId) {
          try {
            const studentRes = await fetch(
              `http://localhost:5000/api/students/${encodeURIComponent(studentQueryId)}`,
              { headers },
            );
            if (studentRes.ok) {
              studentData = await studentRes.json();
            }
          } catch (e) {
            console.warn("Could not fetch extended student record", e);
          }
        }

        const resolvedAddress = validValue(
          userData.address,
          studentData?.address,
        );
        const resolvedPhone = validValue(userData.phone, studentData?.phone);

        // PERSISTENCE FIX: Prioritize MongoDB user -> student record -> localStorage cache
        const resolvedAvatarUrl =
          userData.avatarUrl ||
          studentData?.avatarUrl ||
          parsedUser?.avatarUrl ||
          "";

        const loadedProfile: Profile = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          middleName: userData.middleName || "",
          email: userData.email || studentData?.email || "",
          phone: resolvedPhone !== "N/A" ? resolvedPhone : "",
          address: resolvedAddress !== "N/A" ? resolvedAddress : "",
          avatarUrl: resolvedAvatarUrl,
          studentId:
            userData.idNumber ||
            studentData?.id ||
            studentData?.studentIdNumber ||
            "—",
          program:
            studentData?.course ||
            studentData?.program ||
            userData.department ||
            "BS Computer Science",
          yearLevel: formatYearLevel(
            studentData?.yearLevel ||
              studentData?.year ||
              userData.yearLevel ||
              userData.year,
          ),
          section: studentData?.section || userData.section || "—",
          enrolled:
            studentData?.enrolledDate || userData.createdAt
              ? new Date(
                  studentData?.enrolledDate || userData.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "August 2022",
          status:
            (
              studentData?.status ||
              userData.status ||
              "active"
            ).toLowerCase() === "active"
              ? "Active"
              : "Regular",
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
    [profile.yearLevel, profile.section, profile.status],
  );

  function startEdit() {
    let formattedPhone = profile.phone;
    if (!formattedPhone || !formattedPhone.startsWith("+639")) {
      const digits = formattedPhone ? formattedPhone.replace(/\D/g, "") : "";
      formattedPhone = "+639" + digits.replace(/^639|^9/, "").slice(0, 9);
    }
    setDraft({ ...profile, phone: formattedPhone });
    setAvatarFile(null);
    setRemoveAvatar(false);
    setIsEditing(true);
  }

  // Check if anything has been modified during editing
  const hasTypedSomething = useMemo(() => {
    return (
      draft.phone !== profile.phone ||
      draft.address !== profile.address ||
      avatarFile !== null ||
      removeAvatar
    );
  }, [draft, profile, avatarFile, removeAvatar]);

  // Cancel button trigger
  function handleCancelClick() {
    if (hasTypedSomething) {
      setDiscardOpen(true);
    } else {
      exitEditing();
    }
  }

  // Actual discard execution
  function exitEditing() {
    setDraft(profile);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setIsEditing(false);
    setDiscardOpen(false);
  }

  async function saveEdit() {
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const userEmail =
        parsedUser?.email || localStorage.getItem("userEmail") || profile.email;
      const studentId = profile.studentId;

      const token = localStorage.getItem("token");
      let uploadedAvatarUrl = removeAvatar ? "" : draft.avatarUrl;

      // 1. Upload new Avatar File if chosen (and not marked for removal)
      if (avatarFile && !removeAvatar) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const uploadTarget =
          studentId && studentId !== "—" ? studentId : userEmail;

        const avatarRes = await fetch(
          `http://localhost:5000/api/students/${encodeURIComponent(uploadTarget)}/avatar`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          },
        );

        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          uploadedAvatarUrl = avatarData.avatarUrl;
        } else {
          console.warn("Avatar upload failed, proceeding with info update.");
        }
      }

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 2. Update User Document
      const userReq = fetch("http://localhost:5000/api/users/me/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          email: userEmail,
          phone: draft.phone,
          address: draft.address,
          avatarUrl: uploadedAvatarUrl,
        }),
      });

      // 3. Update Student Document
      const studentReq =
        studentId && studentId !== "—"
          ? fetch(
              `http://localhost:5000/api/students/${encodeURIComponent(studentId)}`,
              {
                method: "PUT",
                headers,
                body: JSON.stringify({
                  phone: draft.phone,
                  address: draft.address,
                  avatarUrl: uploadedAvatarUrl,
                  updatedBy: "student",
                }),
              },
            )
          : Promise.resolve(null);

      const [userRes, studentRes] = await Promise.all([userReq, studentReq]);

      if (userRes.ok || (studentRes && studentRes.ok)) {
        // Save new state locally
        setProfile((prev) => ({
          ...prev,
          avatarUrl: uploadedAvatarUrl,
          phone: draft.phone,
          address: draft.address,
        }));

        // PERSISTENCE FIX: Update localStorage user object so changes reflect immediately on refresh
        const existingUserStr = localStorage.getItem("user");
        if (existingUserStr) {
          const updatedUser = JSON.parse(existingUserStr);
          updatedUser.phone = draft.phone;
          updatedUser.address = draft.address;
          updatedUser.avatarUrl = uploadedAvatarUrl;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setIsEditing(false);
        setAvatarFile(null);
        setRemoveAvatar(false);
      } else {
        const errData = userRes ? await userRes.json() : {};
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
                onClick={handleCancelClick}
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
          avatarUrl={
            removeAvatar ? "" : isEditing ? draft.avatarUrl : profile.avatarUrl
          }
          onChangeAvatar={(file, previewUrl) => {
            setAvatarFile(file);
            setRemoveAvatar(false);
            setDraft((p) => ({ ...p, avatarUrl: previewUrl }));
          }}
          onRemoveAvatar={() => {
            setAvatarFile(null);
            setRemoveAvatar(true);
            setDraft((p) => ({ ...p, avatarUrl: "" }));
          }}
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
                  value: isEditing ? draft.phone : profile.phone || "N/A",
                  icon: Phone,
                  // 🟢 Locked +639 prefix logic, keeping digits limited after it
                  onChange: (v) => {
                    let cleaned = v;
                    if (!cleaned.startsWith("+639")) {
                      cleaned = "+639" + cleaned.replace(/^[+639]*/, "");
                    }
                    const digitsOnly = cleaned
                      .slice(4)
                      .replace(/\D/g, "")
                      .slice(0, 9);
                    setDraft((p) => ({ ...p, phone: "+639" + digitsOnly }));
                  },
                },
                {
                  label: "Address",
                  value: isEditing ? draft.address : profile.address || "N/A",
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
                {
                  label: "Student ID",
                  value: profile.studentId,
                  icon: IdCard,
                  readOnly: true,
                },
                { label: "Program", value: profile.program, readOnly: true },
                {
                  label: "Year Level",
                  value: profile.yearLevel,
                  readOnly: true,
                },
                { label: "Section", value: profile.section, readOnly: true },
                {
                  label: "Enrolled",
                  value: profile.enrolled,
                  icon: Calendar,
                  readOnly: true,
                },
              ]}
            />
          </div>

          {/* Change Password Card */}
          <div className="col-12">
            <ChangePasswordCard
              onSubmit={async (payload) => {
                const storedUser = localStorage.getItem("user");
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                const userEmail =
                  parsedUser?.email ||
                  localStorage.getItem("userEmail") ||
                  profile.email;
                const userId =
                  parsedUser?.id ||
                  parsedUser?._id ||
                  localStorage.getItem("userId");
                const token = localStorage.getItem("token");

                const headers: HeadersInit = {
                  "Content-Type": "application/json",
                };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const res = await fetch(
                  "http://localhost:5000/api/users/me/password",
                  {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({
                      email: userEmail,
                      id: userId,
                      currentPassword: payload.currentPassword,
                      newPassword: payload.newPassword,
                    }),
                  },
                );

                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.message || "Failed to update password.");
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* DISCARD / EXIT CONFIRMATION MODAL */}
      {discardOpen && (
        <div
          className="modal-backdrop fade show"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        >
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "transparent" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDiscardOpen(false);
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "420px" }}
            >
              <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center bg-white">
                {/* Centered Yellow Warning Icon Box */}
                <div
                  className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#fdf8e2",
                  }}
                >
                  <AlertTriangle size={30} style={{ color: "#f59e0b" }} />
                </div>

                {/* Title */}
                <h4
                  className="fw-bold text-dark mb-2"
                  style={{ fontSize: "1.25rem" }}
                >
                  Unsaved Changes
                </h4>

                {/* Subtitle Message */}
                <p
                  className="text-muted small mb-4 px-2"
                  style={{ lineHeight: "1.5" }}
                >
                  You have drafted changes. Are you sure you want to discard
                  them?
                </p>

                {/* Action Buttons Row */}
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-primary py-2 px-3 rounded-3 fw-medium flex-grow-1 text-white shadow-none border-0"
                    onClick={() => setDiscardOpen(false)}
                  >
                    Keep Editing
                  </button>

                  <button
                    type="button"
                    className="btn py-2 px-3 rounded-3 fw-medium flex-grow-1 text-white shadow-none"
                    style={{ backgroundColor: "#dc2626", border: "none" }}
                    onClick={exitEditing}
                  >
                    Discard & Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
