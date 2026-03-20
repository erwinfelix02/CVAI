import { BookOpen, Building2, BadgeCheck, Ban } from "lucide-react";

type Props = {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  departments: number;
};

export default function CourseStatsRow({
  totalCourses,
  activeCourses,
  inactiveCourses,
  departments,
}: Props) {
  return (
    <div className="row g-3 g-md-4">
      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm border-0 stats-card h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stats-icon bg-soft-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="stats-number">{totalCourses}</div>
              <div className="text-muted">Total Courses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm border-0 stats-card h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stats-icon bg-soft-success">
              <BadgeCheck size={20} />
            </div>
            <div>
              <div className="stats-number">{activeCourses}</div>
              <div className="text-muted">Active Courses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm border-0 stats-card h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stats-icon bg-soft-danger">
              <Ban size={20} />
            </div>
            <div>
              <div className="stats-number">{inactiveCourses}</div>
              <div className="text-muted">Inactive Courses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-xl-3">
        <div className="card shadow-sm border-0 stats-card h-100">
          <div className="card-body d-flex align-items-center gap-3">
            <div className="stats-icon bg-soft-secondary">
              <Building2 size={20} />
            </div>
            <div>
              <div className="stats-number">{departments}</div>
              <div className="text-muted">Departments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}