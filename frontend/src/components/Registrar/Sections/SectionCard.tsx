import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  BookOpen,
  User,
  MapPin,
  Clock,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { SectionItem } from "./types";

function getTone(enrolled: number, capacity: number) {
  const pct = capacity === 0 ? 0 : enrolled / capacity;
  if (pct >= 0.9) return "danger";
  if (pct >= 0.7) return "warning";
  return "primary";
}

export default function SectionCard({
  item,
  onViewStudents,
  onEdit,
  onDelete,
}: {
  item: SectionItem;
  onViewStudents: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tone = getTone(item.enrolled, item.capacity);
  const pct =
    item.capacity === 0
      ? 0
      : Math.min(100, Math.round((item.enrolled / item.capacity) * 100));

  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // close kebab on outside click
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // close delete confirm on ESC
  useEffect(() => {
    if (!confirmDelete) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmDelete(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

  return (
    <>
      <div className="card shadow-sm sections-card h-100">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2">
                <BookOpen size={18} className="sections-card-ic" />
                <div className="sections-card-title text-truncate">
                  {item.code}
                </div>
              </div>
              <div className="text-muted sections-card-sub text-truncate">
                {item.program}
              </div>
            </div>

            {/* Kebab Menu */}
            <div className="sections-menu-wrap" ref={menuRef}>
              <button
                className="btn btn-link p-0 sections-kebab"
                type="button"
                aria-label="More"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <MoreVertical size={18} />
              </button>

              {open && (
                <div className="sections-menu">
                  <button
                    type="button"
                    className="sections-menu-item"
                    onClick={() => {
                      setOpen(false);
                      onViewStudents();
                    }}
                  >
                    <Eye size={16} />
                    <span>View Students</span>
                  </button>

                  <button
                    type="button"
                    className="sections-menu-item"
                    onClick={() => {
                      setOpen(false);
                      onEdit();
                    }}
                  >
                    <Pencil size={16} />
                    <span>Edit Section</span>
                  </button>

                  <button
                    type="button"
                    className="sections-menu-item danger"
                    onClick={() => {
                      setOpen(false);
                      setConfirmDelete(true);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="d-flex align-items-center justify-content-between mt-3">
            <div className="text-muted">Enrolled</div>
            <span className={`sections-chip tone-${tone}`}>
              {item.enrolled}/{item.capacity}
            </span>
          </div>

          <div
            className="progress sections-progress mt-2"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`progress-bar tone-${tone}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 sections-meta">
            <User size={16} />
            <span className="text-truncate">{item.adviser}</span>
          </div>

          <div className="d-flex align-items-center justify-content-between gap-3 mt-2 sections-meta">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <MapPin size={16} />
              <span className="text-truncate">{item.room}</span>
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <Clock size={16} />
              <span className="text-nowrap">{item.schedule}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM POPUP */}
      {confirmDelete && (
        <div
          className="sec-confirm-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(false);
          }}
        >
          <div
            className="sec-confirm-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sec-confirm-header d-flex justify-content-between align-items-center">
              <span>Confirm Delete</span>
              <button
                className="btn btn-link p-0"
                onClick={() => setConfirmDelete(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sec-confirm-body">
              <div className="fw-bold mb-2">
                Delete section {item.code}?
              </div>
              <div className="text-muted small">
                This action cannot be undone.
              </div>
            </div>

            <div className="sec-confirm-footer">
              <button
                className="btn btn-light"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete();
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}