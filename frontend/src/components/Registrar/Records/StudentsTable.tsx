import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, PencilLine, UserX } from "lucide-react";
import type { StudentRow, StudentStatus } from "./types";

function StatusPill({ status }: { status: StudentStatus }) {
  const cls =
    status === "Active"
      ? "active"
      : status === "Graduated"
      ? "graduated"
      : "dropped";

  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

type Props = {
  title: string;
  rows: StudentRow[];
  onRowAction?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onEditInfo?: (id: string) => void;
  onMarkDropped?: (id: string) => void;
};

type MenuState = {
  id: string;
  top: number;
  left: number;
} | null;

export default function StudentsTable({
  title,
  rows,
  onRowAction,
  onViewDetails,
  onEditInfo,
}: Props) {
  const hasRows = rows.length > 0;

  const [menu, setMenu] = useState<MenuState>(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(null);
        setShowUnavailableModal(false);
      }
    }

    function handleScroll() {
      setMenu(null);
    }

    function handleResize() {
      setMenu(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = (
    id: string,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    const button = e.currentTarget;

    setMenu((prev) => {
      if (prev?.id === id) return null;

      const rect = button.getBoundingClientRect();
      const menuWidth = 196;
      const gap = 8;

      let left = rect.right - menuWidth;
      if (left < 8) left = 8;

      const top = rect.bottom + gap;

      return { id, top, left };
    });
  };

  const handleView = (id: string) => {
    setMenu(null);
    if (onViewDetails) return onViewDetails(id);
    if (onRowAction) return onRowAction(id);
  };

  const handleEdit = (id: string) => {
    setMenu(null);
    if (onEditInfo) return onEditInfo(id);
    if (onRowAction) return onRowAction(id);
  };

  const handleDropped = (_id: string) => {
    setMenu(null);
    setShowUnavailableModal(true);
  };

  return (
    <>
      <div className="card shadow-sm registrar-card">
        <div className="card-body p-0">
          <div className="p-3 p-md-4">
            <h5 className="fw-bold mb-0">{title}</h5>
          </div>

          <div className="table-responsive registrar-table-wrap">
            {hasRows ? (
              <table className="table align-middle mb-0 registrar-table">
                <thead>
                  <tr className="text-muted">
                    <th style={{ minWidth: 260 }}>Student</th>
                    <th style={{ minWidth: 140 }}>Student ID</th>
                    <th style={{ minWidth: 220 }}>Course</th>
                    <th style={{ minWidth: 120 }}>Section</th>
                    <th style={{ minWidth: 80 }}>Year</th>
                    <th style={{ minWidth: 120 }}>Status</th>
                    <th style={{ width: 70 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((s) => {
                    const isOpen = menu?.id === s.id;

                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="registrar-avatar">{s.initials}</div>
                            <div className="min-w-0">
                              <div className="fw-semibold text-truncate">
                                {s.name}
                              </div>
                              <div className="text-muted small text-truncate">
                                {s.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="fw-semibold">{s.id}</td>
                        <td>{s.course}</td>
                        <td>{s.section}</td>
                        <td>{s.year}</td>
                        <td>
                          <StatusPill status={s.status} />
                        </td>

                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-link p-0 registrar-dots"
                            onClick={(e) => toggleMenu(s.id, e)}
                            aria-label="Row actions"
                            aria-expanded={isOpen}
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="users-empty-state py-5">
                <div className="users-empty-icon">📭</div>
                <h5 className="fw-semibold mb-1">No students found</h5>
                <p className="text-muted mb-0">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            className="student-actions-menu shadow-sm"
            style={{
              position: "fixed",
              top: `${menu.top}px`,
              left: `${menu.left}px`,
            }}
          >
            <button
              type="button"
              className="student-actions-item"
              onClick={() => handleView(menu.id)}
            >
              <Eye size={16} className="student-actions-icon" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              className="student-actions-item"
              onClick={() => handleEdit(menu.id)}
            >
              <PencilLine size={16} className="student-actions-icon" />
              <span>Edit Info</span>
            </button>

            <button
              type="button"
              className="student-actions-item student-actions-item-danger"
              onClick={() => handleDropped(menu.id)}
            >
              <UserX size={16} className="student-actions-icon" />
              <span>Mark as Dropped</span>
            </button>
          </div>,
          document.body,
        )}

     {showUnavailableModal &&
  createPortal(
    <div
      className="students-modal-backdrop"
      onClick={() => setShowUnavailableModal(false)}
    >
      <div
        className="students-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="students-unavailable-title"
      >
        <div className="students-modal-icon-wrap">
          <div className="students-modal-icon">
            <UserX size={22} />
          </div>
        </div>

        <h5 id="students-unavailable-title" className="students-modal-title">
          Not Available Yet
        </h5>

        <p className="students-modal-text">
          Mark as Dropped is not available yet.
        </p>

        <div className="students-modal-actions">
          <button
            type="button"
            className="btn btn-danger students-modal-btn-primary"
            onClick={() => setShowUnavailableModal(false)}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )}
    </>
  );
}