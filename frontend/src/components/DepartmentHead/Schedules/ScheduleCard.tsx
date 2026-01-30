// src/components/DepartmentHead/Schedules/ScheduleCard.tsx
import { BookOpen, User, MapPin, Clock, Pencil, Trash2 } from "lucide-react";
import type { ScheduleRow } from "./types";

type Props = {
  row: ScheduleRow;
  onEdit: (row: ScheduleRow) => void;
  onDelete: (row: ScheduleRow) => void;
};

export default function ScheduleCard({ row, onEdit, onDelete }: Props) {
  return (
    <div className="card border-0 shadow-sm rounded-4 dept-schedule-card">
      <div className="card-body p-3 p-md-4">
        <div className="row g-3 align-items-center">
          {/* Left: icon */}
          <div className="col-auto">
            <div className="dept-schedule-icon">
              <BookOpen size={22} />
            </div>
          </div>

          {/* Middle: content */}
          <div className="col min-w-0">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dept-code">{row.code}</div>

              <span className="badge rounded-pill text-bg-light border dept-chip">
                {row.section}
              </span>
            </div>

            <div className="dept-title text-muted">{row.title}</div>

            <div className="dept-meta mt-2">
              <div className="dept-meta-item">
                <User size={16} />
                <span className="text-truncate">{row.faculty}</span>
              </div>

              <div className="dept-meta-item">
                <MapPin size={16} />
                <span className="text-truncate">{row.room}</span>
              </div>

              <div className="dept-meta-item">
                <Clock size={16} />
                <span className="text-truncate">
                  {row.days} {row.time}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="col-12 col-md-auto">
            <div className="dept-actions">
              <button
                type="button"
                className="btn btn-outline-secondary dept-btn dept-btn-edit"
                onClick={() => onEdit(row)}
              >
                <Pencil size={18} />
                <span className="d-none d-md-inline">Edit</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-danger dept-btn dept-btn-icon"
                onClick={() => onDelete(row)}
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
