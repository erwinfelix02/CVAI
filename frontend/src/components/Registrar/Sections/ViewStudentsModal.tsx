import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Users, X } from "lucide-react";
import type { SectionItem } from "./types";
import { getStudentsBySection } from "../../../api/studentService"; // Adjust path to your API service

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
  email?: string;
}

interface ViewStudentsModalProps {
  open: boolean;
  onClose: () => void;
  section: SectionItem | null;
}

// Helper to format proper backend image source URL (matching AttendanceModal pattern)
const getFullAvatarUrl = (url?: string): string => {
  if (!url) return "";
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function ViewStudentsModal({
  open,
  onClose,
  section,
}: ViewStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Track image load errors per student ID
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Fetch real students assigned to this section when modal opens
  useEffect(() => {
    if (!open || !section) return;

    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setImageErrors({}); // Reset image error states on open
        
        // Query the backend using the section code (e.g., "BSTM-01")
        const data = await getStudentsBySection(section.code);

        if (isMounted) {
          const mapped: Student[] = (Array.isArray(data) ? data : []).map((s: any) => {
            const name = s.fullName || s.name || "Unknown Student";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((x: string) => x[0]?.toUpperCase())
              .join("");

            return {
              id: s._id || s.studentIdNumber || s.id,
              studentId: s.studentIdNumber || s.studentNo || s.id || "N/A",
              name,
              avatarText: initials || "S",
              avatarUrl: s.avatarUrl || s.photo || s.image || "",
              email: s.email || "",
            };
          });

          setStudents(mapped);
        }
      } catch (err) {
        console.error("Failed to load section students:", err);
        if (isMounted) setStudents([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [open, section]);

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
        <div className="p-3 p-md-4 pt-2 overflow-auto" style={{ maxHeight: "70vh" }}>
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
                  {students.length}/{section.capacity}
                </div>
              </div>
            </div>
          </div>

          {/* Student Cards List */}
          <div className="student-cards-container d-flex flex-column gap-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted">
                Loading enrolled students...
              </div>
            ) : students.length > 0 ? (
              students.map((std) => {
                const resolvedAvatarUrl = getFullAvatarUrl(std.avatarUrl);
                const showAvatar = Boolean(resolvedAvatarUrl) && !imageErrors[std.id];

                return (
                  <div
                    key={std.id}
                    className="student-card-item d-flex align-items-center gap-3 p-3 rounded-3"
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 overflow-hidden border"
                      style={{
                        width: 40,
                        height: 40,
                        minWidth: 40,
                        minHeight: 40,
                        backgroundColor: "#3b82f6",
                      }}
                    >
                      {showAvatar ? (
                        <img
                          src={resolvedAvatarUrl}
                          alt={std.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            borderRadius: "50%",
                          }}
                          onError={() => {
                            setImageErrors((prev) => ({ ...prev, [std.id]: true }));
                          }}
                        />
                      ) : (
                        std.avatarText || "S"
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="fw-semibold text-dark text-truncate">
                        {std.name}
                      </div>
                      <div className="small text-muted text-truncate">
                        {std.studentId} {std.email ? `• ${std.email}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })
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