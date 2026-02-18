import { Users, BookOpen, Calendar } from "lucide-react";

export default function EnrollmentStats({
  pending,
  availableSections,
  semesterLabel,
}: {
  pending: number;
  availableSections: number;
  semesterLabel: string;
}) {
  return (
    <div className="row g-3 g-md-4">
      <div className="col-12 col-md-4">
        <div className="card shadow-sm enroll-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted">Pending Enrollment</div>
              <div className="fs-2 fw-bold">{pending}</div>
            </div>
            <div className="stat-icon yellow">
              <Users />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card shadow-sm enroll-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted">Available Sections</div>
              <div className="fs-2 fw-bold">{availableSections}</div>
            </div>
            <div className="stat-icon blue">
              <BookOpen />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card shadow-sm enroll-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted">This Semester</div>
              <div className="fs-4 fw-bold">{semesterLabel}</div>
            </div>
            <div className="stat-icon green">
              <Calendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
