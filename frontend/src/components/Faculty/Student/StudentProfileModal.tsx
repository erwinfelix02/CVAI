// src/components/Faculty/Student/StudentProfileModal.tsx

import { useState } from "react";
import { Mail, Phone, BookOpen, Award, } from "lucide-react";
import { formatYearLevel, type Student, type TermGradeData } from "./types";
import { API_BASE_URL } from "../../../config";

type Props = {
  student: Student | null;
  onClose: () => void;
};

export default function StudentProfileModal({ student, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "contact">("overview");
  const [activeTerm, setActiveTerm] = useState<"prelim" | "midterm" | "finals">("prelim");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  if (!student) return null;

  const yearDisplay = formatYearLevel(student.year);
  const attendanceRate = typeof student.attendance === "number" ? student.attendance : 100;
  const isAtRisk = attendanceRate < 80;

  const contactPhone = (student.phone || "").trim();
  const displayPhone =
    contactPhone && contactPhone !== "—" && contactPhone !== "null"
      ? contactPhone
      : "Not Provided";

  // Parse grades object or Map securely
  let rawGrades: Record<string, any> = {};
  if (student.grades) {
    if (student.grades instanceof Map) {
      rawGrades = Object.fromEntries(student.grades);
    } else if (typeof student.grades === "object") {
      rawGrades = student.grades;
    }
  }

  const enrolledSubjects = Array.isArray(student.enrolledSubjects) && student.enrolledSubjects.length > 0
    ? student.enrolledSubjects
    : Object.keys(rawGrades);

  const currentSubjectCode = selectedSubject || enrolledSubjects[0] || "";
  const subjectGradeData = rawGrades[currentSubjectCode] || {};

  const termData: TermGradeData = subjectGradeData[activeTerm] || {
    quizzes: "—",
    activities: "—",
    examination: "—",
    grade: "—",
  };

  const finalGradeDisplay = subjectGradeData.finalGrade ?? "—";

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
    const serverOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${serverOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const resolvedAvatarUrl = getFullAvatarUrl(student.avatarUrl);
  const showAvatar = Boolean(resolvedAvatarUrl) && !imageError;
  const capitalizedTerm = activeTerm.charAt(0).toUpperCase() + activeTerm.slice(1);

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-dark m-0">Student Profile & Academic Records</h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Pill Navigation */}
            <div className="bg-light p-1 rounded-3 mb-4 d-flex gap-1">
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "academics"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("academics")}
              >
                Academics & Grades
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-medium transition-all ${
                  activeTab === "contact"
                    ? "bg-white text-dark shadow-sm"
                    : "text-muted border-0 hover-bg-transparent"
                }`}
                onClick={() => setActiveTab("contact")}
              >
                Contact
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="tab-pane-content">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3 flex-shrink-0 overflow-hidden border"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#3b7a9e",
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
                      student.initials || student.name?.charAt(0) || "ST"
                    )}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{student.name}</h4>
                    <p className="text-secondary mb-2">{student.id}</p>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        isAtRisk ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {isAtRisk ? "At Risk" : "Active"}
                    </span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-3 rounded-4 h-100">
                      <span className="text-secondary small d-block mb-1">Course</span>
                      <strong className="text-dark fs-5">
                        {student.course || student.program || "BS Computer Science"}
                      </strong>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="bg-light p-3 rounded-4 h-100">
                      <span className="text-secondary small d-block mb-1">Year & Section</span>
                      <strong className="text-dark fs-5">
                        {yearDisplay} - {student.section || "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academics" && (
              <div className="d-flex flex-column gap-3">
                {/* Subject Selector & Term Selector Controls */}
                <div className="row g-2 align-items-center bg-light p-3 rounded-3 border">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Subject / Course</label>
                    <select
                      className="form-select form-select-sm"
                      value={currentSubjectCode}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      {enrolledSubjects.length === 0 ? (
                        <option value="">No Enrolled Subjects</option>
                      ) : (
                        enrolledSubjects.map((subCode) => (
                          <option key={subCode} value={subCode}>
                            {subCode}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted mb-1">Select Term</label>
                    <div className="btn-group w-100" role="group">
                      {(["prelim", "midterm", "finals"] as const).map((term) => (
                        <button
                          key={term}
                          type="button"
                          className={`btn btn-sm ${
                            activeTerm === term ? "btn-primary" : "btn-outline-secondary"
                          }`}
                          onClick={() => setActiveTerm(term)}
                        >
                          {term.charAt(0).toUpperCase() + term.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Term Grades Breakdown Card */}
                <div className="border rounded-4 p-3 bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                      <BookOpen size={18} /> {capitalizedTerm} Breakdown ({currentSubjectCode || "General"})
                    </h6>
                    <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2 fs-6">
                     Term Grade: {termData.grade !== undefined && termData.grade !== "—" ? termData.grade : "—"}
                    </span>
                  </div>

                  <div className="row g-2 text-center">
                    <div className="col-4">
                      <div className="p-2 bg-light rounded-3">
                        <small className="text-muted d-block">Quizzes</small>
                        <strong className="text-dark fs-6">
                          {termData.quizzes !== "" && termData.quizzes !== undefined ? termData.quizzes : "—"}
                        </strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 bg-light rounded-3">
                        <small className="text-muted d-block">Activities</small>
                        <strong className="text-dark fs-6">
                          {termData.activities !== "" && termData.activities !== undefined ? termData.activities : "—"}
                        </strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 bg-light rounded-3">
                        <small className="text-muted d-block">Examination</small>
                        <strong className="text-dark fs-6">
                          {termData.examination !== "" && termData.examination !== undefined ? termData.examination : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cumulative Final Grade Display Box */}
                <div className="p-3 bg-success-subtle border border-success-subtle rounded-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success text-white p-2 rounded-3">
                      <Award size={22} />
                    </div>
                    <div>
                      <span className="text-muted small d-block fw-semibold">Overall Final Grade</span>
                      <strong className="text-success fs-5">{finalGradeDisplay}</strong>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small d-block">Attendance Rate</span>
                    <strong className="text-dark">{attendanceRate}%</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="d-flex flex-column gap-3">
                <div className="bg-light p-3 rounded-4 d-flex align-items-center gap-3">
                  <div className="text-secondary flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Email</span>
                    <strong className="text-dark">
                      {student.email || `${student.name.toLowerCase().replace(/\s+/g, ".")}@university.edu`}
                    </strong>
                  </div>
                </div>

                <div className="bg-light p-3 rounded-4 d-flex align-items-center gap-3">
                  <div className="text-secondary flex-shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="text-secondary small d-block">Phone</span>
                    <strong className="text-dark">{displayPhone}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}