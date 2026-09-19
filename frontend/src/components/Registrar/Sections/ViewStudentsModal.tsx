import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, X } from "lucide-react";
import type { SectionItem } from "./types";

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatarText?: string;
}

interface ViewStudentsModalProps {
  open: boolean;
  onClose: () => void;
  section: SectionItem | null;
  students?: Student[];
}

export default function ViewStudentsModal({
  open,
  onClose,
  section,
  students,
}: ViewStudentsModalProps) {
  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !section) return null;

  // Fallback mock list if no real student data array is passed
  const displayStudents: Student[] =
    students ??
    Array.from({ length: section.enrolled || 10 }, (_, i) => ({
      id: `std-${i + 1}`,
      studentId: `2024-0000${i + 1}`,
      name: `Student ${i + 1}`,
      avatarText: `S${i + 1}`,
    }));

  const modalContent = (
    <div
      className="modal-backdrop-custom"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="view-students-modal card shadow-lg">
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between p-3 p-md-4 pb-2 border-0">
          <div className="d-flex align-items-center gap-2">
            <Users size={22} className="text-primary" />
            <h5 className="fw-bold mb-0 text-dark">
              {section.code} - Student List
            </h5>
          </div>
          <button
            type="button"
            className="btn-close-custom"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 p-md-4 pt-2 overflow-auto">
          {/* Metadata Banner */}
          <div className="student-list-meta-box mb-3 p-3 rounded-3">
            <div className="row g-2">
              <div className="col-12 col-sm-5">
                <span className="meta-label">Course</span>
                <div className="meta-value text-truncate">
                  {section.program}
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <span className="meta-label">Adviser</span>
                <div className="meta-value text-truncate">
                  {section.adviser || "TBA"}
                </div>
              </div>
              <div className="col-12 col-sm-3">
                <span className="meta-label">Enrolled</span>
                <div className="meta-value">
                  {section.enrolled}/{section.capacity}
                </div>
              </div>
            </div>
          </div>

          {/* Student Cards List */}
          <div className="student-cards-container d-flex flex-column gap-2">
            {displayStudents.length > 0 ? (
              displayStudents.map((std) => (
                <div
                  key={std.id}
                  className="student-card-item d-flex align-items-center gap-3 p-3 rounded-3"
                >
                  <div className="student-avatar d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                    {std.avatarText || "S"}
                  </div>
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark text-truncate">
                      {std.name}
                    </div>
                    <div className="small text-muted text-truncate">
                      {std.studentId}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">
                No students enrolled in this section yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}