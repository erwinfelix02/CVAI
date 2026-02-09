import { Users } from "lucide-react";

import EnrollmentStats from "../../components/Registrar/Enrollment/EnrollmentStats";
import PendingEnrollmentList from "../../components/Registrar/Enrollment/PendingEnrollmentList";
import SectionCapacityGrid from "../../components/Registrar/Enrollment/SectionCapacityGrid";

import "../../styles/registrar-enrollment.css";

export default function StudentEnrollmentPage() {
  return (
    <div className="registrar-enrollment container-fluid px-3 px-md-4">

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Student Enrollment</h2>
        <p className="text-muted mb-0">
          Assign approved students to sections
        </p>
      </div>

      {/* Stats */}
      <EnrollmentStats />

      {/* Search */}
      <div className="card shadow-sm enroll-card mt-3 mt-md-4">
        <div className="card-body">
          <div className="input-group enroll-search">
            <span className="input-group-text bg-white border-end-0">
              <Users size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search pending students by name or ID..."
            />
          </div>
        </div>
      </div>

      {/* Pending Enrollment */}
      <div className="mt-3 mt-md-4">
        <PendingEnrollmentList />
      </div>

      {/* Section Capacity */}
      <div className="mt-3 mt-md-4">
        <SectionCapacityGrid />
      </div>

    </div>
  );
}
