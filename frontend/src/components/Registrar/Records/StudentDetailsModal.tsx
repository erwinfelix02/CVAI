import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Mail,
  Phone,
  CalendarDays,
  BookOpen,
  GraduationCap,
  School,
  UserRound,
  Building2,
} from "lucide-react";
import type { StudentStatus } from "./types";

type StudentDetails = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;

  course: string;
  year: number;
  section?: string;
  department?: string;

  guardian?: string;
  guardianPhone?: string;

  birthdate?: string;
  enrolledDate?: string;

  status: "Active" | "Inactive" | "Dropped" | "Graduated";
  initials?: string;

  gpa?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  student: StudentDetails | null;
};

type TabKey = "overview" | "academic";

function StatusPill({ status }: { status: StudentStatus | string }) {
  const cls =
    status === "Active"
      ? "active"
      : status === "Graduated"
      ? "graduated"
      : "dropped";

  return <span className={`registrar-status ${cls}`}>{status}</span>;
}

function getInitials(name?: string, fallback?: string) {
  if (fallback?.trim()) return fallback;

  const full = String(name || "").trim();
  if (!full) return "ST";

  return full
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

export default function StudentDetailsModal({
  open,
  onClose,
  student,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setActiveTab("overview");
  }, [open]);

  const initials = useMemo(
    () => getInitials(student?.name, student?.initials),
    [student],
  );

  if (!open || !student) return null;

  const enrolledDate = student.enrolledDate || "—";
  const birthdate = student.birthdate || "—";
  const gpa = student.gpa || "—";

  return createPortal(
    <div
      className="app-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="app-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <h4>Student Details</h4>

          <div className="header-right">
            <button
              type="button"
              className="app-icon-btn app-icon-btn-sm"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="tab-container">
          <button
            type="button"
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            type="button"
            className={activeTab === "academic" ? "active" : ""}
            onClick={() => setActiveTab("academic")}
          >
            Academic
          </button>
        </div>

        <div className="app-modal-body">
          {activeTab === "overview" && (
            <>
              <div className="student-profile-card">
                <div className="student-profile-avatar">{initials}</div>

                <div className="student-profile-main">
                  <div className="student-profile-name">{student.name}</div>
                  <div className="student-profile-id">{student.id}</div>
                  <div className="mt-2">
                    <StatusPill status={student.status} />
                  </div>
                </div>
              </div>

              <div className="info-grid mt-4">
                <div>
                  <div className="info-label">
                    <Mail size={16} /> Email
                  </div>
                  <div className="info-value">{student.email || "—"}</div>
                </div>

                <div>
                  <div className="info-label">
                    <Phone size={16} /> Phone
                  </div>
                  <div className="info-value">{student.phone || "—"}</div>
                </div>

                <div>
                  <div className="info-label">
                    <CalendarDays size={16} /> Birthdate
                  </div>
                  <div className="info-value">{birthdate}</div>
                </div>

                <div>
                  <div className="info-label">
                    <CalendarDays size={16} /> Enrolled
                  </div>
                  <div className="info-value">{enrolledDate}</div>
                </div>

                <div>
                  <div className="info-label">
                    <UserRound size={16} /> Guardian
                  </div>
                  <div className="info-value">{student.guardian || "—"}</div>
                </div>

                <div>
                  <div className="info-label">
                    <Phone size={16} /> Guardian Phone
                  </div>
                  <div className="info-value">
                    {student.guardianPhone || "—"}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "academic" && (
            <div className="info-grid">
              <div>
                <div className="info-label">
                  <BookOpen size={16} /> Course
                </div>
                <div className="info-value">{student.course || "—"}</div>
              </div>

              <div>
                <div className="info-label">
                  <School size={16} /> Section
                </div>
                <div className="info-value">{student.section || "—"}</div>
              </div>

              <div>
                <div className="info-label">
                  <GraduationCap size={16} /> Year Level
                </div>
                <div className="info-value">
                  {student.year ? `Year ${student.year}` : "—"}
                </div>
              </div>

              <div>
                <div className="info-label">
                  <Building2 size={16} /> Department
                </div>
                <div className="info-value">{student.department || "—"}</div>
              </div>

              <div>
                <div className="info-label">
                  <GraduationCap size={16} /> GPA
                </div>
                <div className="info-value">{gpa}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}