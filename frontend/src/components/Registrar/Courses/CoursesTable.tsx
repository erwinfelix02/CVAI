import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CourseItem } from "./types";

type Props = {
  items: CourseItem[];
  onEdit: (item: CourseItem) => void;
  onDelete: (id: string) => Promise<void> | void;
};

export default function CoursesTable({ items, onEdit, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<CourseItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const openDeleteConfirm = (course: CourseItem) => {
    setTarget(course);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    if (deletingRef.current) return;

    deletingRef.current = true;
    setDeleting(true);

    try {
      await onDelete(target.id);
      setConfirmOpen(false);
      setTarget(null);
    } finally {
      setDeleting(false);
      deletingRef.current = false;
    }
  };

  return (
    <div className="table-responsive" style={{ position: "relative" }}>
      <table className="table align-middle courses-table mb-0">
        <thead>
          <tr className="text-muted">
            <th style={{ width: 120 }}>Code</th>
            <th>Course Name</th>
            <th style={{ width: 180 }}>Year Levels</th>
            <th style={{ minWidth: 240 }}>Department</th>
            <th style={{ width: 140 }}>Status</th>
            <th style={{ width: 140 }} className="text-end">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td className="fw-semibold">{c.code}</td>
              <td>{c.name}</td>
              <td>
                <span className="badge rounded-pill bg-light text-dark border">
                  {c.yearLevels} Years
                </span>
              </td>
              <td className="text-muted">{c.department}</td>
              <td>
                <span
                  className={`status-pill ${
                    c.status === "Active" ? "status-active" : "status-inactive"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="text-end">
                <div className="d-inline-flex gap-2">
                  <button
                    type="button"
                    className="table-action-btn edit-action-btn"
                    onClick={() => onEdit(c)}
                    aria-label="Edit"
                    disabled={confirmOpen || deleting}
                  >
                    <Pencil size={18} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    className="table-action-btn delete-action-btn"
                    onClick={() => openDeleteConfirm(c)}
                    aria-label="Delete"
                    disabled={confirmOpen || deleting}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className="py-4 text-center text-muted">No courses found.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmOpen && target ? (
        <div
          className="sec-confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Delete"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setConfirmOpen(false);
              setTarget(null);
            }
          }}
        >
          <div className="sec-confirm-popup" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sec-confirm-header">Confirm Delete</div>

            <div className="sec-confirm-body">
              <div className="fw-bold mb-1">Delete this course?</div>
              <div className="text-muted small">This action cannot be undone.</div>

              <div className="mt-3 small">
                <div>
                  <span className="text-muted">Code:</span>{" "}
                  <span className="fw-semibold">{target.code}</span>
                </div>
                <div>
                  <span className="text-muted">Name:</span>{" "}
                  <span className="fw-semibold">{target.name}</span>
                </div>
                <div>
                  <span className="text-muted">Department:</span>{" "}
                  <span className="fw-semibold">{target.department}</span>
                </div>
              </div>
            </div>

            <div className="sec-confirm-footer">
              <button
                className="btn btn-light"
                onClick={() => {
                  setConfirmOpen(false);
                  setTarget(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}