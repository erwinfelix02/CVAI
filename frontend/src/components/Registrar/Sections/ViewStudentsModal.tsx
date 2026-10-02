import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Users, X, CalendarCheck } from "lucide-react";
import type { SectionItem } from "./types";
import { getStudentsBySection } from "../../../api/studentService";
import { API_BASE_URL } from "../../../config";

interface Student {
  id: string;
  studentId: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
  email?: string;
  attendance?: number;
}

interface ViewStudentsModalProps {
  open: boolean;
  onClose: () => void;
  section: SectionItem | null;
}

// Robust helper to format proper backend image source URL without double slashes
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

  const origin = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  return `${origin}${cleanPath}`;
};

export default function ViewStudentsModal({
  open,
  onClose,
  section,
}: ViewStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open || !section) return;

    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setImageErrors({});
        
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
              attendance: s.attendance !== undefined ? Number(s.attendance) : 100,
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

          {/* List Section Header with Attendance Label */}
          {!isLoading && students.length > 0 && (
            <div className="d-flex align-items-center justify-content-between px-2 mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Student Information</span>
              <span className="text-muted small fw-semibold text-uppercase d-flex align-items-center gap-1">
                <CalendarCheck size={14} /> Attendance Rate
              </span>
            </div>
          )}

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
                const attendanceVal = std.attendance ?? 100;

                const attendanceBadgeClass =
                  attendanceVal >= 90
                    ? "bg-success-subtle text-success"
                    : attendanceVal >= 75
                    ? "bg-warning-subtle text-warning"
                    : "bg-danger-subtle text-danger";

                return (
                  <div
                    key={std.id}
                    className="student-card-item d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white"
                  >
                    <div className="d-flex align-items-center gap-3 min-width-0">
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

                    {/* Attendance Pill with Title context */}
                    <div className="flex-shrink-0 ms-2 text-end">
                      <span
                        className={`badge ${attendanceBadgeClass} d-inline-flex align-items-center gap-1 px-2.5 py-1.5 fw-semibold`}
                        title="Student Attendance Rate"
                      >
                        <CalendarCheck size={13} />
                        {attendanceVal}%
                      </span>
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