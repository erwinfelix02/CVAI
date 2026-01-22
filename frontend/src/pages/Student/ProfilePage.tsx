import ProfileHero from "../../components/Student/Profile/ProfileHero";
import InfoCard from "../../components/Student/Profile/InfoCard";
import "../../styles/profile.css";

import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  IdCard,
  Calendar,
} from "lucide-react";

const profile = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan.delacruz@university.edu",
  phone: "+63 912 345 6789",
  address: "123 Campus Drive, Metro Manila",

  studentId: "2024-00001",
  program: "Bachelor of Science in Computer Science",
  yearLevel: "3rd Year",
  section: "BSCS-3A",
  enrolled: "August 2022",
  expectedGraduation: "May 2026",

  status: "Regular",
};

export default function ProfilePage() {
  return (
    <div className="student-profile-page">
      <div className="student-profile-shell">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h2 className="fw-bold mb-1">My Profile</h2>
            <p className="text-muted mb-0">Manage your personal information</p>
          </div>

          <button className="btn btn-primary d-inline-flex align-items-center gap-2 flex-shrink-0">
            Edit Profile
          </button>
        </div>

        {/* Hero */}
        <ProfileHero
          fullName={`${profile.firstName} ${profile.lastName}`}
          subtitle={profile.program}
          tags={[profile.yearLevel, profile.section, profile.status]}
        />

        {/* Info Cards */}
        <div className="row g-3 g-md-4 mt-1">
          <div className="col-12 col-lg-6">
            <InfoCard
              title="Personal Information"
              icon={User}
              items={[
                { label: "First Name", value: profile.firstName },
                { label: "Last Name", value: profile.lastName },
                { label: "Email", value: profile.email, icon: Mail },
                { label: "Phone", value: profile.phone, icon: Phone },
                { label: "Address", value: profile.address, icon: MapPin },
              ]}
            />
          </div>

          <div className="col-12 col-lg-6">
            <InfoCard
              title="Academic Information"
              icon={GraduationCap}
              items={[
                { label: "Student ID", value: profile.studentId, icon: IdCard },
                { label: "Program", value: profile.program },
                { label: "Year Level", value: profile.yearLevel },
                { label: "Section", value: profile.section },
                { label: "Enrolled", value: profile.enrolled, icon: Calendar },
                {
                  label: "Expected Graduation",
                  value: profile.expectedGraduation,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
