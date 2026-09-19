import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  UserX,
  Loader2,
  AlertTriangle,
  Lock,
} from "lucide-react";

export type ModalAttendanceStatus = "present" | "late" | "absent";

export type ModalStudent = {
  id: string;
  name: string;
  studentNo: string;
  status: ModalAttendanceStatus;
};

export type StudentItem = {
  id: string;
  name: string;
  studentNo: string;
  status: "present" | "absent" | "late" | "pending";
};

export type AttendanceRecord = {
  _id?: string;
  subject: string;
  date: string;
  isRecorded: boolean;
  students: StudentItem[];
};

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: { value: string; label: string; section?: string }[];
  initialSubject: string;
  initialDate: string;
  courseRosters: Record<string, StudentItem[]>;
  existingDatabase: AttendanceRecord[];
  onSave: (
    subject: string,
    date: string,
    records: ModalStudent[],
  ) => Promise<void> | void;
}

const cleanStr = (val: any): string =>
  String(val || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const parsedDate = new Date(dateStr + "T00:00:00");
  if (isNaN(parsedDate.getTime())) return dateStr;
  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AttendanceModal({
  isOpen,
  onClose,
  subjects,
  initialSubject,
  initialDate,
  existingDatabase,
  onSave,
}: AttendanceModalProps) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || "");
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<ModalStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const readableDateLabel = useMemo(
    () => formatReadableDate(selectedDate),
    [selectedDate],
  );

  const isAlreadyRecorded = useMemo(() => {
    if (!selectedSubject || !selectedDate) return false;
    return existingDatabase.some(
      (rec) =>
        rec.subject === selectedSubject &&
        rec.date === selectedDate &&
        rec.isRecorded,
    );
  }, [existingDatabase, selectedSubject, selectedDate]);

  const fetchStudentsForCourse = useCallback(
    async (courseCode: string) => {
      if (!courseCode) {
        setRecords([]);
        return;
      }

      setIsLoadingStudents(true);
      try {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;

        const facultyId = user?.id || user?._id || "";
        const facultyName =
          user?.name ||
          (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email || "");

        const selectedObj = subjects.find((s) => s.value === courseCode);

        const queryParams = new URLSearchParams();
        if (facultyId) queryParams.append("facultyId", facultyId);
        if (facultyName) queryParams.append("facultyName", facultyName);

        const response = await fetch(
          `/api/students?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const loadedStudents: any[] = Array.isArray(data)
            ? data
            : data.students || [];

          const targetClean = cleanStr(courseCode);
          const targetSectionClean = cleanStr(selectedObj?.section);

          // STRICT FILTERING: Only match students who actually have the subject or section
          const matchedStudents = loadedStudents.filter((s: any) => {
            const studentSection = cleanStr(
              s.section || s.classSection || s.sectionName,
            );
            const studentCourse = cleanStr(
              s.subject || s.course || s.courseCode || s.assignedSubject,
            );

            const enrolledList = Array.isArray(s.enrolledSubjects)
              ? s.enrolledSubjects.map(cleanStr)
              : Array.isArray(s.courses || s.subjects || s.enrolledClasses)
                ? (s.courses || s.subjects || s.enrolledClasses).map(cleanStr)
                : [];

            const isDirectCourseMatch =
              (studentCourse &&
                (studentCourse.includes(targetClean) ||
                  targetClean.includes(studentCourse))) ||
              enrolledList.some(
                (c: string) =>
                  c.includes(targetClean) || targetClean.includes(c),
              );

            const isSectionMatch = targetSectionClean
              ? studentSection === targetSectionClean
              : false;

            return isDirectCourseMatch || isSectionMatch;
          });

          const formattedModalStudents: ModalStudent[] = matchedStudents.map(
            (s: any, idx: number) => ({
              id: s._id || s.id || `stu-${idx}`,
              name:
                s.fullName ||
                s.name ||
                (s.firstName
                  ? `${s.firstName} ${s.lastName || ""}`
                  : "Unknown Student"),
              studentNo:
                s.studentIdNumber || s.studentId || s.id || `STU-${idx + 1}`,
              status: "present",
            }),
          );

          setRecords(formattedModalStudents);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error("Error fetching students for modal course filter:", err);
        setRecords([]);
      } finally {
        setIsLoadingStudents(false);
      }
    },
    [subjects],
  );

  useEffect(() => {
    if (isOpen) {
      const activeCourse =
        selectedSubject || initialSubject || (subjects[0]?.value ?? "");
      setSelectedSubject(activeCourse);
      setSelectedDate(initialDate || new Date().toISOString().split("T")[0]);
      setSearchQuery("");

      fetchStudentsForCourse(activeCourse);
    }
  }, [isOpen, initialSubject, initialDate, subjects, fetchStudentsForCourse]);

  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
    fetchStudentsForCourse(newSubject);
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentNo.toLowerCase().includes(q),
    );
  }, [records, searchQuery]);

  const counts = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    return { present, absent, late };
  }, [records]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, status: ModalAttendanceStatus) => {
    if (isAlreadyRecorded) return;
    setRecords((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleAllPresent = () => {
    if (isAlreadyRecorded) return;
    setRecords((prev) => prev.map((s) => ({ ...s, status: "present" })));
  };

  const handleAllAbsent = () => {
    if (isAlreadyRecorded) return;
    setRecords((prev) => prev.map((s) => ({ ...s, status: "absent" })));
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveAndSubmit = async () => {
    if (isAlreadyRecorded) {
      alert("Attendance for this subject and date has already been recorded.");
      return;
    }
    if (!selectedSubject) {
      alert("Please select a course before saving.");
      return;
    }
    if (records.length === 0) {
      alert("Cannot save an empty attendance record.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(selectedSubject, selectedDate, records);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block modal-blur-backdrop-fixed"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg px-2 px-sm-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 text-white p-2"
                style={{ backgroundColor: "#8b5cf6", width: 44, height: 44 }}
              >
                <ClipboardList size={22} />
              </div>
              <h4 className="modal-title fw-bold text-dark mb-0">
                Record Attendance
              </h4>
            </div>

            <button
              type="button"
              className="btn btn-light p-2 rounded-circle border-0 d-flex align-items-center justify-content-center text-secondary"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body p-3 p-md-4">
            {isAlreadyRecorded && (
              <div
                className="alert alert-warning d-flex align-items-center gap-2 mb-3 rounded-3"
                role="alert"
              >
                <AlertTriangle
                  size={20}
                  className="text-warning flex-shrink-0"
                />
                <div className="small">
                  <strong>Session Locked:</strong> An attendance record for{" "}
                  <strong>{selectedSubject}</strong> on{" "}
                  <strong>{readableDateLabel}</strong> already exists.
                </div>
              </div>
            )}

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark small">
                  Assigned Course <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg rounded-3 border fs-6 shadow-none"
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>
                    Select Course...
                  </option>
                  {subjects.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark small">
                  Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg rounded-3 border fs-6 shadow-none"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isSubmitting}
                />
                {readableDateLabel && (
                  <div className="form-text text-muted small mt-1">
                    {readableDateLabel}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-light rounded-4 d-flex align-items-center justify-content-between gap-2 mb-3 border overflow-x-auto">
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className="badge rounded-pill bg-emerald-subtle text-emerald border border-emerald px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <CheckCircle2 size={16} />
                  {counts.present} Present
                </span>

                <span className="badge rounded-pill bg-rose-subtle text-rose border border-rose px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <XCircle size={16} />
                  {counts.absent} Absent
                </span>

                <span className="badge rounded-pill bg-amber-subtle text-amber border border-amber px-3 py-2 fs-6 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap">
                  <Clock size={16} />
                  {counts.late} Late
                </span>
              </div>

              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-white bg-white border rounded-3 px-3 py-2 fw-semibold text-dark d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
                  onClick={handleAllPresent}
                  disabled={
                    records.length === 0 ||
                    isLoadingStudents ||
                    isSubmitting ||
                    isAlreadyRecorded
                  }
                >
                  <CheckCircle2 size={18} className="text-success" />
                  All Present
                </button>

                <button
                  type="button"
                  className="btn btn-white bg-white border rounded-3 px-3 py-2 fw-semibold text-dark d-inline-flex align-items-center gap-2 text-nowrap shadow-sm"
                  onClick={handleAllAbsent}
                  disabled={
                    records.length === 0 ||
                    isLoadingStudents ||
                    isSubmitting ||
                    isAlreadyRecorded
                  }
                >
                  <XCircle size={18} className="text-danger" />
                  All Absent
                </button>
              </div>
            </div>

            <div className="position-relative mb-3">
              <Search
                size={18}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              />
              <input
                type="text"
                className="form-control form-control-lg rounded-3 border ps-5 fs-6 shadow-none"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={
                  records.length === 0 || isLoadingStudents || isSubmitting
                }
              />
            </div>

            <div
              className="d-flex flex-column gap-2 overflow-auto pe-1"
              style={{ maxHeight: "360px" }}
            >
              {isLoadingStudents ? (
                <div className="text-center py-5">
                  <Loader2
                    size={28}
                    className="spinner-border spinner-border-sm text-primary mb-2"
                  />
                  <p className="text-muted small mb-0">
                    Loading filtered students...
                  </p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border">
                  <UserX size={42} className="text-muted mb-2 opacity-50" />
                  <h6 className="fw-semibold text-dark mb-1">
                    No Students Found
                  </h6>
                  <p className="text-muted small mb-0">
                    No student roster matches filter for{" "}
                    <strong>{selectedSubject || "selected course"}</strong>.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No students found matching your search term.
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isPresent = s.status === "present";
                  const isLate = s.status === "late";
                  const isAbsent = s.status === "absent";

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-4 border d-flex align-items-center justify-content-between gap-3 transition-all ${
                        isPresent
                          ? "bg-emerald-light border-emerald-subtle"
                          : isLate
                            ? "bg-amber-light border-amber-subtle"
                            : isAbsent
                              ? "bg-rose-light border-rose-subtle"
                              : "bg-white"
                      }`}
                    >
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: "#3b82f6",
                          }}
                        >
                          {getInitials(s.name)}
                        </div>
                        <div className="text-truncate">
                          <h6 className="fw-bold text-dark mb-0 text-truncate">
                            {s.name}
                          </h6>
                          <small className="text-muted">{s.studentNo}</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isPresent
                              ? "bg-emerald text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Present"
                          onClick={() => handleStatusChange(s.id, "present")}
                          disabled={isSubmitting || isAlreadyRecorded}
                        >
                          <CheckCircle2 size={20} />
                        </button>

                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isLate
                              ? "bg-amber text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Late"
                          onClick={() => handleStatusChange(s.id, "late")}
                          disabled={isSubmitting || isAlreadyRecorded}
                        >
                          <Clock size={20} />
                        </button>

                        <button
                          type="button"
                          className={`btn p-2 rounded-3 border-0 d-flex align-items-center justify-content-center ${
                            isAbsent
                              ? "bg-rose text-white shadow-sm"
                              : "bg-light text-secondary"
                          }`}
                          style={{ width: 40, height: 40 }}
                          title="Mark Absent"
                          onClick={() => handleStatusChange(s.id, "absent")}
                          disabled={isSubmitting || isAlreadyRecorded}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light rounded-3 px-4 py-2 border text-muted fw-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success rounded-3 px-4 py-2 fw-medium d-inline-flex align-items-center gap-2"
              onClick={handleSaveAndSubmit}
              disabled={
                records.length === 0 ||
                isLoadingStudents ||
                isSubmitting ||
                isAlreadyRecorded
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={18}
                    className="spinner-border spinner-border-sm"
                  />
                  Saving...
                </>
              ) : isAlreadyRecorded ? (
                <>
                  <Lock size={18} />
                  Already Recorded
                </>
              ) : (
                <>
                  <Check size={18} />
                  Save Attendance Record
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
