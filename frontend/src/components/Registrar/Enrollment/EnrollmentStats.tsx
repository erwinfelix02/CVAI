import { Users, BookOpen, Calendar, GraduationCap } from "lucide-react";

export default function EnrollmentStats({
  pending,
  enrolled,
  availableSections,
  semesterLabel,
}: {
  pending: number;
  enrolled: number;
  availableSections: number;
  semesterLabel: string;
}) {
  return (
    <div className="row g-3 g-md-4">
      <div className="col-12 col-md-3">
        <div className="card shadow-sm enroll-card stat-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted stat-label">Pending Evaluation</div>
              <div className="stat-number">{pending}</div>
            </div>
            <div className="stat-icon yellow">
              <Users />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-3">
        <div className="card shadow-sm enroll-card stat-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted stat-label">Officially Enrolled</div>
              <div className="stat-number">{enrolled}</div>
            </div>
            <div className="stat-icon green">
              <GraduationCap />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-3">
        <div className="card shadow-sm enroll-card stat-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted stat-label">Available Sections</div>
              <div className="stat-number">{availableSections}</div>
            </div>
            <div className="stat-icon blue">
              <BookOpen />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-3">
        <div className="card shadow-sm enroll-card stat-card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted stat-label">This Semester</div>
              <div className="stat-semester">{semesterLabel}</div>
            </div>
            <div className="stat-icon gray">
              <Calendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
