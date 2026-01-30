import { Clock, MapPin, Users, BookOpen, ClipboardList } from "lucide-react";
import type { ClassItem } from "./types";

function accentClass(accent: ClassItem["accent"]) {
  return `class-accent-${accent}`;
}

export default function ClassCard({
  item,
  onStudents,
  onMaterials,
  onGrades,
}: {
  item: ClassItem;
  onStudents?: () => void;
  onMaterials?: () => void;
  onGrades?: () => void;
}) {
  const capacityPct = Math.round((item.students / item.capacity) * 100);

  return (
    <div className={`card shadow-sm faculty-class-card ${accentClass(item.accent)}`}>
      <div className="card-body faculty-class-body">


        {/* top row: code pill + assigned badge */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge rounded-pill text-dark bg-white border px-3 py-2 class-code-pill">
            {item.code}
          </span>

          {item.assigned && (
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
              Assigned
            </span>
          )}
        </div>

        {/* title */}
        <h5 className="fw-bold mb-1 class-title">{item.title}</h5>
        <div className="text-muted mb-3">{item.section}</div>

        {/* info rows */}
        <div className="row g-2 class-meta">
          <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
            <Clock size={16} className="text-muted" />
            <span className="meta-text">{item.schedule}</span>
          </div>

          <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
            <MapPin size={16} className="text-muted" />
            <span className="meta-text">{item.room}</span>
          </div>

          <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
            <Users size={16} className="text-muted" />
            <span className="meta-text">
              {item.students}/{item.capacity} students
            </span>
          </div>

          <div className="col-12 col-sm-6 d-flex justify-content-sm-end">
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
              {capacityPct}% capacity
            </span>
          </div>
        </div>

        {/* progress */}
        <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
          <span className="text-muted">Course Progress</span>
          <span className="fw-semibold">{item.progress}%</span>
        </div>

        <div className="progress class-progress" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${item.progress}%` }} />
        </div>

        {/* actions - responsive */}
        <div className="row g-2 mt-3">
          <div className="col-12 col-sm-4">
            <button
              type="button"
              onClick={onStudents}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 class-action-btn"
            >
              <Users size={16} />
              Students
            </button>
          </div>

          <div className="col-12 col-sm-4">
            <button
              type="button"
              onClick={onMaterials}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 class-action-btn"
            >
              <BookOpen size={16} />
              Materials
            </button>
          </div>

          <div className="col-12 col-sm-4">
            <button
              type="button"
              onClick={onGrades}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 class-action-btn"
            >
              <ClipboardList size={16} />
              Grades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
