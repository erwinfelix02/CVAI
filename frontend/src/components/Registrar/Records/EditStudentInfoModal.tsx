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
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { API_BASE_URL } from "../../../config";

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
  avatarUrl?: string;

  gpa?: string;
  verifiedDocs?: string[];
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
    verifiedDocs: string[];
  }) => void | Promise<void>;
  loading?: boolean;
};

type TabKey = "overview" | "academic" | "documents";

const REQUIRED_DOCUMENTS = [
  "Form 137 / Report Card",
  "PSA Birth Certificate",
  "Certificate of Good Moral Character",
  "2x2 ID Photos (4 copies)",
];

const backdropBlurStyle: React.CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

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

function extractSubsequentDigits(val?: string) {
  if (!val) return "";
  let digits = val.replace(/\D/g, "");
  if (digits.startsWith("639")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("63")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("09")) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 9);
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
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [guardian, setGuardian] = useState("");
  const [guardianPhoneDigits, setGuardianPhoneDigits] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState<number>(1);
  const [department, setDepartment] = useState("");
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      setConfirmSaveOpen(false);
      setConfirmDiscardOpen(false);
      setImageError(false);
    }
  }, [open]);

  useEffect(() => {
    if (!student) return;

    setEmail(student.email || "");
    setPhoneDigits(extractSubsequentDigits(student.phone));
    setGuardian(student.guardian || "");
    setGuardianPhoneDigits(extractSubsequentDigits(student.guardianPhone));
    setBirthdate(toInputDate(student.birthdate));
    setCourse(student.course || "");
    setYear(student.year || 1);
    setDepartment(student.department || "");
    setVerifiedDocs(student.verifiedDocs || []);
  }, [student]);

  const initials = useMemo(
    () => getInitials(student?.name, student?.initials),
    [student],
  );

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
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolvedAvatarUrl = getFullAvatarUrl(student?.avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;

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

  const fullPhone = phoneDigits ? `+639${phoneDigits}` : "";
  const fullGuardianPhone = guardianPhoneDigits ? `+639${guardianPhoneDigits}` : "";

  const isPhoneValid = phoneDigits === "" || phoneDigits.length === 9;
  const isGuardianPhoneValid = guardianPhoneDigits === "" || guardianPhoneDigits.length === 9;

  const isDirty = useMemo(() => {
    if (!student) return false;

    const originalDocs = [...(student.verifiedDocs || [])].sort().join(",");
    const currentDocs = [...verifiedDocs].sort().join(",");

    return (
      fullPhone !== (student.phone ? (student.phone.startsWith("+") ? student.phone : `+639${extractSubsequentDigits(student.phone)}`) : "") ||
      guardian.trim() !== (student.guardian || "").trim() ||
      fullGuardianPhone !== (student.guardianPhone ? (student.guardianPhone.startsWith("+") ? student.guardianPhone : `+639${extractSubsequentDigits(student.guardianPhone)}`) : "") ||
      birthdate !== toInputDate(student.birthdate) ||
      course !== (student.course || "") ||
      year !== (student.year || 1) ||
      department !== (student.department || "") ||
      originalDocs !== currentDocs
    );
  }, [
    fullPhone,
    guardian,
    fullGuardianPhone,
    birthdate,
    course,
    year,
    department,
    verifiedDocs,
    student,
  ]);

  const toggleDocument = (docName: string) => {
    setVerifiedDocs((prev) =>
      prev.some((d) => d.toLowerCase() === docName.toLowerCase())
        ? prev.filter((d) => d.toLowerCase() !== docName.toLowerCase())
        : [...prev, docName]
    );
  };

  const handleAttemptClose = () => {
    if (loading) return;

    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || loading) return;

      if (confirmSaveOpen) {
        setConfirmSaveOpen(false);
        return;
      }

      if (confirmDiscardOpen) {
        setConfirmDiscardOpen(false);
        return;
      }

      handleAttemptClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, confirmSaveOpen, confirmDiscardOpen, isDirty]);

  if (!open || !student) return null;

  const enrolledDate = student.enrolledDate || "—";
  const gpa = student.gpa || "—";

  const handleOpenConfirmSave = () => {
    setConfirmSaveOpen(true);
  };

  const handleCloseConfirmSave = () => {
    if (loading) return;
    setConfirmSaveOpen(false);
  };

  const handleConfirmSave = async () => {
    await onSave({
      email: email.trim(),
      phone: fullPhone,
      guardian: guardian.trim(),
      guardianPhone: fullGuardianPhone,
      birthdate,
      course,
      year,
      department,
      verifiedDocs,
    });
    setConfirmSaveOpen(false);
  };

  const confirmDiscardChanges = () => {
    setConfirmDiscardOpen(false);
    onClose();
  };

  return createPortal(
    <div
      className="app-modal-backdrop"
      style={backdropBlurStyle}
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading &&
          !confirmSaveOpen &&
          !confirmDiscardOpen
        ) {
          handleAttemptClose();
        }
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
              onClick={handleAttemptClose}
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

          <button
            type="button"
            className={activeTab === "documents" ? "active" : ""}
            onClick={() => setActiveTab("documents")}
            disabled={loading}
          >
            Documents
          </button>
        </div>

        <div className="app-modal-body">
          {activeTab === "overview" && (
            <>
              <div className="student-profile-card">
                <div
                  className="student-profile-avatar overflow-hidden d-flex align-items-center justify-content-center p-0"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: showAvatar ? "transparent" : undefined,
                  }}
                >
                  {showAvatar ? (
                    <img
                      src={resolvedAvatarUrl}
                      alt={student.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "50%",
                      }}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    initials
                  )}
                </div>

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
                    disabled={true}
                    readOnly
                    title="Email cannot be changed"
                  />
                </div>

                <div>
                  <label className="info-label" htmlFor="edit-student-phone">
                    <Phone size={16} /> Phone
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted fw-medium">
                      +639
                    </span>
                    <input
                      id="edit-student-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      className="form-control"
                      value={phoneDigits}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                        setPhoneDigits(val);
                      }}
                      disabled={loading}
                      placeholder="XXXXXXXXX"
                    />
                  </div>
                  {!isPhoneValid && (
                    <small className="text-danger d-block mt-1">
                      Phone number must have exactly 9 digits after +639.
                    </small>
                  )}
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
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted fw-medium">
                      +639
                    </span>
                    <input
                      id="edit-student-guardian-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      className="form-control"
                      value={guardianPhoneDigits}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                        setGuardianPhoneDigits(val);
                      }}
                      disabled={loading}
                      placeholder="XXXXXXXXX"
                    />
                  </div>
                  {!isGuardianPhoneValid && (
                    <small className="text-danger d-block mt-1">
                      Guardian phone must have exactly 9 digits after +639.
                    </small>
                  )}
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

          {activeTab === "documents" && (
            <div className="d-flex flex-column gap-3">
              <div className="text-muted small mb-1">
                Check or uncheck admission requirements to update student status.
              </div>

              {REQUIRED_DOCUMENTS.map((docName, idx) => {
                const isChecked = verifiedDocs.some(
                  (d) => d.toLowerCase() === docName.toLowerCase()
                );

                return (
                  <div
                    key={idx}
                    onClick={() => !loading && toggleDocument(docName)}
                    className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light cursor-pointer user-select-none"
                    style={{ cursor: loading ? "not-allowed" : "pointer" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        disabled={loading}
                        className="form-check-input m-0 cursor-pointer"
                        style={{ width: "1.2rem", height: "1.2rem" }}
                      />
                      <span className="fw-medium text-dark">{docName}</span>
                    </div>

                    <div>
                      {isChecked ? (
                        <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1 px-2 py-1">
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-muted px-2 py-1">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="app-modal-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light border"
            onClick={handleAttemptClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenConfirmSave}
            disabled={
              loading ||
              !isDirty ||
              !isPhoneValid ||
              !isGuardianPhoneValid ||
              (phoneDigits !== "" && phoneDigits.length !== 9) ||
              (guardianPhoneDigits !== "" && guardianPhoneDigits.length !== 9)
            }
          >
            Save Changes
          </button>
        </div>

        {confirmSaveOpen && (
          <div
            className="registrar-confirm-backdrop"
            style={backdropBlurStyle}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) handleCloseConfirmSave();
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
                  onClick={handleCloseConfirmSave}
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
                  onClick={handleCloseConfirmSave}
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

        {confirmDiscardOpen && (
          <div
            className="registrar-confirm-backdrop"
            style={backdropBlurStyle}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !loading) {
                setConfirmDiscardOpen(false);
              }
            }}
          >
            <div
              className="registrar-confirm-modal"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="registrar-confirm-header">
                <div className="registrar-confirm-title">Discard Changes?</div>

                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={() => setConfirmDiscardOpen(false)}
                  disabled={loading}
                  aria-label="Close"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="registrar-confirm-body">
                <div className="registrar-confirm-icon bg-warning-subtle text-warning">
                  <AlertTriangle size={22} />
                </div>

                <p className="text-muted text-center mb-0">
                  You have unsaved changes in student details. Closing now will
                  discard your changes.
                </p>
              </div>

              <div className="registrar-confirm-actions">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setConfirmDiscardOpen(false)}
                  disabled={loading}
                >
                  Keep Editing
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDiscardChanges}
                  disabled={loading}
                >
                  Discard & Exit
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