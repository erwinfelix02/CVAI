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
  TriangleAlert,
} from "lucide-react";

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

type CourseOption = {
  id: string;
  code: string;
  name: string;
  yearLevels: number;
  department: string;
  status: "Active" | "Inactive";
};

type DepartmentOption = {
  id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
};

type Props = {
  open: boolean;
  onClose: () => void;
  student: StudentDetails | null;
  courseOptions: CourseOption[];
  departmentOptions: DepartmentOption[];
  onSave: (payload: {
    email: string;
    phone: string;
    guardian: string;
    guardianPhone: string;
    birthdate: string;
    course: string;
    year: number;
    department: string;
  }) => void | Promise<void>;
  loading?: boolean;
};

type TabKey = "overview" | "academic";

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

function toInputDate(value?: string) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function EditStudentInfoModal({
  open,
  onClose,
  student,
  courseOptions,
  departmentOptions,
  onSave,
  loading = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guardian, setGuardian] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState<number>(1);
  const [department, setDepartment] = useState("");

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
      if (e.key !== "Escape" || loading) return;

      if (confirmOpen) {
        setConfirmOpen(false);
        return;
      }

      onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading, confirmOpen]);

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      setConfirmOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!student) return;

    setEmail(student.email || "");
    setPhone(student.phone || "");
    setGuardian(student.guardian || "");
    setGuardianPhone(student.guardianPhone || "");
    setBirthdate(toInputDate(student.birthdate));
    setCourse(student.course || "");
    setYear(student.year || 1);
    setDepartment(student.department || "");
  }, [student]);

  const initials = useMemo(
    () => getInitials(student?.name, student?.initials),
    [student],
  );

  const selectedCourse = useMemo(
    () => courseOptions.find((c) => c.name === course || c.code === course),
    [courseOptions, course],
  );

  const availableYears = useMemo(() => {
    const maxYear = Number(selectedCourse?.yearLevels ?? 4);
    return Array.from({ length: maxYear }, (_, i) => i + 1);
  }, [selectedCourse]);

  useEffect(() => {
    if (!availableYears.includes(year)) {
      setYear(availableYears[0] ?? 1);
    }
  }, [availableYears, year]);

  useEffect(() => {
    if (!selectedCourse) return;

    const matchedDepartment = departmentOptions.find(
      (d) =>
        d.name === selectedCourse.department ||
        d.code === selectedCourse.department,
    );

    if (matchedDepartment) {
      setDepartment(matchedDepartment.name);
    }
  }, [selectedCourse, departmentOptions]);

  if (!open || !student) return null;

  const enrolledDate = student.enrolledDate || "—";
  const gpa = student.gpa || "—";

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (loading) return;
    setConfirmOpen(false);
  };

  const handleConfirmSave = async () => {
    await onSave({
      email: email.trim(),
      phone: phone.trim(),
      guardian: guardian.trim(),
      guardianPhone: guardianPhone.trim(),
      birthdate,
      course,
      year,
      department,
    });
    setConfirmOpen(false);
  };

  return createPortal(
    <div
      className="app-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading && !confirmOpen) onClose();
      }}
    >
      <div
        className="app-modal edit-student-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="app-modal-header">
          <h4>Edit Student Information</h4>

          <div className="header-right">
            <button
              type="button"
              className="app-icon-btn app-icon-btn-sm"
              onClick={onClose}
              disabled={loading}
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
            disabled={loading}
          >
            Overview
          </button>

          <button
            type="button"
            className={activeTab === "academic" ? "active" : ""}
            onClick={() => setActiveTab("academic")}
            disabled={loading}
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
                    <span
                      className={`registrar-status ${
                        student.status === "Active"
                          ? "active"
                          : student.status === "Graduated"
                          ? "graduated"
                          : "dropped"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-grid mt-4">
                <div>
                  <label className="info-label" htmlFor="edit-student-email">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    id="edit-student-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="info-label" htmlFor="edit-student-phone">
                    <Phone size={16} /> Phone
                  </label>
                  <input
                    id="edit-student-phone"
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    className="info-label"
                    htmlFor="edit-student-birthdate"
                  >
                    <CalendarDays size={16} /> Birthdate
                  </label>
                  <input
                    id="edit-student-birthdate"
                    type="date"
                    className="form-control"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="info-label">
                    <CalendarDays size={16} /> Enrolled
                  </div>
                  <div className="info-value">{enrolledDate}</div>
                </div>

                <div>
                  <label className="info-label" htmlFor="edit-student-guardian">
                    <UserRound size={16} /> Guardian
                  </label>
                  <input
                    id="edit-student-guardian"
                    type="text"
                    className="form-control"
                    value={guardian}
                    onChange={(e) => setGuardian(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    className="info-label"
                    htmlFor="edit-student-guardian-phone"
                  >
                    <Phone size={16} /> Guardian Phone
                  </label>
                  <input
                    id="edit-student-guardian-phone"
                    type="text"
                    className="form-control"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "academic" && (
            <div className="info-grid">
              <div>
                <label className="info-label" htmlFor="edit-student-course">
                  <BookOpen size={16} /> Course
                </label>
                <select
                  id="edit-student-course"
                  className="form-select"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select course</option>
                  {courseOptions.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="info-label">
                  <School size={16} /> Section
                </div>
                <div className="info-value">{student.section || "—"}</div>
              </div>

              <div>
                <label className="info-label" htmlFor="edit-student-year">
                  <GraduationCap size={16} /> Year Level
                </label>
                <select
                  id="edit-student-year"
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  disabled={loading}
                >
                  {availableYears.map((value) => (
                    <option key={value} value={value}>
                      Year {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="info-label" htmlFor="edit-student-department">
                  <Building2 size={16} /> Department
                </label>
                <select
                  id="edit-student-department"
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
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

        <div className="app-modal-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light border"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenConfirm}
            disabled={loading}
          >
            Save Changes
          </button>
        </div>

        {confirmOpen && (
          <div
            className="registrar-confirm-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) handleCloseConfirm();
            }}
          >
            <div
              className="registrar-confirm-modal"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="registrar-confirm-header">
                <div className="registrar-confirm-title">Confirm Update</div>

                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={handleCloseConfirm}
                  disabled={loading}
                  aria-label="Close"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="registrar-confirm-body">
                <div className="registrar-confirm-icon">
                  <TriangleAlert size={22} />
                </div>

                <p className="text-muted text-center mb-0">
                  Are you sure you want to save the updated student information?
                </p>
              </div>

              <div className="registrar-confirm-actions">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={handleCloseConfirm}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}